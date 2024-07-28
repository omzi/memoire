import prisma from '#/lib/prisma';
import { Redis } from '@upstash/redis';
import StreamPot from '#/lib/StreamPot';
import { getToken } from 'next-auth/jwt';
import { reorderByField } from '#/lib/utils';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 90;
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, '12 h')
});
const streampot = new StreamPot({ secret: `${process.env.STREAMPOT_API_KEY}` });

export const GET = async (req: NextRequest, res: NextResponse) => {
	const token = await getToken({ req });
	if (!token) {
    return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
  }

  const { success } = await ratelimit.limit(`generatePreview-${token.sub}`);
  if (!success) {
    return new Response('Rate limited!', { status: 429 });
  }

	const { searchParams } = req.nextUrl;
	const projectId = searchParams.get('projectId');

	if (!projectId) {
		return NextResponse.json({ message: 'Invalid request. Provide projectId.' }, { status: 400 });
	}

	const [project, media, narration] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId, userId: token.sub } }),
    prisma.media.findMany({ where: { projectId } }),
    prisma.narration.findUnique({ where: { projectId }, select: { transcript: true, audioUrl: true, voice: true } })
  ]);

  if (!project) {
		return new Response('Project not found!', { status: 400 });
	}
  if (!narration) {
		return new Response('Narration not found!', { status: 400 });
	}
  if (!narration.audioUrl) {
		return new Response('Narration audio not found!', { status: 400 });
	}
  if (media.length === 0) {
		return new Response('No media uploaded yet!', { status: 400 });
	}

	const mediaItems = reorderByField(media, project.mediaOrder, 'id');

	// Process media items
  const filterComplex = [];
  let lastStream = 'base';
  let filterIndex = 0;
  let offset = 0;
  const frameRate = project.frameRate || 24;

  for (const media of mediaItems) {
    streampot.input(media.url);
    streampot.addInputOptions(['-loop', '1', '-t', media.duration.toString()]);

    const currentStream = `v${filterIndex}`;
    const loopDuration = media.duration * frameRate;

    if (media.type === 'PHOTO') {
      filterComplex.push(`[${filterIndex}:v]scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,loop=${loopDuration}:${loopDuration}:0,fps=${frameRate}[${currentStream}]`);
    } else {
      filterComplex.push(`[${filterIndex}:v]scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${frameRate}[${currentStream}]`);
    }

    if (lastStream !== 'base') {
      const transitionOffset = offset + media.duration - 1; // Adjust offset for transition
      filterComplex.push(`[${lastStream}][${currentStream}]xfade=transition=${media.transition}:duration=1:offset=${transitionOffset}[${currentStream}]`);
      offset += media.duration - 1; // Subtract 1 for the transition overlap
    } else {
      offset += media.duration;
    }

    lastStream = currentStream;
    filterIndex++;
  }

  const combinedFilter = filterComplex.join(';');

  try {
    streampot.input(narration.audioUrl);
    streampot.audioCodec('aac');
    streampot.audioBitrate('192k');
    streampot.videoCodec('libx264');
    streampot.videoBitrate('1000k', true);
    streampot.outputOptions([
			'-filter_complex', combinedFilter,
      '-map', `[${lastStream}]`,
      '-map', `${mediaItems.length}:a`,
      '-shortest',
      '-pix_fmt', 'yuv420p',
      `-aspect`, project.aspectRatio,
      `-r`, `${frameRate}`
    ]);
    streampot.output('generated.mp4');
    const clip = await streampot.runAndWait();

    const video = clip.outputs['generated.mp4'];
		if (!video) {
			console.log('Preview Generation Logs :>>', clip.logs);
			return new Response('An error occurred!', { status: 500 });
		}

    console.log('Clip Outputs :>>', clip.outputs);
    console.log('Video :>>', video);

    return NextResponse.json({ message: 'Preview generated!', data: { preview: video } }, { status: 200 });
  } catch (error) {
    console.log('Preview Generation Error :>>', error);
    return new Response('Failed to generate preview!', { status: 500 });
  }
};

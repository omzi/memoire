import OpenAI from 'openai';
import { Voice } from '#/types';
import prisma from '#/lib/prisma';
import { Redis } from '@upstash/redis';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';
import { edgestoreBackendClient } from '#/lib/edgestoreServer';

export const maxDuration = 30;
const openai = new OpenAI();
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(6, '60 s')
});

export const POST = async (req: NextRequest, res: NextResponse) => {
	const token = await getToken({ req });
	if (!token) {
    return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
  }

  const { success } = await ratelimit.limit('generateNarration');
  if (!success) {
    return new Response('Rate limited!', { status: 429 });
  }

  const { projectId } = await req.json();
	
	const [project, narration] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId, userId: token.sub } }),
    prisma.narration.findUnique({ where: { projectId } })
  ]);

  if (!project) {
		return new Response('Project not found!', { status: 400 });
	}
  if (!narration) {
		return new Response('Narration not found!', { status: 400 });
	}
	
	try {
		const result = await openai.audio.speech.create({
			input: narration.transcript,
			model: 'tts-1',
			voice: narration.voice as Voice,
			response_format: 'mp3'
		});

		const audioBlob = await result.blob();
		const buffer = Buffer.from(await audioBlob.arrayBuffer());
		const url = 'data:' + audioBlob.type + ';base64,' + buffer.toString('base64');
		const uploadResult = await edgestoreBackendClient.projectFiles.upload({
			content: { url, extension: 'mp3' }
		});

		if (narration.audioUrl) {
			await edgestoreBackendClient.projectFiles.deleteFile({ url: narration.audioUrl });
		}

		const updatedNarration = await prisma.narration.update({
			where: { id: narration.id },
			data: { audioUrl: uploadResult.url }
		})

		return NextResponse.json({ message: 'Audio generated!', data: updatedNarration }, { status: 201 });
	} catch (error) {
		console.log('Narration Generation Error :>>', error);
		return new Response('Failed to generate narration!', { status: 500 });
	}
};

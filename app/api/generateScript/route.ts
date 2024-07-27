import prisma from '#/lib/prisma';
import { generateObject } from 'ai';
import { Redis } from '@upstash/redis';
import { google } from '@ai-sdk/google';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';
import { NarrationGenerationSchema } from '#/lib/validations';

export const maxDuration = 30;
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(6, '60 s')
});

export const POST = async (req: NextRequest, res: NextResponse) => {
	const token = await getToken({ req });
	if (!token) {
    return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
  }

  const { success } = await ratelimit.limit('generateScript');
  if (!success) {
    return new Response('Rate limited!', { status: 429 });
  }

  const { projectId } = await req.json();
	
	const [project, media] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId, userId: token.sub } }),
    prisma.media.findMany({ where: { projectId } })
  ]);

  if (!project) {
		return new Response('Project not found!', { status: 400 });
	}
  if (!project.description) {
		return new Response('Project description not found!', { status: 400 });
	}
  if (media.length === 0) {
		return new Response('No media uploaded yet!', { status: 400 });
	}

	const hasDescriptionMedia = media.filter($ => $.description && $.description.trim() !== '');
	if (hasDescriptionMedia.length !== media.length) {
		return new Response('One or more media descriptions are missing!', { status: 400 });
	}

	const formattedMedia = media.map($ => {
		return {
			id: $.id,
			type: $.type,
			description: $.description,
			duration: $.duration
		}
	});

  console.log('formattedMedia :>>', formattedMedia);
	
  const model = google('models/gemini-1.5-pro-latest', {
		safetySettings: [
			{
				category: 'HARM_CATEGORY_HARASSMENT',
				threshold: 'BLOCK_NONE'
			},
			{
				category: 'HARM_CATEGORY_HATE_SPEECH',
				threshold: 'BLOCK_NONE'
			},
			{
				category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
				threshold: 'BLOCK_NONE'
			},
			{
				category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
				threshold: 'BLOCK_NONE'
			}
		]
	});

	const prompt = `You are an event video scriptwriter.
Please draft a script that chronologically narrates a series of photos and videos from an event, based on a provided description of the event & an array of media items.

Specifics:
1. Narrate each item using details like place, date, time, and description in a story format, using first-person and past tense.
2. The script should mimic a casual storytelling session, as if explaining the trip to friends or family.
3. Infer logical placements for media items lacking complete information, ensuring continuity and context without guessing.
4. Ensure the narration covers all items once, with video narrations tailored to not exceed their duration.
5. Use short, clear sentences to maintain engagement and clarity in each scene's narration.

Output JSON only in the format like in the example below:

{
  "title": "Our Grand Canyon Adventure",
  "description": "Join us on our unforgettable road trip to the Grand Canyon, as we explore stunning landscapes and experience the beauty of one of the world's natural wonders.",
  "hashtags": ["#GrandCanyon, "#Trip"],
  "mediaItems": [
    {
      "id": "64c146bcd5e9ec007c57a17b",
      "type": "video",
      "text": "Hey everyone! We're hitting the road at the crack of dawn, super excited to start our adventure to the Grand Canyon. Everything's packed, and we're ready to go!"
    },
    {
      "id": "64c146bcd5e9ec007c57a17c",
      "type": "photo",
      "text": "Look at this view, folks! Miles of open road ahead of us. The landscapes are just stunning and the vibe in the car is just full of anticipation."
    },
    {
      "id": "64c146bcd5e9ec007c57a17d",
      "type": "video",
      "text": "And we're here! Stepping into the Grand Canyon National Park now. I can't wait to show you all the incredible views we've been talking about."
    },
    {
      "id": "64c146bcd5e9ec007c57a17e",
      "type": "photo",
      "text": "Here's our first stop. Just take in this breathtaking panorama of the canyon. The sheer size and beauty of it all is something you have to see to believe!"
    },
    {
      "id": "64c146bcd5e9ec007c57a17f",
      "type": "video",
      "text": "Nothing tops this, right? Watching the sunset over the Grand Canyon. The sky's turning into a canvas of oranges, pinks, and reds. It’s moments like these that make this trip unforgettable."
    },
    {
      "id": "64c146bcd5e9ec007c57a170",
      "type": "photo",
      "text": "Ending our day around the campfire, under the stars. Sharing stories, roasting marshmallows. It's the perfect way to wrap up a perfect day. Thanks for joining us, and see you on the next adventure!"
    }
  ]
}

Here's the project description: ${project.description}

Here are the media items: ${formattedMedia}`;

  const result = await generateObject({
    model,
		prompt,
		schema: NarrationGenerationSchema,
		mode: 'json'
  });

  return result.toJsonResponse();
};

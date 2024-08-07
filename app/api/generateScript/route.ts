import prisma from '#/lib/prisma';
import { generateObject } from 'ai';
import { Redis } from '@upstash/redis';
import { google } from '@ai-sdk/google';
import { getToken } from 'next-auth/jwt';
import { wordsInSeconds } from '#/lib/utils';
import { createOpenAI } from '@ai-sdk/openai';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';
import { NarrationGenerationSchema } from '#/lib/validations';

export const maxDuration = 30;
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(6, '60 s')
});
const ai71 = createOpenAI({
  baseURL: 'https://api.ai71.ai/v1/',
  apiKey: process.env.AI71_API_KEY,
  compatibility: 'compatible'
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
	
	const [project, media, narration] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId, userId: token.sub } }),
    prisma.media.findMany({ where: { projectId } }),
    prisma.narration.findUnique({ where: { projectId } })
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
			duration: $.duration,
      narrationWordCount: wordsInSeconds($.duration, 182)
		}
	});
  
  const totalDuration = media.reduce((total, item) => total + item.duration, 0);

  const model = ai71('tiiuae/falcon-180b-chat');
  console.log('AI71 Model :>>', model);

	const prompt = `You are an event video scriptwriter.
Please draft a script that chronologically narrates a series of photos and videos from a project, based on a provided description of the event & an array of media items (containing the ID, the type of media, the duration it's narration should be, the description of the media, and the EXACT word count of the narration you'll generate for the media).

Instructions:
1. Narrate each item using details from the media description in a story format, using first-person and past tense.
2. The script should mimic a casual storytelling session, as if explaining the trip to friends or family.
3. Ensure continuity and context without making up things outside of the media descriptions.
4. Use short, clear sentences to maintain engagement and clarity in each media's narration.
5. Ensure the narration covers all items once, with each & every media narrations not exceeding their respective script word count.
6. Let the narration of ALL medias combined be EXACTLY ${wordsInSeconds(totalDuration, 182)} words.
7. Do not reference the media type in your narrations. The user can see what media type is being narrated.
8. If the project deascription does not make sense, use the media descriptions to figure out what the project is about.

Output JSON only in the format like in the example below:

{
  "title": "Our Grand Canyon Adventure",
  "description": "Join us on our unforgettable road trip to the Grand Canyon, as we explore stunning landscapes and experience the beauty of one of the world's natural wonders.",
  "hashtags": ["#GrandCanyon, "#Trip"],
  "mediaItems": [
    {
      "id": "64c146bcd5e9ec007c57a17b",
      "type": "VIDEO",
      "text": "Hey everyone! We're hitting the road at the crack of dawn, super excited to start our adventure to the Grand Canyon. Everything's packed, and we're ready to go!"
    },
    {
      "id": "64c146bcd5e9ec007c57a17c",
      "type": "PHOTO",
      "text": "Look at this view, folks! Miles of open road ahead of us. The landscapes are just stunning and the vibe in the car is just full of anticipation."
    },
    {
      "id": "64c146bcd5e9ec007c57a17d",
      "type": "VIDEO",
      "text": "And we're here! Stepping into the Grand Canyon National Park now. I can't wait to show you all the incredible views we've been talking about."
    },
    {
      "id": "64c146bcd5e9ec007c57a17e",
      "type": "PHOTO",
      "text": "Here's our first stop. Just take in this breathtaking panorama of the canyon. The sheer size and beauty of it all is something you have to see to believe!"
    },
    {
      "id": "64c146bcd5e9ec007c57a17f",
      "type": "VIDEO",
      "text": "Nothing tops this, right? Watching the sunset over the Grand Canyon. The sky's turning into a canvas of oranges, pinks, and reds. It's moments like these that make this trip unforgettable."
    },
    {
      "id": "64c146bcd5e9ec007c57a170",
      "type": "PHOTO",
      "text": "Ending our day around the campfire, under the stars. Sharing stories, roasting marshmallows. It's the perfect way to wrap up a perfect day. Thanks for joining us, and see you on the next adventure!"
    }
  ]
}

Here's the project description: ${project.description}
Here are the media items: ${formattedMedia}.

Use them to generate a JSON output similar to the JSON example above.`;

  const result = await generateObject({
    model,
		prompt,
    temperature: 0.5,
		schema: NarrationGenerationSchema,
		mode: 'json'
  });

	const transcript = result.object.mediaItems.map($ => $.text).join('\n\n');

  if (narration) {
    await prisma.narration.update({ where: { id: narration.id }, data: { transcript } });
  } else {
    await prisma.narration.create({ data: { transcript, projectId: project.id } });
  }

  return result.toJsonResponse();
};

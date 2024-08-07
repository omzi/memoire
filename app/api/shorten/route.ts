import { streamText } from 'ai';
import prisma from '#/lib/prisma';
import { Redis } from '@upstash/redis';
import { getToken } from 'next-auth/jwt';
import { secondsToWords } from '#/lib/utils';
import { createOpenAI } from '@ai-sdk/openai';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '60 s')
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

  const { success } = await ratelimit.limit('shorten');
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
  if (!narration || (narration && narration.transcript.length === 0)) {
		return new Response('No narration yet!', { status: 400 });
	}
	if (media.length === 0) {
		return new Response('No media uploaded yet!', { status: 400 });
	}

	const hasDescriptionMedia = media.filter($ => $.description && $.description.trim() !== '');
	if (hasDescriptionMedia.length !== media.length) {
		return new Response('One or more media descriptions are missing!', { status: 400 });
	}
  
  const totalDuration = media.reduce((total, item) => total + item.duration, 0);
	console.log('totalDuration :>>', totalDuration);
	console.log('wordCount :>>', secondsToWords(totalDuration));

  const model = ai71('tiiuae/falcon-180b-chat');

	const prompt = `You are an AI writing assistant that shortens existing text to a given number of words EXACTLY, while preserving line breaks.
	
Reply in plain text with line breaks preserved from the existing text.
	
The existing text is: ${narration.transcript}. Shorten it to ${secondsToWords(totalDuration)} words.`;
	
	const result = await streamText({
    model,
    prompt,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
  });

  return result.toAIStreamResponse();
};

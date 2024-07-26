import rateLimit from '#/lib/rateLimit';
import { google } from '@ai-sdk/google';
import { type CoreMessage, streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export const POST = async (req: NextRequest, res: NextResponse) => {
  const isRateLimited = await rateLimit(req, res);
  if (isRateLimited) {
    return new Response('Rate limited!', { status: 429 });
  }

  const { prompt, url, type, } = await req.json();
  console.log('Description :>>', prompt);
  console.log('Media URL :>>', url);
	const context = prompt.length > 0
		? `Here's a brief description of the image from the user:
		---------------------------------------------------------
		${prompt}
		---------------------------------------------------------

		If it makes sense, use it as a context to come up with better descriptions.`
		: '';

	const mediaType = `${type}`.toLowerCase(); 
  const messages = [
    {
      role: 'system',
      content: `You are a ${mediaType} description expert. Conduct an in-depth analysis of the uploaded ${mediaType}, exploring its creative background, emotional expression, the story behind the work, and its meanings. Send it as a summary of not more than ${mediaType === 'photo' ? 75 : 150} words & 400 characters. ${mediaType === 'video' && 'The description should also contain anything important said or inferred in the video.'} DO NOT send a response outside what you're told to send. Regardless of the language the user uses, always stick to English in your description. ${context}`
    },
    {
      role: 'user',
      content: [{ type: 'image', image: url }]
    }
  ] as CoreMessage[];

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
  const result = await streamText({
    model,
    messages,
    maxTokens: mediaType === 'photo' ? 100 : 200,
    temperature: 0.9,
    topK: 1
  });

  return result.toAIStreamResponse();
};

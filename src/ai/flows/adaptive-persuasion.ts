
'use server';
/**
 * @fileOverview An AI flow for generating a personalized proposal letter.
 *
 * - generateLetter - A function that calls the Genkit flow to generate a letter.
 */

import {ai} from '@/ai/genkit';
import {
  LetterGenerationInputSchema,
  type LetterGenerationInput,
  LetterGenerationOutputSchema,
  type LetterGenerationOutput,
} from '@/ai/schemas/adaptive-persuasion';

export async function generateLetter(
  input: LetterGenerationInput
): Promise<LetterGenerationOutput> {
  return generateLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLetterPrompt',
  input: {schema: LetterGenerationInputSchema},
  output: {schema: LetterGenerationOutputSchema},
  prompt: `You are an expert romantic writer. Your task is to write a heartfelt, beautiful, and personalized marriage proposal letter.

The letter is for a person named {{{recipientName}}}.

Use the following keywords and themes to inspire the content and tone of the letter: {{{keywords}}}.

The letter should be deeply personal and romantic. End it with a question like "Will you marry me?". Do not sign the letter. The user will add their own name.
`,
});

const generateLetterFlow = ai.defineFlow(
  {
    name: 'generateLetterFlow',
    inputSchema: LetterGenerationInputSchema,
    outputSchema: LetterGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

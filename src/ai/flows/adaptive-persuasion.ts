'use server';

/**
 * @fileOverview This file defines a Genkit flow for adaptive persuasion, adjusting button text and animation speeds based on user interaction.
 *
 * The flow uses AI to analyze user emotional response (based on interaction patterns) and modifies the 'No' button's text and animation speeds to enhance persuasion and engagement.
 *
 * - `analyzeAndAdapt`: An async function that takes user interaction data and returns adapted button properties.
 * - `AdaptivePersuasionInput`: The input type for `analyzeAndAdapt`, representing user interaction data.
 * - `AdaptivePersuasionOutput`: The output type for `analyzeAndAdapt`, providing adjusted button text and animation speeds.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptivePersuasionInputSchema = z.object({
  noButtonClicks: z.number().describe('Number of times the No button has been clicked.'),
  timeOnPage: z.number().describe('Time spent on the page in seconds.'),
  previousText: z.string().describe('The text which was previously displayed on the No button.'),
});
export type AdaptivePersuasionInput = z.infer<typeof AdaptivePersuasionInputSchema>;

const AdaptivePersuasionOutputSchema = z.object({
  newText: z.string().describe('The new text to display on the No button.'),
  animationSpeedMultiplier: z.number().describe('Multiplier for the animation speed of the No button.'),
});
export type AdaptivePersuasionOutput = z.infer<typeof AdaptivePersuasionOutputSchema>;

export async function analyzeAndAdapt(input: AdaptivePersuasionInput): Promise<AdaptivePersuasionOutput> {
  return adaptivePersuasionFlow(input);
}

const adaptivePersuasionPrompt = ai.definePrompt({
  name: 'adaptivePersuasionPrompt',
  input: {schema: AdaptivePersuasionInputSchema},
  output: {schema: AdaptivePersuasionOutputSchema},
  prompt: `You are an AI assistant designed to help create persuasive user experiences.

  Based on the user's interaction with a proposal page, you will adapt the text and animation speed of the 'No' button to increase engagement and encourage a 'Yes' response.

  Here's the user interaction data:
  - Number of 'No' button clicks: {{{noButtonClicks}}}
  - Time spent on the page: {{{timeOnPage}}} seconds
  - Previous button text: {{{previousText}}}

  Consider these factors to adapt the 'No' button:
  - **Engagement**: If the user has clicked 'No' multiple times, they are somewhat engaged. Increase the animation speed and use more emotionally charged text.
  - **Patience**: If the user has spent a lot of time on the page without clicking 'Yes', they might be hesitant. Use softer, more reassuring text and slightly slower animations.

  The output should provide the new text for the 'No' button and a multiplier for the animation speed. The animation speed multiplier should be between 0.5 (slower) and 1.5 (faster). New text should sound more and more desperate/emotive as the number of noButtonClicks increases.
  `,
});

const adaptivePersuasionFlow = ai.defineFlow(
  {
    name: 'adaptivePersuasionFlow',
    inputSchema: AdaptivePersuasionInputSchema,
    outputSchema: AdaptivePersuasionOutputSchema,
  },
  async input => {
    const {output} = await adaptivePersuasionPrompt(input);
    return output!;
  }
);

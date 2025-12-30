/**
 * @fileOverview Schemas and types for the adaptive-persuasion AI flow.
 */
import {z} from 'genkit';

export const LetterGenerationInputSchema = z.object({
  recipientName: z
    .string()
    .describe('The name of the person receiving the letter.'),
  keywords: z
    .string()
    .describe(
      "A few keywords or themes for the letter (e.g., 'our adventures', 'your smile')."
    ),
});
export type LetterGenerationInput = z.infer<typeof LetterGenerationInputSchema>;

export const LetterGenerationOutputSchema = z.object({
  letter: z.string().describe('The generated proposal letter.'),
});
export type LetterGenerationOutput = z.infer<
  typeof LetterGenerationOutputSchema
>;

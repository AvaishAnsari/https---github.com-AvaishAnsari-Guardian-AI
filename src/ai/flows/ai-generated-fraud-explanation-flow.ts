'use server';
/**
 * @fileOverview An AI agent that generates natural language explanations for flagged financial transactions.
 *
 * - generateFraudExplanation - A function that generates an explanation for a suspicious transaction.
 * - AIGeneratedFraudExplanationInput - The input type for the generateFraudExplanation function.
 * - AIGeneratedFraudExplanationOutput - The return type for the generateFraudExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGeneratedFraudExplanationInputSchema = z.object({
  userId: z.string().describe('The ID of the user associated with the transaction.'),
  amount: z.number().describe('The transaction amount.'),
  location: z.string().describe('The location where the transaction occurred.'),
  device: z.string().describe('The device used for the transaction.'),
  timestamp: z.string().describe('The timestamp of the transaction in ISO format.'),
  riskScore: z.number().min(0).max(100).describe('The calculated fraud risk score for the transaction (0-100).'),
  amountRatio: z.number().describe('The ratio of the current amount to the user\'s average.'),
  reasons: z.object({
    amountSignificantDeviation: z.boolean().describe('True if the transaction amount significantly deviates from the user\'s average.'),
    newDeviceDetected: z.boolean().describe('True if the transaction was made from a new or unrecognized device.'),
    unusualTime: z.boolean().describe('True if the transaction occurred at an unusual time for the user.'),
    locationChange: z.boolean().describe('True if a significant location change was detected for the transaction.'),
    highFrequency: z.boolean().optional().describe('True if the transaction is part of a high-frequency pattern.'),
    unusualMerchant: z.boolean().optional().describe('True if the transaction is with an unusual or new merchant.'),
    newBeneficiary: z.boolean().optional().describe('True if the transfer is to a newly added beneficiary.'),
  }).describe('A collection of boolean flags indicating specific reasons for the transaction being high-risk.'),
});
export type AIGeneratedFraudExplanationInput = z.infer<typeof AIGeneratedFraudExplanationInputSchema>;

const AIGeneratedFraudExplanationOutputSchema = z.object({
  explanation: z.string().describe('A natural language explanation for why the transaction was flagged as suspicious.'),
});
export type AIGeneratedFraudExplanationOutput = z.infer<typeof AIGeneratedFraudExplanationOutputSchema>;

export async function generateFraudExplanation(input: AIGeneratedFraudExplanationInput): Promise<AIGeneratedFraudExplanationOutput> {
  return aiGeneratedFraudExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fraudExplanationPrompt',
  input: {schema: AIGeneratedFraudExplanationInputSchema},
  output: {schema: AIGeneratedFraudExplanationOutputSchema},
  prompt: `You are an AI assistant specialized in financial fraud detection. Your task is to provide a clear, concise, and natural language explanation for why a given financial transaction was flagged as suspicious. 

Transaction Details:
Amount: {{{amount}}}
Ratio to Average: {{{amountRatio}}}x
Location: {{{location}}}
Device: {{{device}}}

Detected Anomalies:
{{#if reasons.amountSignificantDeviation}}- Transaction amount is {{{amountRatio}}}x higher than user's typical average.
{{/if}}{{#if reasons.newDeviceDetected}}- Transaction was made from a new or unrecognized device signature.
{{/if}}{{#if reasons.unusualTime}}- Activity occurred at an unusual time, outside the established baseline hours.
{{/if}}{{#if reasons.locationChange}}- Impossible travel detected: Location changed significantly from typical clusters.
{{/if}}{{#if reasons.highFrequency}}- Rapid transaction velocity detected within a 5-minute window.
{{/if}}{{#if reasons.newBeneficiary}}- Funds transferred to a beneficiary added less than 3 minutes before the transaction.
{{/if}}

Provide a one-paragraph summary that highlights the most critical triggers.`,
});

const aiGeneratedFraudExplanationFlow = ai.defineFlow(
  {
    name: 'aiGeneratedFraudExplanationFlow',
    inputSchema: AIGeneratedFraudExplanationInputSchema,
    outputSchema: AIGeneratedFraudExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

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
  reasons: z.object({
    amountSignificantDeviation: z.boolean().describe('True if the transaction amount significantly deviates from the user\'s average.'),
    newDeviceDetected: z.boolean().describe('True if the transaction was made from a new or unrecognized device.'),
    unusualTime: z.boolean().describe('True if the transaction occurred at an unusual time for the user.'),
    locationChange: z.boolean().describe('True if a significant location change was detected for the transaction.'),
    highFrequency: z.boolean().optional().describe('True if the transaction is part of a high-frequency pattern.'),
    unusualMerchant: z.boolean().optional().describe('True if the transaction is with an unusual or new merchant.'),
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
  prompt: `You are an AI assistant specialized in financial fraud detection. Your task is to provide a clear, concise, and natural language explanation for why a given financial transaction was flagged as suspicious. Focus on explaining the specific reasons for the risk in an easy-to-understand manner.

Transaction Details:
User ID: {{{userId}}}
Amount: {{{amount}}}
Location: {{{location}}}
Device: {{{device}}}
Timestamp: {{{timestamp}}}
Calculated Risk Score: {{{riskScore}}}

Detected Anomalies:
{{#if reasons.amountSignificantDeviation}}- The transaction amount is significantly higher than the user's typical average.
{{/if}}{{#if reasons.newDeviceDetected}}- The transaction was made from a new or unrecognized device.
{{/if}}{{#if reasons.unusualTime}}- The transaction occurred at an unusual time for the user, outside of their normal activity patterns.
{{/if}}{{#if reasons.locationChange}}- A significant change in transaction location was detected compared to the user's usual activity.
{{/if}}{{#if reasons.highFrequency}}- This transaction is part of a high-frequency pattern, which can indicate unusual activity.
{{/if}}{{#if reasons.unusualMerchant}}- The transaction is with an unusual or previously un-encountered merchant for this user.
{{/if}}

Provide the explanation below, summarizing the key reasons in a single paragraph:`,
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

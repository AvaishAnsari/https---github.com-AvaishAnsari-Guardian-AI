'use server';
/**
 * @fileOverview This file implements a Genkit flow for real-time financial transaction risk scoring.
 * It analyzes new transactions against user behavioral profiles to assign a fraud risk score and breakdown.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionInputSchema = z.object({
  userId: z.string().describe('The unique identifier for the user performing the transaction.'),
  amount: z.number().describe('The raw amount of the transaction.'),
  location: z.string().describe('The geographic location from which the transaction was initiated.'),
  device: z.string().describe('The device used to perform the transaction.'),
  timestamp: z.string().datetime().describe('The timestamp of the transaction in ISO 8601 format.'),
  engineeredFeatures: z.object({
    amountRatio: z.number().describe('The ratio of the current transaction amount to the user\'s average transaction amount.'),
    unusualTime: z.boolean().describe('True if the transaction occurred at an unusual time for the user.'),
    locationChange: z.boolean().describe('True if the transaction location is significantly different.'),
    newDevice: z.boolean().describe('True if the device used is new.'),
  }),
  userProfile: z.object({
    averageAmount: z.number(),
    typicalLocations: z.array(z.string()),
    typicalTimeRange: z.object({ start: z.string(), end: z.string() }),
    typicalDevices: z.array(z.string()),
  }),
});
export type TransactionInput = z.infer<typeof TransactionInputSchema>;

const TransactionOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe('A fraud risk score from 0 to 100.'),
  riskBreakdown: z.object({
    amountRisk: z.number().describe('Contribution of transaction amount to risk (0-40).'),
    deviceRisk: z.number().describe('Contribution of device anomaly to risk (0-20).'),
    locationRisk: z.number().describe('Contribution of location anomaly to risk (0-20).'),
    timeRisk: z.number().describe('Contribution of time anomaly to risk (0-20).'),
  }).describe('A breakdown of how different factors contributed to the total risk score.'),
});
export type TransactionOutput = z.infer<typeof TransactionOutputSchema>;

export async function calculateFraudRisk(input: TransactionInput): Promise<TransactionOutput> {
  return aiPoweredTransactionRiskScoringFlow(input);
}

const aiPoweredTransactionRiskScoringPrompt = ai.definePrompt({
  name: 'aiPoweredTransactionRiskScoringPrompt',
  input: { schema: TransactionInputSchema },
  output: { schema: TransactionOutputSchema },
  prompt: `You are an AI-powered financial fraud detection engine.
Assign a total risk score (0-100) and a detailed breakdown.
Max points: Amount (40), Device (20), Location (20), Time (20).

Transaction Data:
Amount: {{{amount}}}
Location: {{{location}}}
Device: {{{device}}}

Deviations:
- Amount Ratio: {{{engineeredFeatures.amountRatio}}}
- Unusual Time: {{{engineeredFeatures.unusualTime}}}
- Location Change: {{{engineeredFeatures.locationChange}}}
- New Device: {{{engineeredFeatures.newDevice}}}

Calculate the risk score and provide the breakdown values.`,
});

const aiPoweredTransactionRiskScoringFlow = ai.defineFlow(
  {
    name: 'aiPoweredTransactionRiskScoringFlow',
    inputSchema: TransactionInputSchema,
    outputSchema: TransactionOutputSchema,
  },
  async (input) => {
    const {output} = await aiPoweredTransactionRiskScoringPrompt(input);
    return output!;
  }
);

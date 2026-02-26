'use server';
/**
 * @fileOverview This file implements a Genkit flow for real-time financial transaction risk scoring.
 * It analyzes new transactions against user behavioral profiles to assign a fraud risk score.
 *
 * - calculateFraudRisk - A function that handles the transaction risk scoring process.
 * - TransactionInput - The input type for the calculateFraudRisk function.
 * - TransactionOutput - The return type for the calculateFraudRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const TransactionInputSchema = z.object({
  userId: z.string().describe('The unique identifier for the user performing the transaction.'),
  amount: z.number().describe('The raw amount of the transaction.'),
  location: z.string().describe('The geographic location from which the transaction was initiated.'),
  device: z.string().describe('The device used to perform the transaction.'),
  timestamp: z.string().datetime().describe('The timestamp of the transaction in ISO 8601 format.'),
  engineeredFeatures: z.object({
    amountRatio: z.number().describe('The ratio of the current transaction amount to the user\'s average transaction amount. E.g., 2.5 means 2.5 times the average.'),
    unusualTime: z.boolean().describe('True if the transaction occurred at an unusual time for the user, false otherwise.'),
    locationChange: z.boolean().describe('True if the transaction location is significantly different from the user\'s typical locations, false otherwise.'),
    newDevice: z.boolean().describe('True if the device used for the transaction is new or not typically used by the user, false otherwise.'),
  }).describe('Machine-readable features derived from the raw transaction data and user profile.'),
  userProfile: z.object({
    averageAmount: z.number().describe('The user\'s historical average transaction amount.'),
    typicalLocations: z.array(z.string()).describe('A list of typical geographic locations for the user\'s transactions.'),
    typicalTimeRange: z.object({
      start: z.string().describe('The typical start time (e.g., "09:00") for user transactions.'),
      end: z.string().describe('The typical end time (e.g., "20:00") for user transactions.'),
    }).describe('The typical time range when the user performs transactions.'),
    typicalDevices: z.array(z.string()).describe('A list of devices typically used by the user for transactions.'),
  }).describe('The established behavioral profile for the user.'),
});
export type TransactionInput = z.infer<typeof TransactionInputSchema>;

// Output Schema
const TransactionOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe('A fraud risk score from 0 (no risk) to 100 (very high risk).'),
});
export type TransactionOutput = z.infer<typeof TransactionOutputSchema>;

// Wrapper function for the flow
export async function calculateFraudRisk(input: TransactionInput): Promise<TransactionOutput> {
  return aiPoweredTransactionRiskScoringFlow(input);
}

// Genkit Prompt Definition
const aiPoweredTransactionRiskScoringPrompt = ai.definePrompt({
  name: 'aiPoweredTransactionRiskScoringPrompt',
  input: { schema: TransactionInputSchema },
  output: { schema: TransactionOutputSchema },
  prompt: `You are an AI-powered financial fraud detection engine.\nYour primary goal is to analyze financial transactions in real-time and assign a fraud risk score from 0 (no risk) to 100 (very high risk).\n\nHere is the current transaction data:\nUser ID: {{{userId}}}\nAmount: {{{amount}}}\nLocation: {{{location}}}\nDevice: {{{device}}}\nTimestamp: {{{timestamp}}}\n\nHere are the engineered features, which highlight deviations from the user's normal behavior:\n- Amount Ratio (vs. average): {{{engineeredFeatures.amountRatio}}}\n- Unusual Time: {{{engineeredFeatures.unusualTime}}}\n- Location Change: {{{engineeredFeatures.locationChange}}}\n- New Device: {{{engineeredFeatures.newDevice}}}\n\nHere is the user's established behavioral profile:\n- Average Amount: {{{userProfile.averageAmount}}}\n- Typical Locations: {{{userProfile.typicalLocations}}}\n- Typical Time Range: {{{userProfile.typicalTimeRange.start}}} - {{{userProfile.typicalTimeRange.end}}}\n- Typical Devices: {{{userProfile.typicalDevices}}}\n\nYour task is to compare this new transaction against the user's profile and the engineered features.\nAssign risk points based on the severity of each deviation.\nThe higher the deviation, the higher the risk.\nFor example, a transaction amount 47 times the normal average, a new device, an unusual time, and a location change together would result in a very high risk score like 92.\nThe final risk score should be a single number from 0 to 100.\n`,
});

// Genkit Flow Definition
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

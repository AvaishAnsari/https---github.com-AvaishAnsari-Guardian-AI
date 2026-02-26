'use server';
/**
 * @fileOverview Enhanced risk scoring with pattern detection and model confidence.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionInputSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  location: z.string(),
  device: z.string(),
  timestamp: z.string(),
  engineeredFeatures: z.object({
    amountRatio: z.number(),
    unusualTime: z.boolean(),
    locationChange: z.boolean(),
    newDevice: z.boolean(),
    velocityAlert: z.boolean(),
    structuringAlert: z.boolean(),
  }),
  userProfile: z.any(),
});

const TransactionOutputSchema = z.object({
  riskScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  category: z.enum(['Behavioral Anomaly', 'Pattern-Based Fraud', 'Geolocation Risk', 'Device Risk', 'Velocity Risk', 'Nominal']),
  riskBreakdown: z.object({
    amountRisk: z.number(),
    deviceRisk: z.number(),
    locationRisk: z.number(),
    timeRisk: z.number(),
    patternRisk: z.number(),
  }),
});

export async function calculateFraudRisk(input: z.infer<typeof TransactionInputSchema>) {
  return aiPoweredTransactionRiskScoringFlow(input);
}

const aiPoweredTransactionRiskScoringPrompt = ai.definePrompt({
  name: 'aiPoweredTransactionRiskScoringPrompt',
  input: { schema: TransactionInputSchema },
  output: { schema: TransactionOutputSchema },
  prompt: `You are an expert financial fraud detection engine.
Analyze the transaction and return a risk score (0-100), a model confidence score (0-100), and a fraud category.

Input Context:
- Amount Ratio: {{{engineeredFeatures.amountRatio}}}
- Velocity Alert: {{{engineeredFeatures.velocityAlert}}}
- Structuring Alert: {{{engineeredFeatures.structuringAlert}}}
- Location Change: {{{engineeredFeatures.locationChange}}}
- New Device: {{{engineeredFeatures.newDevice}}}

Assign points (Max 100 total):
- Amount (30)
- Device (15)
- Location (15)
- Time (10)
- Patterns (Velocity/Structuring) (30)

Provide the category based on the strongest indicator.`,
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

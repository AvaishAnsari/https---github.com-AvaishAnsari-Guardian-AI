import { UserProfile, Transaction } from './types';

// Use a fixed date to avoid hydration mismatches across server and client
const FIXED_TIMESTAMP = "2025-05-20T10:00:00Z";

export const MOCK_PROFILES: Record<string, UserProfile> = {
  'USER_001': {
    userId: 'USER_001',
    name: 'Rahul Sharma',
    averageAmount: 1250,
    typicalLocations: ['Bangalore', 'Mumbai'],
    typicalDevices: ['iPhone 15', 'MacBook Pro'],
    typicalTimeRange: { start: '09:00', end: '20:00' },
  },
  'USER_002': {
    userId: 'USER_002',
    name: 'Sarah Chen',
    averageAmount: 4500,
    typicalLocations: ['Singapore', 'Kuala Lumpur'],
    typicalDevices: ['Samsung S24 Ultra'],
    typicalTimeRange: { start: '07:00', end: '23:00' },
  },
  'USER_003': {
    userId: 'USER_003',
    name: 'Michael Scott',
    averageAmount: 200,
    typicalLocations: ['Scranton'],
    typicalDevices: ['Surface Pro 9'],
    typicalTimeRange: { start: '08:00', end: '17:00' },
  }
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX_101',
    caseId: 'CASE-7721',
    userId: 'USER_001',
    userName: 'Rahul Sharma',
    amount: 500,
    location: 'Bangalore',
    device: 'iPhone 15',
    timestamp: "2025-05-20T08:45:00Z",
    status: 'cleared',
    investigationStatus: 'pending',
    riskScore: 5,
    confidenceScore: 98,
    category: 'Nominal',
    riskLevel: 'low',
    riskBreakdown: {
      amountRisk: 2,
      deviceRisk: 1,
      locationRisk: 1,
      timeRisk: 1,
      patternRisk: 0
    },
    explanation: 'Transaction parameters align perfectly with established behavioral patterns. Amount is well within normal bounds, verified device used, and location is a frequent hotspot.'
  },
  {
    id: 'TX_103',
    caseId: 'CASE-7722',
    userId: 'USER_003',
    userName: 'Michael Scott',
    amount: 2850,
    location: 'New York',
    device: 'Surface Pro 9',
    timestamp: "2025-05-20T09:12:00Z",
    status: 'pending',
    investigationStatus: 'under_investigation',
    riskScore: 58,
    confidenceScore: 91,
    category: 'Geolocation Risk',
    riskLevel: 'medium',
    riskBreakdown: {
      amountRisk: 28,
      deviceRisk: 2,
      locationRisk: 18,
      timeRisk: 10,
      patternRisk: 0
    },
    explanation: 'Moderate risk detected due to a significant deviation in transaction volume (14x average). While the device is recognized, the location shift to New York adds to the anomaly score.'
  },
  {
    id: 'TX_102',
    caseId: 'CASE-7723',
    userId: 'USER_002',
    userName: 'Sarah Chen',
    amount: 145000,
    location: 'London',
    device: 'Unknown Android',
    timestamp: "2025-05-20T09:55:00Z",
    status: 'flagged',
    investigationStatus: 'pending',
    riskScore: 98,
    confidenceScore: 99,
    category: 'Behavioral Anomaly',
    riskLevel: 'high',
    riskBreakdown: {
      amountRisk: 40,
      deviceRisk: 20,
      locationRisk: 20,
      timeRisk: 15,
      patternRisk: 3
    },
    explanation: 'CRITICAL ALERT: Extreme transaction outlier detected. Amount of ₹1,45,000 is 32x the historical average of ₹4,500. Conducted from an unrecognized device in London (unusual location) at an anomalous time. High probability of account takeover.'
  }
];

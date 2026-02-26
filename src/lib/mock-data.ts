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
    userId: 'USER_001',
    userName: 'Rahul Sharma',
    amount: 500,
    location: 'Bangalore',
    device: 'iPhone 15',
    timestamp: FIXED_TIMESTAMP,
    status: 'cleared',
    riskScore: 5,
    riskLevel: 'low',
    riskBreakdown: {
      amountRisk: 2,
      deviceRisk: 1,
      locationRisk: 1,
      timeRisk: 1
    },
    explanation: 'Transaction parameters align perfectly with established behavioral patterns. Amount is well within normal bounds, verified device used, and location is a frequent hotspot.'
  },
  {
    id: 'TX_103',
    userId: 'USER_003',
    userName: 'Michael Scott',
    amount: 850,
    location: 'New York',
    device: 'Surface Pro 9',
    timestamp: FIXED_TIMESTAMP,
    status: 'pending',
    riskScore: 52,
    riskLevel: 'medium',
    riskBreakdown: {
      amountRisk: 25,
      deviceRisk: 2,
      locationRisk: 15,
      timeRisk: 10
    },
    explanation: 'Moderate risk detected due to a significant deviation in transaction volume (4x average). While the device is recognized, the location shift to New York adds to the anomaly score.'
  },
  {
    id: 'TX_102',
    userId: 'USER_002',
    userName: 'Sarah Chen',
    amount: 12000,
    location: 'London',
    device: 'Unknown Android',
    timestamp: FIXED_TIMESTAMP,
    status: 'flagged',
    riskScore: 88,
    riskLevel: 'high',
    riskBreakdown: {
      amountRisk: 38,
      deviceRisk: 18,
      locationRisk: 17,
      timeRisk: 15
    },
    explanation: 'Critical risk detected. Transaction amount is 2.6x the historical average. Conducted from an unrecognized Android device in London, which is outside the user\'s typical geographic footprint.'
  }
];

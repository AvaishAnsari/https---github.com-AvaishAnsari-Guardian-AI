import { UserProfile, Transaction } from './types';

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
    timestamp: new Date().toISOString(),
    status: 'cleared',
    riskScore: 5,
    riskLevel: 'low'
  },
  {
    id: 'TX_102',
    userId: 'USER_002',
    userName: 'Sarah Chen',
    amount: 12000,
    location: 'London',
    device: 'Unknown Android',
    timestamp: new Date().toISOString(),
    status: 'flagged',
    riskScore: 88,
    riskLevel: 'high',
    explanation: 'Amount significantly higher than average. Transaction from a new device and unusual location (London).'
  }
];
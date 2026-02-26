export type RiskLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
  userId: string;
  name: string;
  averageAmount: number;
  typicalLocations: string[];
  typicalDevices: string[];
  typicalTimeRange: {
    start: string;
    end: string;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  location: string;
  device: string;
  timestamp: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
  explanation?: string;
  status: 'pending' | 'flagged' | 'cleared';
}

export interface EngineeredFeatures {
  amountRatio: number;
  unusualTime: boolean;
  locationChange: boolean;
  newDevice: boolean;
}
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

export interface RiskBreakdown {
  amountRisk: number;
  deviceRisk: number;
  locationRisk: number;
  timeRisk: number;
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
  riskBreakdown?: RiskBreakdown;
  explanation?: string;
  status: 'pending' | 'flagged' | 'cleared' | 'blocked' | 'approved';
}

export interface EngineeredFeatures {
  amountRatio: number;
  unusualTime: boolean;
  locationChange: boolean;
  newDevice: boolean;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type InvestigationStatus = 'pending' | 'under_investigation' | 'confirmed_fraud' | 'false_positive';
export type FraudCategory = 'Behavioral Anomaly' | 'Pattern-Based Fraud' | 'Geolocation Risk' | 'Device Risk' | 'Velocity Risk' | 'Nominal';
export type UserRole = 'analyst' | 'risk_manager';

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
  patternRisk: number;
}

export interface Transaction {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  amount: number;
  location: string;
  device: string;
  timestamp: string;
  riskScore?: number;
  confidenceScore?: number;
  riskLevel?: RiskLevel;
  category?: FraudCategory;
  riskBreakdown?: RiskBreakdown;
  explanation?: string;
  status: 'pending' | 'flagged' | 'cleared' | 'blocked' | 'approved';
  investigationStatus: InvestigationStatus;
  analystNotes?: string;
  crossUserFlag?: boolean; // New: Flag for suspicious device reuse
}

export interface EngineeredFeatures {
  amountRatio: number;
  unusualTime: boolean;
  locationChange: boolean;
  newDevice: boolean;
  velocityAlert: boolean;
  structuringAlert: boolean;
  deviceReuseAlert?: boolean; // New: Intelligence from other users
}

export interface SystemConfig {
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

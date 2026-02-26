import { Transaction, UserProfile, EngineeredFeatures } from './types';

export function engineerFeatures(transaction: Transaction, profile: UserProfile, history: Transaction[]): EngineeredFeatures {
  const amountRatio = transaction.amount / profile.averageAmount;
  
  const txHour = new Date(transaction.timestamp).getHours();
  const [startHour] = profile.typicalTimeRange.start.split(':').map(Number);
  const [endHour] = profile.typicalTimeRange.end.split(':').map(Number);
  
  const unusualTime = txHour < startHour || txHour > endHour;
  const locationChange = !profile.typicalLocations.includes(transaction.location);
  const newDevice = !profile.typicalDevices.includes(transaction.device);

  // Pattern Detection logic
  const userHistory = history.filter(h => h.userId === transaction.userId);
  const last5Mins = userHistory.filter(h => {
    const diff = (new Date(transaction.timestamp).getTime() - new Date(h.timestamp).getTime()) / 60000;
    return diff >= 0 && diff <= 5;
  });

  // A. Rapid Multiple Transactions (Velocity)
  const velocityAlert = last5Mins.length >= 3;

  // B. Amount Splitting (Structuring)
  const structuringAlert = last5Mins.length >= 2 && last5Mins.every(h => Math.abs(h.amount - transaction.amount) < 10);

  return {
    amountRatio,
    unusualTime,
    locationChange,
    newDevice,
    velocityAlert,
    structuringAlert
  };
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 35) return 'low';
  if (score < 75) return 'medium';
  return 'high';
}

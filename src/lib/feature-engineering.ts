import { Transaction, UserProfile, EngineeredFeatures } from './types';

export function engineerFeatures(transaction: Transaction, profile: UserProfile): EngineeredFeatures {
  const amountRatio = transaction.amount / profile.averageAmount;
  
  const txHour = new Date(transaction.timestamp).getHours();
  const [startHour] = profile.typicalTimeRange.start.split(':').map(Number);
  const [endHour] = profile.typicalTimeRange.end.split(':').map(Number);
  
  const unusualTime = txHour < startHour || txHour > endHour;
  const locationChange = !profile.typicalLocations.includes(transaction.location);
  const newDevice = !profile.typicalDevices.includes(transaction.device);

  return {
    amountRatio,
    unusualTime,
    locationChange,
    newDevice
  };
}

export function getRiskLevel(score: number) {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}
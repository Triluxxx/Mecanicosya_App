import { Mechanic } from '../../domain/entities/Mechanic';
import { ServiceRequest } from '../../domain/entities/ServiceRequest';

export type RootStackParamList = {
  MainTabs: undefined;
  SOS: undefined;
  MechanicDetail: { mechanic: Mechanic };
  Tracking: { requestId: string };
  Payment: { requestId: string; estimatedCost: number };
  Review: { requestId: string; mechanicName: string };
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

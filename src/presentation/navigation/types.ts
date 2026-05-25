import { User } from '../../data/local/Database';

// ─── Auth Stack ───
export type AuthStackParamList = {
  Login: undefined;
  OTP: { phone: string; code: string };
  Register: { phone: string };
  MechanicRegister: { phone: string };
};

// ─── Client Tab ───
export type ClientTabParamList = {
  ClientHome: undefined;
  ClientHistory: undefined;
  ClientProfile: undefined;
};

// ─── Mechanic Tab ───
export type MechanicTabParamList = {
  MechanicHome: undefined;
  MechanicHistory: undefined;
  MechanicProfile: undefined;
};

// ─── Root Stack ───
export type RootStackParamList = {
  // Auth
  Login: undefined;
  OTP: { phone: string; code: string };
  Register: { phone: string };
  MechanicRegister: { phone: string };

  // Client
  ClientTabs: undefined;
  SOS: undefined;
  MechanicDetail: { mechanic: User };
  Tracking: { requestId: string };
  Payment: { requestId: string; estimatedCost: number };
  Review: { requestId: string; mechanicName: string };

  // Mechanic
  MechanicTabs: undefined;
  RequestDetail: { requestId: string };
};

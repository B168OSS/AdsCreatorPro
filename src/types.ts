export type AppState = 'welcome' | 'auth' | 'dashboard' | 'result' | 'admin';

export interface User {
  username: string;
  email: string;
  password?: string;
  isGuest: boolean;
  isAdmin: boolean;
  simulatedIp: string;
  registeredAt?: string;
}

export type ProductStyle = 'Cinematic' | 'Realistic' | '3D' | 'Studio Ghibli' | 'Minimalist' | 'Faceless' | 'Etalase';
export type VisualAngle = 'Zoom' | 'Fisheyes' | 'Boomerang' | 'Overhead' | 'Low-Angle' | 'Wide Shot';
export type VOVoice = 'User' | 'Male' | 'Female' | 'Elder' | 'Teenager' | 'Child';
export type VOIntonation = 'Ceria' | 'Elegan' | 'Misterius';

export interface AdFormInputs {
  productVisuals: string[]; // List of base64 or mock filenames
  productLinks: string[]; // Marketplace links
  modelPhoto: string | null; // base64 or mock filename
  modelDetectionType: '3D' | 'Cartoon' | 'Humanoid' | 'Mannequin' | 'Stickman' | 'Faceless' | 'None';
  isOwnModelApproved: boolean;
  productDescription: string;
  marketplace: 'Shopee' | 'Tokopedia' | 'TikTok Shop';
  affiliateId: string;
  style: ProductStyle;
  angle: VisualAngle;
  voVoice: VOVoice;
  voIntonation: VOIntonation;
}

export interface AdStep {
  stage: number;
  stageName: string;
  imagePrompt: string;
  caption: string;
  affiliateLink: string;
  videoPrompt: string;
  voScript: string;
  ttsSetting: string;
}

export interface GenerationResult {
  steps: AdStep[];
  isTruncated: boolean; // True for guests
  apiWarning?: string | null;
}

export interface TranslationDictionary {
  landingHeader: string;
  landingSub: string;
  ctaButton: string;
  faqTitle: string;
  faqBenefitsQ: string;
  faqBenefitsA: string;
  faqHowToQ: string;
  faqHowToA: string;
  faqPrivacyQ: string;
  faqPrivacyA: string;
  register: string;
  login: string;
  guestMode: string;
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
  logoutButton: string;
  guestLimitationMsg: string;
  requiredCheckboxMsg: string;
  generateButton: string;
}

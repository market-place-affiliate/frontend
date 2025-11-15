export interface User {
  email: string;
  password: string;
}

export interface AffiliateCredentials {
  shopee: {
    appId: string;
    secret: string;
  };
  lazada: {
    appKey: string;
    appSecret: string;
    userToken: string;
  };
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  utmCampaign: string;
  createdAt: string;
  links?: CampaignLink[];
}

export interface CampaignLink {
  id: string;
  ProductId: string;
  CampaignId: string;
  short_code: string;
  target_url: string;
  created_at: string;
  updated_at: string;
}

export interface URLSubmission {
  url: string;
  platform: 'shopee' | 'lazada';
}

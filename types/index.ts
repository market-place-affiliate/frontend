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
  url: string;
  name: string;
  startDate: string;
  endDate: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  platform: 'shopee' | 'lazada';
  createdAt: string;
}

export interface URLSubmission {
  url: string;
  platform: 'shopee' | 'lazada';
}

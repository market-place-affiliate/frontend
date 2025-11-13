import { AffiliateCredentials, Campaign } from '@/types';

const CREDENTIALS_KEY = 'affiliate_credentials';
const CAMPAIGNS_KEY = 'campaigns';
const URLS_KEY = 'submitted_urls';

export function saveCredentials(
  email: string,
  credentials: AffiliateCredentials
): void {
  if (typeof window === 'undefined') return;
  const key = `${CREDENTIALS_KEY}_${email}`;
  localStorage.setItem(key, JSON.stringify(credentials));
}

export function getCredentials(email: string): AffiliateCredentials | null {
  if (typeof window === 'undefined') return null;
  const key = `${CREDENTIALS_KEY}_${email}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function saveCampaign(email: string, campaign: Campaign): void {
  if (typeof window === 'undefined') return;
  const key = `${CAMPAIGNS_KEY}_${email}`;
  const campaigns = getCampaigns(email);
  campaigns.push(campaign);
  localStorage.setItem(key, JSON.stringify(campaigns));
}

export function getCampaigns(email: string): Campaign[] {
  if (typeof window === 'undefined') return [];
  const key = `${CAMPAIGNS_KEY}_${email}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveSubmittedURL(email: string, url: string, platform: 'shopee' | 'lazada'): void {
  if (typeof window === 'undefined') return;
  const key = `${URLS_KEY}_${email}`;
  const urls = getSubmittedURLs(email);
  urls.push({ url, platform, submittedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(urls));
}

export function getSubmittedURLs(email: string): Array<{url: string; platform: 'shopee' | 'lazada'; submittedAt: string}> {
  if (typeof window === 'undefined') return [];
  const key = `${URLS_KEY}_${email}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

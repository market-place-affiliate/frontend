'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AffiliateCredentials, Campaign } from '@/types';
import { saveCredentials, getCredentials, saveCampaign, getCampaigns, saveSubmittedURL, getSubmittedURLs } from '@/lib/storage';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Credentials state
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [shopeeSecret, setShopeeSecret] = useState('');
  const [lazadaAppKey, setLazadaAppKey] = useState('');
  const [lazadaAppSecret, setLazadaAppSecret] = useState('');
  const [lazadaUserToken, setLazadaUserToken] = useState('');
  const [credentialsSaved, setCredentialsSaved] = useState(false);

  // URL submission state
  const [urlInput, setUrlInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'shopee' | 'lazada'>('shopee');
  const [submittedUrls, setSubmittedUrls] = useState<Array<{url: string; platform: 'shopee' | 'lazada'; submittedAt: string}>>([]);

  // Campaign creation state
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [selectedUrlPlatform, setSelectedUrlPlatform] = useState<'shopee' | 'lazada'>('shopee');
  const [campaignName, setCampaignName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Campaigns list
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/auth/login');
      return;
    }

    // Load data function to avoid direct setState in effect
    const loadUserData = () => {
      setCurrentUser(email);

      // Load credentials
      const creds = getCredentials(email);
      if (creds) {
        setShopeeAppId(creds.shopee.appId);
        setShopeeSecret(creds.shopee.secret);
        setLazadaAppKey(creds.lazada.appKey);
        setLazadaAppSecret(creds.lazada.appSecret);
        setLazadaUserToken(creds.lazada.userToken);
      }

      // Load submitted URLs
      setSubmittedUrls(getSubmittedURLs(email));

      // Load campaigns
      setCampaigns(getCampaigns(email));

      setLoading(false);
    };

    loadUserData();
  }, [router]);

  const handleSaveCredentials = () => {
    if (!currentUser) return;

    const credentials: AffiliateCredentials = {
      shopee: {
        appId: shopeeAppId,
        secret: shopeeSecret,
      },
      lazada: {
        appKey: lazadaAppKey,
        appSecret: lazadaAppSecret,
        userToken: lazadaUserToken,
      },
    };

    saveCredentials(currentUser, credentials);
    setCredentialsSaved(true);
    setTimeout(() => setCredentialsSaved(false), 3000);
  };

  const handleSubmitUrl = () => {
    if (!currentUser || !urlInput.trim()) return;

    saveSubmittedURL(currentUser, urlInput, selectedPlatform);
    setSubmittedUrls(getSubmittedURLs(currentUser));
    setUrlInput('');
  };

  const handleSelectUrlForCampaign = (url: string, platform: 'shopee' | 'lazada') => {
    setSelectedUrl(url);
    setSelectedUrlPlatform(platform);
    setShowCampaignForm(true);
  };

  const handleCreateCampaign = () => {
    if (!currentUser || !selectedUrl || !campaignName || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      url: selectedUrl,
      name: campaignName,
      startDate,
      endDate,
      utmSource,
      utmMedium,
      utmCampaign,
      platform: selectedUrlPlatform,
      createdAt: new Date().toISOString(),
    };

    saveCampaign(currentUser, newCampaign);
    setCampaigns(getCampaigns(currentUser));

    // Reset form
    setShowCampaignForm(false);
    setSelectedUrl('');
    setCampaignName('');
    setStartDate('');
    setEndDate('');
    setUtmSource('');
    setUtmMedium('');
    setUtmCampaign('');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserEmail');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Affiliate Management Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{currentUser}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Credentials Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Affiliate Credentials
          </h2>

          <div className="space-y-6">
            {/* Shopee Credentials */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Shopee Affiliate
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={shopeeAppId}
                    onChange={(e) => setShopeeAppId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter Shopee App ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret
                  </label>
                  <input
                    type="password"
                    value={shopeeSecret}
                    onChange={(e) => setShopeeSecret(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter Shopee Secret"
                  />
                </div>
              </div>
            </div>

            {/* Lazada Credentials */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Lazada Affiliate
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Key
                  </label>
                  <input
                    type="text"
                    value={lazadaAppKey}
                    onChange={(e) => setLazadaAppKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter Lazada App Key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Secret
                  </label>
                  <input
                    type="password"
                    value={lazadaAppSecret}
                    onChange={(e) => setLazadaAppSecret(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter Lazada App Secret"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Token
                  </label>
                  <input
                    type="text"
                    value={lazadaUserToken}
                    onChange={(e) => setLazadaUserToken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter Lazada User Token"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveCredentials}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Credentials
              </button>
              {credentialsSaved && (
                <span className="text-green-600 text-sm">✓ Credentials saved successfully!</span>
              )}
            </div>
          </div>
        </div>

        {/* URL Submission Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Submit Product URL
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter Shopee or Lazada product URL"
                />
              </div>
              <div>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as 'shopee' | 'lazada')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="shopee">Shopee</option>
                  <option value="lazada">Lazada</option>
                </select>
              </div>
              <button
                onClick={handleSubmitUrl}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Submit URL
              </button>
            </div>

            {/* Submitted URLs List */}
            {submittedUrls.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Submitted URLs
                </h3>
                <div className="space-y-2">
                  {submittedUrls.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 truncate">{item.url}</p>
                        <p className="text-xs text-gray-500">
                          Platform: {item.platform} | Submitted: {new Date(item.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectUrlForCampaign(item.url, item.platform)}
                        className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Create Campaign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Creation Form */}
        {showCampaignForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create Campaign
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected URL
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedUrl}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    value={selectedUrlPlatform}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">
                  UTM Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTM Source
                    </label>
                    <input
                      type="text"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., facebook"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTM Medium
                    </label>
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., social"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTM Campaign
                    </label>
                    <input
                      type="text"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., summer_sale"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreateCampaign}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Campaign
                </button>
                <button
                  onClick={() => setShowCampaignForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        {campaigns.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Campaigns
            </h2>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {campaign.name}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      campaign.platform === 'shopee' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {campaign.platform}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 truncate">{campaign.url}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Start:</span>
                      <p className="text-gray-900">{campaign.startDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">End:</span>
                      <p className="text-gray-900">{campaign.endDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">UTM Source:</span>
                      <p className="text-gray-900">{campaign.utmSource || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">UTM Medium:</span>
                      <p className="text-gray-900">{campaign.utmMedium || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

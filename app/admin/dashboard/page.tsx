'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Campaign } from '@/types';
import { api, clearAuth, isAuthenticated, getAuthToken } from '@/lib/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [shopeeCredentialSet, setShopeeCredentialSet] = useState(false);
  const [lazadaCredentialSet, setLazadaCredentialSet] = useState(false);

  // URL submission state
  const [shopeeUrlInput, setShopeeUrlInput] = useState('');
  const [lazadaUrlInput, setLazadaUrlInput] = useState('');

  // Products state
  const [products, setProducts] = useState<Array<{id: string; title: string; image_url: string; offer?: {id: string; marketplace: string; store_name: string; price: number}}>>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [lastSubmittedShopeeProduct, setLastSubmittedShopeeProduct] = useState<{id: string; title: string; image_url: string; offer?: {id: string; marketplace: string; store_name: string; price: number}} | null>(null);
  const [lastSubmittedLazadaProduct, setLastSubmittedLazadaProduct] = useState<{id: string; title: string; image_url: string; offer?: {id: string; marketplace: string; store_name: string; price: number}} | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Campaigns list
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Dashboard metrics state
  const [dashboardMetrics, setDashboardMetrics] = useState<{
    top_product?: {
      product: {
        id: string;
        title: string;
        image_url: string;
      };
      clicks: number;
    };
    metrics: Array<{
      date: string;
      click_count: number;
      campaign: string;
      campaign_name: string;
      marketplace: string;
    }>;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if token exists
      if (!isAuthenticated()) {
        router.push('/admin/auth/login');
        return;
      }

      try {
        // Fetch user data from API
        const response = await api.getCurrentUser();
        
        if (!response.success || !response.data) {
          // Token invalid or expired, redirect to login
          clearAuth();
          router.push('/admin/auth/login');
          return;
        }

        const user = response.data;
        const userEmail = user.email || user.username || 'User';
        setCurrentUser(userEmail);

        // Load campaigns from API
        const campaignsResponse = await api.getCampaigns();
        if (campaignsResponse.success && campaignsResponse.data) {
          const responseData = campaignsResponse.data as unknown as { 
            success?: boolean; 
            code?: number; 
            data?: Array<{
              id: string; 
              name: string; 
              start_at: string; 
              end_at: string; 
              utm_campaign?: string;
              user_id?: number;
              created_at?: string;
              updated_at?: string;
            }> 
          };
          if (responseData.data && Array.isArray(responseData.data)) {
            const campaignsData = responseData.data.map(c => ({
              id: c.id,
              name: c.name,
              startDate: new Date(c.start_at).toLocaleDateString('en-CA'),
              endDate: new Date(c.end_at).toLocaleDateString('en-CA'),
              utmCampaign: c.utm_campaign || '',
              createdAt: c.created_at || new Date().toISOString(),
              links: [],
            }));
            setCampaigns(campaignsData);

            // Fetch links for each campaign
            campaignsData.forEach(async (campaign) => {
              try {
                const linksResponse = await api.getCampaignLinks(campaign.id);
                if (linksResponse.success && linksResponse.data) {
                  const linksData = linksResponse.data as unknown as { 
                    data?: Array<{
                      id: string;
                      ProductId: string;
                      CampaignId: string;
                      short_code: string;
                      target_url: string;
                      created_at: string;
                      updated_at: string;
                    }> 
                  };
                  if (linksData.data && Array.isArray(linksData.data)) {
                    setCampaigns(prev => 
                      prev.map(c => 
                        c.id === campaign.id 
                          ? { ...c, links: linksData.data }
                          : c
                      )
                    );
                  }
                }
              } catch (error) {
                console.error(`Error fetching links for campaign ${campaign.id}:`, error);
              }
            });
          }
        }

        // Check credential status from API
        const shopeeCredResponse = await api.checkMarketCredential('shopee');
        if (shopeeCredResponse.success && shopeeCredResponse.data?.code === 0) {
          setShopeeCredentialSet(true);
        }

        const lazadaCredResponse = await api.checkMarketCredential('lazada');
        if (lazadaCredResponse.success && lazadaCredResponse.data?.code === 0) {
          setLazadaCredentialSet(true);
        }

        // Fetch all products
        const productsResponse = await api.getAllProducts();
        if (productsResponse.success && productsResponse.data) {
          // Handle backend response structure {success, code, message, data: Product[]}
          const responseData = productsResponse.data as unknown as { data?: Array<{id: string; title: string; image_url: string}> };
          if (responseData.data && Array.isArray(responseData.data)) {
            const productsData = responseData.data;
            setProducts(productsData);
            
            // Auto-fetch offers for all products
            productsData.forEach(async (product) => {
              try {
                const offersResponse = await api.getProductOffers(product.id);
                if (offersResponse.success && offersResponse.data) {
                  const offerData = offersResponse.data as unknown as { data?: {id: string; marketplace: string; store_name: string; price: number} };
                  if (offerData.data) {
                    setProducts(prev => 
                      prev.map(p => 
                        p.id === product.id 
                          ? { ...p, offer: offerData.data }
                          : p
                      )
                    );
                  }
                }
              } catch (error) {
                console.error(`Error fetching offers for product ${product.id}:`, error);
              }
            });
          }
        }

        // Fetch dashboard metrics (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate.setDate(endDate.getDate() + 1);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        try {
          const metricsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/metrics?start_at=${startDateStr}&end_at=${endDateStr}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
              },
            }
          );
          
          if (metricsResponse.ok) {
            const metricsResult = await metricsResponse.json();
            if (metricsResult.success && metricsResult.data) {
              setDashboardMetrics(metricsResult.data);
            }
          }
        } catch (error) {
          console.error('Error fetching dashboard metrics:', error);
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuth();
        router.push('/admin/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleSaveCredentials = async () => {
    if (!currentUser) return;

    try {
      // Save Shopee credentials if provided
      if (shopeeAppId && shopeeSecret) {
        const shopeeData = {
          platform: 'shopee' as const,
          app_id: shopeeAppId,
          app_secret: shopeeSecret,
        };
        const shopeeResponse = await api.saveMarketCredential(shopeeData);
        if (!shopeeResponse.success) {
          alert(`Failed to save Shopee credentials: ${shopeeResponse.error}`);
          return;
        }
      }

      // Save Lazada credentials if provided
      if (lazadaAppKey && lazadaAppSecret) {
        const lazadaData = {
          platform: 'lazada' as const,
          app_key: lazadaAppKey,
          app_secret: lazadaAppSecret,
          user_token: lazadaUserToken,
        };
        const lazadaResponse = await api.saveMarketCredential(lazadaData);
        if (!lazadaResponse.success) {
          alert(`Failed to save Lazada credentials: ${lazadaResponse.error}`);
          return;
        }
      }

      setCredentialsSaved(true);
      setTimeout(() => setCredentialsSaved(false), 3000);

      // Refresh credential status
      const shopeeCredResponse = await api.checkMarketCredential('shopee');
      if (shopeeCredResponse.success && shopeeCredResponse.data?.code === 0) {
        setShopeeCredentialSet(true);
      }

      const lazadaCredResponse = await api.checkMarketCredential('lazada');
      if (lazadaCredResponse.success && lazadaCredResponse.data?.code === 0) {
        setLazadaCredentialSet(true);
      }
    } catch (error) {
      console.error('Failed to save credentials:', error);
      alert('Failed to save credentials. Please try again.');
    }
  };

  const handleSubmitUrl = async (platform: 'shopee' | 'lazada') => {
    if (!currentUser) return;

    const urlInput = platform === 'shopee' ? shopeeUrlInput : lazadaUrlInput;
    if (!urlInput.trim()) {
      alert('Please enter a URL');
      return;
    }

    try {
      // Call API to create product
      const response = await api.createProduct({
        source_url: urlInput,
        marketplace: platform,
      });

      if (response.success) {
        // Check if backend returned error code
        const responseData = response.data as unknown as { success?: boolean; code?: number; message?: string; data?: Array<{id: string; title: string; image_url: string}> };
        if (responseData && (responseData.success === false || (responseData.code !== undefined && responseData.code !== 0))) {
          alert(`Failed to create product: ${responseData.message || 'Unknown error'}`);
          return;
        }

        // Get the newly created product from response
        let newProduct: {id: string; title: string; image_url: string} | null = null;
        if (responseData && responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          newProduct = responseData.data[0];
          
          // Set last submitted product for immediate display (keep both platforms separate)
          if (platform === 'shopee') {
            setLastSubmittedShopeeProduct(newProduct);
          } else {
            setLastSubmittedLazadaProduct(newProduct);
          }
          
          // Add new product to list immediately
          setProducts(prev => [...prev, newProduct!]);
          
          // Fetch offer for the new product
          if (newProduct) {
            try {
              const offersResponse = await api.getProductOffers(newProduct.id);
              if (offersResponse.success && offersResponse.data) {
                const offerData = offersResponse.data as unknown as { data?: {id: string; marketplace: string; store_name: string; price: number} };
                if (offerData.data) {
                  // Update products list
                  setProducts(prev => 
                    prev.map(p => 
                      p.id === newProduct!.id 
                        ? { ...p, offer: offerData.data }
                        : p
                    )
                  );
                  
                  // Update lastSubmitted product with offer
                  if (platform === 'shopee') {
                    setLastSubmittedShopeeProduct(prev => 
                      prev ? { ...prev, offer: offerData.data } : prev
                    );
                  } else {
                    setLastSubmittedLazadaProduct(prev => 
                      prev ? { ...prev, offer: offerData.data } : prev
                    );
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching offers for product ${newProduct.id}:`, error);
            }
          }
        }

        // Clear the appropriate input
        if (platform === 'shopee') {
          setShopeeUrlInput('');
        } else {
          setLazadaUrlInput('');
        }

        alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} product created successfully!`);
      } else {
        alert(`Failed to create product: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('An error occurred while creating the product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await api.deleteProduct(productId);
      
      if (response.success) {
        // Remove product from state
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        alert('Product deleted successfully!');
      } else {
        alert(`Failed to delete product: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const response = await api.deleteCampaign(campaignId);
      
      if (response.success) {
        // Remove campaign from state
        setCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== campaignId));
        alert('Campaign deleted successfully!');
      } else {
        alert(`Failed to delete campaign: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('An error occurred while deleting the campaign');
    }
  };

  const handleDeleteLink = async (linkId: string, campaignId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/link/${linkId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Remove link from campaign in state
        setCampaigns(prevCampaigns =>
          prevCampaigns.map(campaign =>
            campaign.id === campaignId
              ? { ...campaign, links: campaign.links?.filter(link => link.id !== linkId) }
              : campaign
          )
        );
        alert('Link deleted successfully!');
      } else {
        alert(`Failed to delete link: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('An error occurred while deleting the link');
    }
  };

  const handleCreateCampaign = async () => {
    if (!currentUser || !campaignName || !startDate || !endDate || !utmCampaign) {
      alert('Please fill in all required fields (name, dates, and UTM campaign)');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('Please select at least one product for the campaign');
      return;
    }

    try {
      // Format dates with local timezone offset
      const formatDateWithTimezone = (dateString: string) => {
        const date = new Date(dateString);
        const offset = -date.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
        const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
        const offsetSign = offset >= 0 ? '+' : '-';
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        // Return format: YYYY-MM-DD 00:00:00 +07:00 (with local timezone)
        return `${year}-${month}-${day} 00:00:00 ${offsetSign}${offsetHours}:${offsetMinutes}`;
      };

      // Call API to create campaign
      const response = await api.createCampaign({
        name: campaignName,
        utm_campaign: utmCampaign,
        start_at: formatDateWithTimezone(startDate),
        end_at: formatDateWithTimezone(endDate),
      });

      if (response.success && response.data) {
        // Handle backend response structure
        const responseData = response.data as unknown as { 
          success?: boolean; 
          code?: number; 
          data?: {
            id: string;
            name: string;
            utm_campaign: string;
            start_at: string;
            end_at: string;
            user_id: number;
            created_at: string;
            updated_at: string;
          }
        };

        const campaignId = responseData.data?.id;
        if (!campaignId) {
          alert('Failed to create campaign: No campaign ID returned');
          return;
        }

        // Create links for all selected products
        const token = getAuthToken();
        const linkPromises = selectedProducts.map(async (productId) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/link`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              product_id: productId,
              campaign_id: campaignId,
            }),
          });
          
          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(`Failed to create link for product ${productId}: ${result.message || 'Unknown error'}`);
          }
          
          return result;
        });

        await Promise.all(linkPromises);

        // Reload campaigns from API
        const campaignsResponse = await api.getCampaigns();
        if (campaignsResponse.success && campaignsResponse.data) {
          const responseData = campaignsResponse.data as unknown as { 
            success?: boolean; 
            code?: number; 
            data?: Array<{
              id: string; 
              name: string; 
              start_at: string; 
              end_at: string; 
              utm_campaign?: string;
              user_id?: number;
              created_at?: string;
              updated_at?: string;
            }> 
          };
          if (responseData.data && Array.isArray(responseData.data)) {
            const campaignsData = responseData.data.map(c => ({
              id: c.id,
              name: c.name,
              startDate: new Date(c.start_at).toLocaleDateString('en-CA'),
              endDate: new Date(c.end_at).toLocaleDateString('en-CA'),
              utmCampaign: c.utm_campaign || '',
              createdAt: c.created_at || new Date().toISOString(),
              links: [],
            }));
            setCampaigns(campaignsData);

            // Fetch links for each campaign
            campaignsData.forEach(async (campaign) => {
              try {
                const linksResponse = await api.getCampaignLinks(campaign.id);
                if (linksResponse.success && linksResponse.data) {
                  const linksData = linksResponse.data as unknown as { 
                    data?: Array<{
                      id: string;
                      ProductId: string;
                      CampaignId: string;
                      short_code: string;
                      target_url: string;
                      created_at: string;
                      updated_at: string;
                    }> 
                  };
                  if (linksData.data && Array.isArray(linksData.data)) {
                    setCampaigns(prev => 
                      prev.map(c => 
                        c.id === campaign.id 
                          ? { ...c, links: linksData.data }
                          : c
                      )
                    );
                  }
                }
              } catch (error) {
                console.error(`Error fetching links for campaign ${campaign.id}:`, error);
              }
            });
          }
        }

        // Reset form
        setSelectedProducts([]);
        setCampaignName('');
        setStartDate('');
        setEndDate('');
        setUtmCampaign('');

        alert(`Campaign created successfully with ${selectedProducts.length} product link(s)!`);
      } else {
        alert(`Failed to create campaign: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('An error occurred while creating the campaign');
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/admin/auth/login');
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
        {/* Dashboard Metrics Section */}
        {dashboardMetrics && (
          <div className="mb-8 space-y-6">
            {/* Top Product Card */}
            {dashboardMetrics.top_product && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-4">🏆 Top Performing Product</h2>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={dashboardMetrics.top_product.product.image_url}
                      alt={dashboardMetrics.top_product.product.title}
                      fill
                      className="object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/96x96?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1 line-clamp-2">
                      {dashboardMetrics.top_product.product.title}
                    </h3>
                    <p className="text-2xl font-bold">
                      {dashboardMetrics.top_product.clicks} clicks
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            {dashboardMetrics.metrics && dashboardMetrics.metrics.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clicks Over Time Chart */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Clicks Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardMetrics.metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="click_count" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        name="Clicks"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Clicks by Campaign Chart */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Clicks by Campaign</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardMetrics.metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="campaign_name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="click_count" 
                        fill="#8b5cf6" 
                        name="Clicks"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Metrics Summary Table */}
            {dashboardMetrics.metrics && dashboardMetrics.metrics.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Detailed Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marketplace
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clicks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardMetrics.metrics.map((metric, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {metric.campaign_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="capitalize">{metric.marketplace}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                            {metric.click_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credentials Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Affiliate Credentials
          </h2>

          <div className="space-y-6">
            {/* Shopee Credentials */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Shopee Affiliate
                </h3>
                {shopeeCredentialSet && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    ✓ Configured
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={shopeeAppId}
                    onChange={(e) => setShopeeAppId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter Shopee Secret"
                  />
                </div>
              </div>
            </div>

            {/* Lazada Credentials */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Lazada Affiliate
                </h3>
                {lazadaCredentialSet && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    ✓ Configured
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Key
                  </label>
                  <input
                    type="text"
                    value={lazadaAppKey}
                    onChange={(e) => setLazadaAppKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
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
            {/* Shopee URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shopee Product URL
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="url"
                    value={shopeeUrlInput}
                    onChange={(e) => setShopeeUrlInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter Shopee product URL"
                  />
                </div>
                <button
                  onClick={() => handleSubmitUrl('shopee')}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Submit Shopee URL
                </button>
              </div>
            </div>

            {/* Lazada URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lazada Product URL
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="url"
                    value={lazadaUrlInput}
                    onChange={(e) => setLazadaUrlInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter Lazada product URL"
                  />
                </div>
                <button
                  onClick={() => handleSubmitUrl('lazada')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Lazada URL
                </button>
              </div>
            </div>
          </div>

          {/* Last Submitted Products Preview - Split View */}
          {(lastSubmittedShopeeProduct || lastSubmittedLazadaProduct) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Recently Added Product
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shopee Product */}
                <div className={`border rounded-lg p-4 transition-all ${
                  lastSubmittedShopeeProduct
                    ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-500 text-white">
                      SHOPEE
                    </span>
                    {lastSubmittedShopeeProduct && (
                      <span className="text-xs text-orange-600 font-medium">● Active</span>
                    )}
                  </div>
                  {lastSubmittedShopeeProduct ? (
                    <>
                      <div className="relative w-full h-48 mb-3">
                        <Image
                          src={lastSubmittedShopeeProduct.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                          alt={lastSubmittedShopeeProduct.title}
                          fill
                          className="object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {lastSubmittedShopeeProduct.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">ID: {lastSubmittedShopeeProduct.id}</p>
                      
                      {!lastSubmittedShopeeProduct.offer ? (
                        <div className="mt-3 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                          <p className="text-xs text-gray-500 mt-2">Fetching offer details...</p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">Offer:</p>
                          <div className="bg-white p-3 rounded border border-orange-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-900 font-medium capitalize">{lastSubmittedShopeeProduct.offer.marketplace}</span>
                              <span className="text-lg text-green-600 font-bold">฿{lastSubmittedShopeeProduct.offer.price.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{lastSubmittedShopeeProduct.offer.store_name}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                      No recent Shopee product
                    </div>
                  )}
                </div>

                {/* Lazada Product */}
                <div className={`border rounded-lg p-4 transition-all ${
                  lastSubmittedLazadaProduct
                    ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
                      LAZADA
                    </span>
                    {lastSubmittedLazadaProduct && (
                      <span className="text-xs text-blue-600 font-medium">● Active</span>
                    )}
                  </div>
                  {lastSubmittedLazadaProduct ? (
                    <>
                      <div className="relative w-full h-48 mb-3">
                        <Image
                          src={lastSubmittedLazadaProduct.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                          alt={lastSubmittedLazadaProduct.title}
                          fill
                          className="object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {lastSubmittedLazadaProduct.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">ID: {lastSubmittedLazadaProduct.id}</p>
                      
                      {!lastSubmittedLazadaProduct.offer ? (
                        <div className="mt-3 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <p className="text-xs text-gray-500 mt-2">Fetching offer details...</p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">Offer:</p>
                          <div className="bg-white p-3 rounded border border-blue-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-900 font-medium capitalize">{lastSubmittedLazadaProduct.offer.marketplace}</span>
                              <span className="text-lg text-green-600 font-bold">฿{lastSubmittedLazadaProduct.offer.price.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{lastSubmittedLazadaProduct.offer.store_name}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                      No recent Lazada product
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Creation Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create Campaign
          </h2>

          {/* Product Selection */}
          {products.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Select Products for Campaign ({selectedProducts.length} selected)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProducts(prev => 
                          prev.includes(product.id)
                            ? prev.filter(id => id !== product.id)
                            : [...prev, product.id]
                        );
                      }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="relative">
                        {isSelected && (
                          <div className="absolute top-2 left-2 z-10 bg-indigo-600 text-white rounded-full p-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        )}
                        <div className="relative w-full h-48 mb-3">
                          <Image
                            src={product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={product.title}
                            fill
                            className="object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                            className="absolute top-2 right-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md border border-red-700 shadow-sm"
                            title="Delete product"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {product.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">ID: {product.id}</p>
                      
                      {!product.offer ? (
                        <div className="mt-3 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <p className="text-xs text-gray-500 mt-2">Loading offer...</p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">Offer:</p>
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-900 font-medium capitalize">{product.offer.marketplace}</span>
                              <span className="text-lg text-green-600 font-bold">฿{product.offer.price.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{product.offer.store_name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Campaign Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Enter campaign name"
                />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UTM Campaign *
                </label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="e.g., summer_sale"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreateCampaign}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>

        

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
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md"
                      title="Delete campaign"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Start:</span>
                      <p className="text-gray-900">{campaign.startDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">End:</span>
                      <p className="text-gray-900">{campaign.endDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">UTM Campaign:</span>
                      <p className="text-gray-900">{campaign.utmCampaign || '-'}</p>
                    </div>
                  </div>

                  {/* Campaign Links */}
                  {campaign.links && campaign.links.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Campaign Links ({campaign.links.length})
                      </h4>
                      <div className="space-y-2">
                        {campaign.links.map((link) => (
                          <div
                            key={link.id}
                            className="bg-gray-50 p-3 rounded-md text-xs relative"
                          >
                            <button
                              onClick={() => handleDeleteLink(link.id, campaign.id)}
                              className="absolute top-2 right-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded"
                              title="Delete link"
                            >
                              Delete
                            </button>
                            <div className="flex items-center justify-between mb-1 pr-16">
                              <span className="font-medium text-gray-700">Short Code:</span>
                              <a
                                href={`/go/${link.short_code}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white px-2 py-1 rounded border border-gray-300 text-gray-900 font-mono text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer"
                              >
                                {link.short_code}
                              </a>
                            </div>
                            <div className="flex items-center justify-between pr-16">
                              <span className="font-medium text-gray-700">Target URL:</span>
                              <a
                                href={link.target_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-medium truncate max-w-xs ml-2"
                              >
                                {link.target_url}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

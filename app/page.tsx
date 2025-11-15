'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  utm_campaign: string;
  start_at: string;
  end_at: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface CampaignLink {
  id: string;
  ProductId: string;
  CampaignId: string;
  short_code: string;
  target_url: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  title: string;
  image_url: string;
  source_url: string;
}

interface CampaignWithLinks extends Campaign {
  links?: Array<CampaignLink & { product?: Product }>;
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<CampaignWithLinks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available campaigns
        const campaignsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/campaign/available`);
        const campaignsResult = await campaignsResponse.json();

        if (campaignsResult.success && campaignsResult.data) {
          const campaignsData: CampaignWithLinks[] = campaignsResult.data;

          // Fetch links for each campaign
          for (const campaign of campaignsData) {
            try {
              const linksResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/link/campaign/${campaign.id}`
              );
              const linksResult = await linksResponse.json();

              if (linksResult.success && linksResult.data) {
                campaign.links = linksResult.data;

                // Fetch product details for each link
                if (campaign.links) {
                  for (const link of campaign.links) {
                    try {
                      const productResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/${link.ProductId}`
                      );
                      const productResult = await productResponse.json();

                      if (productResult.success && productResult.data) {
                        // Handle nested response structure
                        const productData = productResult.data.data || productResult.data;
                        link.product = productData;
                      }
                    } catch (error) {
                      console.error(`Error fetching product ${link.ProductId}:`, error);
                    }
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching links for campaign ${campaign.id}:`, error);
            }
          }

          setCampaigns(campaignsData);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter out campaigns without links
  const campaignsWithLinks = campaigns.filter(
    (campaign) => campaign.links && campaign.links.length > 0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🛍️ Available Campaigns
              </h1>
              <p className="text-gray-600 mt-1">
                Browse and access affiliate links for active campaigns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {campaignsWithLinks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Campaigns</h3>
            <p className="text-gray-600">There are no campaigns available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {campaignsWithLinks.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Campaign Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {campaign.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(campaign.start_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {' - '}
                          {new Date(campaign.end_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    {campaign.links && campaign.links.length > 0 && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">
                          {campaign.links.length}
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.links.length === 1 ? 'Product' : 'Products'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campaign Links/Products */}
                  {campaign.links && campaign.links.length > 0 && (
                    <div className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaign.links.map((link) => (
                          <a
                            key={link.id}
                            href={`/go/${link.short_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                          >
                            {link.product && (
                              <>
                                <div className="relative w-full h-48 mb-3">
                                  <Image
                                    src={link.product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={link.product.title}
                                    fill
                                    className="object-cover rounded-md"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                  />
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-3">
                                  {link.product.title}
                                </h4>
                              </>
                            )}
 
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


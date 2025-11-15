'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function RedirectPage() {
  const params = useParams();
  const shortCode = params.id as string;

  useEffect(() => {
    const redirectToLink = async () => {
      if (!shortCode) {
        console.error('No short code provided');
        return;
      }

      try {
        // Verify the short code exists
        const verifyResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/link/short-code/${shortCode}`
        );
        const result = await verifyResponse.json();

        if (verifyResponse.ok && result.success && result.data) {
          // Redirect to the redirect endpoint
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/link/redirect/${shortCode}`;
        } else {
          console.error('Invalid short code:', result.message || 'Unknown error');
          // Optionally redirect to a 404 page
          window.location.href = '/404';
        }
      } catch (error) {
        console.error('Error verifying short code:', error);
        // Optionally redirect to an error page
        window.location.href = '/404';
      }
    };

    redirectToLink();
  }, [shortCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

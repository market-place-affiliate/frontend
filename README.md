# Affiliate Management Platform

A Next.js 16 application for managing Shopee and Lazada affiliate campaigns with email/password authentication.

## Features

- **User Authentication**: Email and password registration/login with API integration
- **Affiliate Credentials Management**: Store and manage Shopee and Lazada API credentials
- **URL Submission**: Submit product URLs from Shopee and Lazada platforms
- **Campaign Creation**: Create campaigns with UTM parameters for tracking
- **Campaign Management**: View and manage all created campaigns

## Tech Stack

- **Next.js** 16.0.3 (App Router)
- **React** 19.2.0
- **TypeScript** 5.x
- **Tailwind CSS** 4.x
- **bcryptjs** for password hashing

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Integration

This application connects to an external API for authentication and data management.

### API Endpoints

The following endpoints are expected from the backend API:

#### Authentication
- `POST /api/v1/user/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  
- `POST /api/v1/user/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  
- `GET /api/v1/user/me` - Get current user info

#### Campaigns
- `GET /api/v1/campaign/available` - Get all available campaigns
- `GET /api/v1/campaign` - Get user's campaigns (authenticated)
- `POST /api/v1/campaign` - Create new campaign (authenticated)
- `DELETE /api/v1/campaign/:id` - Delete campaign (authenticated)

#### Links
- `GET /api/v1/link/campaign/:campaignId` - Get links for a campaign
- `GET /api/v1/link/short-code/:shortCode` - Verify short code exists
- `GET /api/v1/link/redirect/:shortCode` - Redirect to target URL (increments click count)
- `POST /api/v1/link` - Create new link (authenticated)
- `DELETE /api/v1/link/:id` - Delete link (authenticated)

#### Products
- `GET /api/v1/product` - Get all products (authenticated)
- `GET /api/v1/product/:id` - Get product details
- `GET /api/v1/product/:id/offer` - Get product offers
- `POST /api/v1/product` - Create product from URL (authenticated)
- `DELETE /api/v1/product/:id` - Delete product (authenticated)

#### Marketplace Credentials
- `POST /api/v1/market/credential` - Save marketplace credentials (authenticated)
- `GET /api/v1/market/credential/:platform` - Check if credentials exist (authenticated)

#### Dashboard Metrics
- `GET /api/v1/dashboard/metrics?start_at=YYYY-MM-DD&end_at=YYYY-MM-DD` - Get dashboard metrics (authenticated)

#### Expected Response Format
```json
{
  "success": true,
  "code": 0,
  "message": "Success message",
  "txn_id": "transaction_id",
  "data": {
    // Response data here
  }
}
```

### Configuration

You can configure the API URL in two ways:

1. **Environment Variable** (Recommended):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

2. **Default Fallback**: 
   If no environment variable is set, it defaults to `http://localhost:8080`

## Usage

### Public Users (Homepage)

#### Browse Available Campaigns
- Visit the homepage to see all available affiliate campaigns
- Each campaign displays:
  - Campaign name and description
  - Associated products with images, names, and prices
  - Product cards are clickable and lead to short URLs

#### Access Affiliate Links
- Click on any product card to visit its affiliate link
- Short URLs follow the format: `/go/:short_code`
- Each click is tracked for analytics

### Admin Users (Dashboard)

#### 1. Authentication
- Navigate to `/admin/auth/login` to access the admin dashboard
- Enter your registered email and password
- Upon successful login, you'll be redirected to `/admin/dashboard`

#### 2. Dashboard Overview
- View key metrics and analytics:
  - Top performing product with click count
  - Historical click data with interactive charts (last 7 days)
  - Breakdown by campaign and marketplace
  - Daily click trends

#### 3. Manage Marketplace Credentials
- Set up Shopee credentials:
  - App ID
  - App Secret
- Set up Lazada credentials:
  - App Key
  - App Secret
  - User Token
- Click "Save Credentials" to enable product URL processing

#### 4. Add Products
- **Shopee Products:**
  - Enter a Shopee product URL
  - Click "Add Product" to fetch product details
- **Lazada Products:**
  - Enter a Lazada product URL
  - Click "Add Product" to fetch product details
- Products are automatically saved and displayed with:
  - Product image
  - Product name
  - Price information
  - Marketplace badge (Shopee/Lazada)

#### 5. Create Campaigns
- Fill in campaign details:
  - Campaign Name (required)
  - Start Date (required)
  - End Date (required)
  - UTM Campaign (optional)
- Select one or more products from your product list
- Click "Create Campaign" button
- System automatically:
  - Creates the campaign
  - Generates short URLs for each selected product
  - Displays success message with number of links created

#### 6. View and Manage Campaigns
- All campaigns are listed with:
  - Campaign name and dates
  - Associated product links
  - Each link shows:
    - Target URL (full affiliate link)
    - Short code (clickable, e.g., `ABC123`)
    - Click count
    - Created date
- Click short codes to test redirect at `/go/:short_code`
- Delete individual links using the trash icon
- Delete entire campaigns with the delete button

#### 7. Track Performance
- Monitor metrics in the dashboard overview:
  - Top product performance
  - Click trends over time
  - Campaign comparison
  - Marketplace performance (Shopee vs Lazada)

## Project Structure

```
frontend/
├── app/
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx    # Admin dashboard with full CRUD operations
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx    # Admin login page
│   │   └── register/
│   │       └── page.tsx    # Admin registration page
│   ├── go/
│   │   └── [id]/
│   │       └── page.tsx    # Short code redirect handler
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Public homepage (campaign listing)
│   └── globals.css         # Global styles
├── lib/
│   ├── auth.ts             # Authentication utilities (JWT token management)
│   └── storage.ts          # LocalStorage utilities
├── types/
│   └── index.ts            # TypeScript type definitions
├── public/                 # Static assets
├── .env.local              # Environment variables (NEXT_PUBLIC_API_URL)
└── package.json
```

## Security Considerations

⚠️ **Important Security Notes**

### Authentication
- JWT tokens are stored in browser cookies (not localStorage)
- Cookie settings: 7-day expiration, SameSite=Strict, path=/
- Tokens are sent via cookies and Authorization headers
- Admin routes are protected with authentication checks

### Environment Variables
- API URL is configured via `NEXT_PUBLIC_API_URL` environment variable
- Never commit `.env.local` file to version control
- Use different API URLs for development, staging, and production

### Best Practices for Production
- Enable HTTPS for all API communications
- Implement rate limiting on API endpoints
- Use secure, HTTP-only cookies for token storage (recommended over localStorage)
- Implement CSRF protection
- Add input validation and sanitization
- Set up proper CORS policies
- Enable security headers (CSP, HSTS, etc.)
- Regularly update dependencies for security patches

### Data Privacy
- Marketplace credentials (Shopee/Lazada API keys) are stored on the backend
- Sensitive data should be encrypted at rest
- Implement proper access controls and user permissions

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


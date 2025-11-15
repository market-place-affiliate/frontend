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
- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  
- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

#### Expected Response Format
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    }
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

### 1. Register an Account
- Navigate to the homepage
- Click "Get Started - Register"
- Enter your email and password
- Click "Register"

### 2. Set Up Affiliate Credentials
- After login, you'll be on the dashboard
- Fill in your Shopee credentials (App ID and Secret)
- Fill in your Lazada credentials (App Key, App Secret, User Token)
- Click "Save Credentials"

### 3. Submit Product URLs
- Enter a product URL from Shopee or Lazada
- Select the platform (Shopee/Lazada)
- Click "Submit URL"

### 4. Create Campaigns
- Click "Create Campaign" next to any submitted URL
- Fill in campaign details:
  - Campaign Name (required)
  - Start Date (required)
  - End Date (required)
  - UTM Parameters (optional but recommended)
- Click "Create Campaign"

### 5. View Campaigns
- All created campaigns are displayed in the "My Campaigns" section
- Each campaign shows URL, dates, and UTM parameters

## Project Structure

```
frontend-backoffice-side/
├── app/
│   ├── auth/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── dashboard/          # Main dashboard
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── lib/
│   ├── auth.ts             # Authentication utilities
│   └── storage.ts          # LocalStorage utilities
├── types/
│   └── index.ts            # TypeScript type definitions
├── public/                 # Static assets
└── package.json
```

## Security Notice

⚠️ **This is a demo/prototype application**

This application stores credentials in browser localStorage, which is **NOT secure for production use**. 

See [SECURITY.md](./SECURITY.md) for detailed security considerations and production recommendations.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


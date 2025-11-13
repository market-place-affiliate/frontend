# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install and Run
```bash
npm install
npm run dev
```
Navigate to http://localhost:3000

### 2. Create Your Account
1. Click "Get Started - Register"
2. Enter email: `yourname@example.com`
3. Enter password: `yourpassword` (min 6 characters)
4. Click "Register"

### 3. Set Up Your Affiliate Credentials

#### Shopee Credentials
- **App ID**: Your Shopee affiliate App ID
- **Secret**: Your Shopee affiliate secret key

#### Lazada Credentials
- **App Key**: Your Lazada affiliate app key
- **App Secret**: Your Lazada affiliate app secret
- **User Token**: Your Lazada user authorization token

Click **Save Credentials** when done.

### 4. Submit a Product URL
1. Paste a product URL from Shopee or Lazada
   - Example Shopee: `https://shopee.com/product/12345`
   - Example Lazada: `https://www.lazada.com/products/item-name-i12345.html`
2. Select the platform from dropdown
3. Click **Submit URL**

### 5. Create Your First Campaign
1. Click **Create Campaign** next to your submitted URL
2. Fill in the campaign details:
   - **Campaign Name**: e.g., "Black Friday Sale 2025"
   - **Start Date**: Campaign start date
   - **End Date**: Campaign end date
3. (Optional) Add UTM parameters for tracking:
   - **UTM Source**: e.g., "facebook", "instagram", "email"
   - **UTM Medium**: e.g., "social", "cpc", "newsletter"
   - **UTM Campaign**: e.g., "black_friday_2025"
4. Click **Create Campaign**

### 6. View Your Campaigns
All your campaigns are displayed in the "My Campaigns" section, showing:
- Campaign name and platform
- Product URL
- Start and end dates
- UTM parameters

## 💡 Tips

### Where to Get Credentials

**Shopee Affiliate Program**
1. Go to https://shopee.com/affiliate
2. Register for the affiliate program
3. Access your dashboard to get App ID and Secret

**Lazada Affiliate Program**
1. Go to https://affiliate.lazada.com
2. Sign up for the affiliate program
3. Get your App Key, App Secret, and User Token from the API section

### UTM Parameters Best Practices

UTM parameters help you track where your campaign traffic is coming from:

- **utm_source**: Identifies the source (facebook, google, newsletter)
- **utm_medium**: Identifies the medium (social, cpc, email)
- **utm_campaign**: Identifies the specific campaign (summer_sale, promo_2025)

Example:
- Source: `facebook`
- Medium: `social`
- Campaign: `summer_sale_2025`

These will be appended to your affiliate URL for tracking in analytics tools like Google Analytics.

## 🔒 Important Security Note

This application stores data in your browser's localStorage. It's designed for:
- ✅ Local development and testing
- ✅ Learning and prototyping
- ❌ **NOT for production use**

For production, you need to implement:
- Backend API with secure database
- Encrypted credential storage
- Proper authentication system

See [SECURITY.md](./SECURITY.md) for details.

## 🐛 Troubleshooting

**Problem**: Can't log in after registration
- **Solution**: Make sure you're using the same email and password

**Problem**: Credentials not saving
- **Solution**: Check browser console for errors, ensure localStorage is enabled

**Problem**: Campaign not created
- **Solution**: Ensure all required fields (Campaign Name, Start Date, End Date) are filled

**Problem**: Build fails
- **Solution**: Delete `node_modules` and `.next` folders, then run `npm install` again

## 📚 Learn More

- Check the main [README.md](./README.md) for detailed documentation
- Review [SECURITY.md](./SECURITY.md) for security best practices
- Visit [Next.js Documentation](https://nextjs.org/docs) to learn about Next.js features

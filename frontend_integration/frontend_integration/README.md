# NeuralGen Frontend - Integration Guide

## 📦 What's Included

All new pages and components to support:
- ✅ Credit management with transaction history
- ✅ API key generation and management
- ✅ Webhook integrations setup
- ✅ Campaign creation and management
- ✅ Updated article creation flow (single vs recurring)
- ✅ Enhanced dashboard layout with settings

---

## 📁 File Structure

```
frontend_integration/
├── types.ts                                    # Extended TypeScript types
├── lib/
│   └── api-client.ts                           # API client with new endpoints
├── app/
│   ├── (dashboard)/
│   │   └── layout.tsx                          # Updated layout with settings nav
│   ├── dashboard/
│   │   ├── create/
│   │   │   └── page.tsx                        # Updated with campaign support
│   │   └── campaigns/
│   │       ├── page.tsx                        # Campaigns list
│   │       └── [id]/
│   │           └── page.tsx                    # Campaign detail
│   └── settings/
│       ├── credits/
│       │   └── page.tsx                        # Credit management
│       ├── api-keys/
│       │   └── page.tsx                        # API keys
│       └── integrations/
│           └── page.tsx                        # Webhook integrations
```

---

## 🚀 Installation Steps

### 1. Copy Files to Your Project

```bash
# Copy all files to your Next.js project
cp -r frontend_integration/* your-nextjs-app/
```

### 2. Install Dependencies (if not already installed)

```bash
npm install @tanstack/react-query date-fns
```

### 3. Update Your API Client

Replace or merge `lib/api-client.ts` with the new version that includes:
- Campaign API methods
- Credit API methods
- API Key API methods
- Integration API methods

### 4. Update Types

Replace or merge `types.ts` with the extended version.

### 5. Update Layout

Replace your dashboard layout with the new one that includes:
- Settings navigation section
- Credit balance display in sidebar
- New menu items for campaigns

---

## 🎨 New Pages Overview

### 1. Credits Page (`/settings/credits`)
- **Features:**
  - Current credit balance display
  - Transaction history table
  - Token usage statistics
  - Purchase credits button (Stripe integration placeholder)

### 2. API Keys Page (`/settings/api-keys`)
- **Features:**
  - Generate new API keys
  - View existing keys (prefix only)
  - Copy newly generated keys
  - Revoke keys
  - Last used timestamp

### 3. Integrations Page (`/settings/integrations`)
- **Features:**
  - Add webhook URLs
  - Configure platform type
  - Optional webhook secrets for HMAC
  - Test webhook connections
  - View last test status

### 4. Campaigns Page (`/dashboard/campaigns`)
- **Features:**
  - List all campaigns (active/paused)
  - Quick stats (active count, generated today, total articles)
  - Campaign cards with progress bars
  - Pause/resume buttons
  - Link to campaign details

### 5. Campaign Detail Page (`/dashboard/campaigns/[id]`)
- **Features:**
  - Campaign info and statistics
  - Status breakdown
  - List of all generated articles
  - Link to individual articles

### 6. Updated Create Page (`/dashboard/create`)
- **New Features:**
  - Toggle between "Single Article" and "Campaign"
  - Campaign configuration form:
    - Campaign name
    - Articles per day
    - Posting times
    - Start/end dates
    - Total articles limit (optional)
  - Credit estimate calculator
  - Insufficient credits warning

---

## 🔧 Configuration

### Update Your Environment Variables

```env
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### QueryClient Setup

Make sure you have React Query configured in your app:

```typescript
// app/providers.tsx or layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## 🎯 Key Features Explained

### Token-Based Credits

- **Display**: Credit balance shown in sidebar
- **Tracking**: Every transaction logged with token count
- **Calculation**: 2000 tokens = 1 credit
- **History**: Complete audit trail on credits page

### Campaign System

- **Creation**: 3-step wizard (title → configure → deploy)
- **Management**: View all campaigns, pause/resume anytime
- **Monitoring**: Real-time stats and article list
- **Flexibility**: Set duration, frequency, and targets

### API Keys

- **Security**: Keys are hashed, only prefix displayed after creation
- **One-time View**: Full key shown once during creation
- **Management**: Revoke compromised keys instantly
- **Usage Tracking**: Last used timestamp

### Webhook Integrations

- **Testing**: Test connection before saving
- **Platform Types**: Custom, WordPress, Next.js, Ghost
- **Security**: Optional HMAC secrets
- **Status Tracking**: Last test result and timestamp

---

## 🔄 User Flow Examples

### Create a Single Article
1. Dashboard → Generate
2. Enter topic description → Generate Titles
3. Select and edit title → Confirm
4. Choose "Single Article" → Configure settings → Deploy

### Create a Campaign
1. Dashboard → Generate (or Campaigns → New Campaign)
2. Enter topic description → Generate Titles
3. Select and edit title → Confirm
4. Choose "Recurring Campaign"
5. Set campaign name, frequency, dates → Launch

### Setup Webhook
1. Settings → Webhooks
2. Add Integration → Enter details
3. Test Connection → Verify success
4. Articles will auto-post when complete

### Monitor Campaigns
1. Dashboard → Campaigns
2. View active campaigns with stats
3. Click campaign → See all articles
4. Pause/resume as needed

---

## 🎨 Design System

All pages follow your existing design language:

### Colors
- **Primary**: Cyan (`#00ff9f`)
- **Secondary**: Magenta (`#ff0080`)
- **Accent**: Amber (`#ffb800`)

### Components Used
- `GlassCard` - Glassmorphic containers
- `Button` - Consistent button styling
- `TechInput` - Styled input fields

### Typography
- Headers: `text-glow-cyan` effect
- Code/Stats: `font-mono`
- Labels: `text-xs tracking-wider uppercase`

---

## 🧪 Testing Checklist

- [ ] Credits page displays correct balance
- [ ] Transaction history loads
- [ ] API keys can be generated
- [ ] Key copy function works
- [ ] Keys can be revoked
- [ ] Webhook integrations can be added
- [ ] Webhook test returns success/failure
- [ ] Campaign creation works
- [ ] Single article creation still works
- [ ] Campaign list displays correctly
- [ ] Campaign detail shows articles
- [ ] Pause/resume campaign works
- [ ] Credit warning shows when insufficient
- [ ] Sidebar shows correct credit balance

---

## 🔗 API Endpoints Used

### Credits
- `GET /credits` - Balance
- `GET /credits/transactions` - History

### API Keys
- `POST /api-keys` - Create
- `GET /api-keys` - List
- `DELETE /api-keys/{id}` - Revoke

### Campaigns
- `POST /campaigns` - Create
- `GET /campaigns` - List
- `GET /campaigns/{id}` - Details
- `GET /campaigns/{id}/articles` - Campaign articles
- `PATCH /campaigns/{id}` - Update
- `POST /campaigns/{id}/pause` - Pause
- `POST /campaigns/{id}/resume` - Resume

### Integrations
- `POST /integrations` - Create
- `GET /integrations` - List
- `POST /integrations/test` - Test
- `DELETE /integrations/{id}` - Delete

---

## 🎭 User Experience Improvements

### Dashboard Enhancements
- Credit balance always visible in sidebar
- Direct links to settings pages
- Campaign stats on main dashboard

### Article Creation
- Clear distinction between single and recurring
- Visual mode selector
- Credit cost estimation
- Insufficient credits warning

### Campaign Management
- Progress bars for limited campaigns
- Days remaining indicator
- Status badges with colors
- Quick pause/resume actions

### Settings Organization
- Dedicated settings section
- Logical grouping (credits, keys, webhooks)
- Consistent layout across pages

---

## 💡 Tips

1. **Test Webhooks First**: Use the test button before saving
2. **Start with Small Campaigns**: Test with 1-2 articles/day first
3. **Monitor Credits**: Check balance before creating large campaigns
4. **Use API Keys**: Required for webhook authentication
5. **Set End Dates**: Prevent runaway campaigns

---

## 🐛 Common Issues

### "Insufficient Credits" Error
- Check credit balance in sidebar
- Purchase more credits or reduce campaign scope

### Webhook Test Failing
- Verify URL is accessible from backend
- Check your endpoint accepts POST requests
- Verify API key is correct

### Campaign Not Generating
- Ensure campaign status is "active"
- Check if start date has passed
- Verify user has sufficient credits
- Check Celery Beat is running (backend)

---

## 📱 Responsive Design

All pages are responsive and work on:
- ✅ Desktop (1920px+)
- ✅ Laptop (1440px)
- ✅ Tablet (768px)
- ⚠️ Mobile (< 768px) - Layout may need adjustments

---

## 🚀 Next Steps

1. Copy files to your project
2. Test each new page
3. Customize colors/styling if needed
4. Add error boundaries
5. Implement loading states
6. Add confirmation modals
7. Deploy to production

---

## 📚 Related Documentation

- Backend Integration: See `backend_integration/README.md`
- API Documentation: `http://localhost:8000/docs`
- Component Library: Your existing UI components

---

## ✅ Completion Checklist

- [ ] All files copied
- [ ] Dependencies installed
- [ ] API client updated
- [ ] Types updated
- [ ] Layout updated
- [ ] All pages tested
- [ ] Webhooks configured
- [ ] Campaign created successfully
- [ ] Credits system working
- [ ] API keys generated

You're ready to launch! 🎉

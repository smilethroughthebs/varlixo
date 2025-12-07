# 🧪 Testing Guide - Varlixo Implementation

## Quick Test Checklist

### Phase 1: OTP & Email System

#### Test OTP Generation & Verification
```bash
# 1. Send verification OTP
curl -X POST http://localhost:3001/auth/otp/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected Response:
# {
#   "message": "OTP sent to your email",
#   "otpId": "..." 
# }

# 2. Verify OTP
curl -X POST http://localhost:3001/auth/otp/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "otp":"123456",
    "userId":"..."
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Email verified successfully"
# }
```

#### Test OTP Expiration (Wait 10 minutes)
```bash
# After 10 minutes, OTP should be auto-deleted from database
# MongoDB should have TTL index on otp.createdAt

# Verify in MongoDB:
# db.otps.findOne({ email: "test@example.com" })
# Should return null if more than 10 minutes have passed
```

#### Test Email Sending (MailerLite)
```bash
# Check logs for SMTP connection success
# Look for: "SMTP connection established to smtp.mailerlite.com"
# 
# In MailerLite account, check Activity log:
# - Should show email sent to test@example.com
# - Subject should be "Your Varlixo OTP Code"
# - Body should contain 6-digit OTP code
```

---

### Phase 2: Forgot Password Flow

#### Test Complete Forgot Password Flow
```bash
# Step 1: Request password reset OTP
curl http://localhost:3000/auth/forgot-password
# Should load the forgot password page

# Step 2: Enter email and click "Send Code"
# Frontend calls: POST /auth/otp/send-reset
# Check email for OTP code

# Step 3: Enter OTP and click "Verify"
# Frontend calls: POST /auth/otp/verify-email
# OTP should be marked as verified

# Step 4: Enter new password and confirm
# Frontend calls: POST /auth/otp/reset-password
# Should receive: { success: true, message: "Password reset successful" }

# Step 5: Login with new password
# Should be able to login with new credentials
```

#### Test Frontend Validations
- [ ] Email field validates email format
- [ ] OTP field only accepts 6 digits
- [ ] Password validation shows requirements in real-time
- [ ] Confirm password must match
- [ ] Timer counts down from 10:00
- [ ] "Resend Code" button disabled until timer expires
- [ ] Steps animate with Framer Motion
- [ ] Error messages display as toast notifications

---

### Phase 3: Investment Plans

#### Verify Plans in Database
```bash
# Connect to MongoDB and run:
db.investment_plans.find({}).sort({_id: -1})

# Should return 6 documents:
# 1. Starter Yield - 7% daily, 2 days
# 2. Prime Growth - 9.5% daily, 3 days
# 3. Elite Advance - 12% daily, 4 days
# 4. Ultra Max - 15% daily, 5 days
# 5. Infinity Pro - 18.5% daily, 7 days
# 6. Flash Promo - 25% every 12 hours
```

#### Verify Frontend Display
```bash
# Navigate to http://localhost:3000/plans
# Should display all 6 plans with:
- Correct daily rates
- Correct durations
- Min/max investment amounts
- Feature highlights
- "Invest Now" buttons
```

#### Test Investment Calculation
```bash
# Invest $1000 in "Starter Yield" plan
# Expected: $70/day for 2 days = $140 total profit

# Backend calculates:
# Daily Profit = Amount × Daily Rate
# 1000 × 0.07 = $70/day
# Total at maturity = 1000 + (70 × 2) = $1140
```

---

### Phase 4: Admin Investments Dashboard

#### Access Admin Page
```bash
# Login as admin user
# Navigate to: http://localhost:3000/admin/dashboard/investments

# Should see:
- Table with all user investments
- Columns: User, Plan, Amount, Start Date, Maturity, Status, Profit
- Filter dropdown by status
- Search bar for email/name/plan
- Detail modals on row click
```

#### Test Filtering
```bash
# Filter by status: "ACTIVE"
# Should only show investments with status=ACTIVE

# Filter by status: "PENDING"
# Should only show investments with status=PENDING

# Filter by status: "COMPLETED"
# Should only show investments with status=COMPLETED
```

#### Test Search
```bash
# Search for user email: "test@example.com"
# Should filter table to show only this user's investments

# Search for plan name: "Starter"
# Should show only investments in Starter plans

# Search for reference ID
# Should find that specific investment record
```

#### Test Detail Modal
```bash
# Click on any investment row
# Modal should show:
- Complete investment details
- Calculation breakdown
- Status and dates
- Close button
```

---

### Phase 5: Multi-Currency Backend

#### Test Currency Detection
```bash
# Test from different IP addresses
curl http://localhost:3001/currency/detect

# From US IP:
# { 
#   "country": "US",
#   "currency": "USD",
#   "conversionRate": 1.0,
#   "currencySymbol": "$"
# }

# From Brazil IP:
# {
#   "country": "BR", 
#   "currency": "BRL",
#   "conversionRate": 5.25,
#   "currencySymbol": "R$"
# }

# From Nigeria IP:
# {
#   "country": "NG",
#   "currency": "NGN", 
#   "conversionRate": 1550.50,
#   "currencySymbol": "₦"
# }
```

#### Test FX Rate Fetching
```bash
# Get specific rates
curl "http://localhost:3001/currency/rates?base=USD&targets=EUR,GBP,JPY"

# Expected response:
# {
#   "base": "USD",
#   "rates": {
#     "EUR": 0.92,
#     "GBP": 0.79,
#     "JPY": 110.5
#   }
# }
```

#### Test Country Rules
```bash
# Get US rules
curl http://localhost:3001/currency/country/US

# Expected response:
# {
#   "country_code": "US",
#   "currency": "USD",
#   "kyc_level": "basic",
#   "payment_hints": ["ACH", "Wire Transfer", "Card"],
#   "is_blocked": false,
#   "tax_rate_percent": 25
# }

# Get blocked country (if configured)
# Should return: { "is_blocked": true, "message": "Trading not available in your country" }
```

#### Test FX Cache
```bash
# Check cache statistics
curl http://localhost:3001/currency/admin/cache-stats

# Expected response:
# {
#   "totalRequests": 42,
#   "cacheHits": 35,
#   "cacheMisses": 7,
#   "hitRate": 0.83,
#   "cacheSize": 12,
#   "entries": [...]
# }

# Hit rate should be high (>80%) after several requests
```

#### Test Cache Clearing
```bash
# Clear FX rate cache (admin only)
curl -X PUT http://localhost:3001/currency/admin/clear-cache \
  -H "Authorization: Bearer <admin_token>"

# Expected response:
# {
#   "message": "Cache cleared successfully",
#   "itemsCleared": 12
# }

# Next rate request should fetch fresh data (cache miss)
```

#### Test Graceful Fallback
```bash
# Temporarily block primary FX provider endpoint
# Make rate request
# Service should:
# 1. Try primary provider ❌ (blocked)
# 2. Try fallback provider ✓ (succeeds)
# 3. Return response with: { "is_fallback_rate": true }
# 4. Cache the result
```

#### Test Country Rules in Transaction
```bash
# Make a deposit/withdrawal that records transaction
# Check transaction document in MongoDB:

db.transactions.findOne({ _id: ObjectId("...") })

# Should contain:
{
  amount_usd: 100,
  amount_local: 520,              // 100 × 5.20 BRL rate
  currency_code: "BRL",
  conversion_rate: 5.20,
  country_code: "BR",
  tax_estimate_local: 78,         // 520 × 15% tax
  is_fallback_rate: false
}
```

---

### Phase 6: Multi-Currency Frontend

#### Test Currency Store Initialization
```bash
# Open browser console
# Check localStorage (DevTools → Application → localStorage)

# Should contain:
{
  "VARLIXO_CURRENCY_CODE": "BRL",
  "VARLIXO_CURRENCY_SYMBOL": "R$",
  "VARLIXO_LOCALE": "pt-BR",
  "VARLIXO_COUNTRY": "BR"
}

# On next page load, should use these values
```

#### Test Money Component
```bash
# In any component using Money:
<Money valueUsd={100} />

# Depending on user location:
# US: $100.00
# Brazil: R$ 520.00
# Nigeria: ₦155,050.00
# Japan: ¥11,050
# UK: £79.00

# With fallback rate:
# Should show asterisk: R$ 520.00*
# Hover tooltip shows: "Using fallback exchange rate"
```

#### Test Currency Preference Persistence
```bash
# User logs in from US → sees USD
# User navigates to /dashboard
# User manually selects EUR currency
# Reload page → still shows EUR (persisted)
# Close browser, reopen → still shows EUR (localStorage)
```

#### Test Auto-Detection
```bash
# Set AUTO_CURRENCY=true in .env
# New user visits site
# Frontend should:
1. Check localStorage (none)
2. Call /currency/detect
3. Get country_code and currency
4. Update store
5. Display amounts in that currency

# Clear localStorage and refresh to test again
```

---

### Phase 7: Environment Variables

#### Verify All Variables Set
```bash
# Backend .env should contain:
echo $SMTP_HOST           # should print: smtp.mailerlite.com
echo $AUTO_CURRENCY       # should print: true
echo $FX_PROVIDER_PRIMARY # should print: exchangerate.host
echo $FX_TTL_SECONDS      # should print: 3600
```

#### Verify Configuration Loading
```bash
# Backend startup logs should show:
# [AppModule] Initializing with config:
# - AUTO_CURRENCY: true
# - DEFAULT_CURRENCY: USD
# - FX_TTL_SECONDS: 3600
# - SMTP_HOST: smtp.mailerlite.com
```

---

### Integration Tests

#### Complete User Flow
```bash
# 1. New user signs up
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Response: { sendOtpEmail: true, otpId: "..." }

# 2. User receives email with OTP
# (Check email client or MailerLite logs)

# 3. User verifies email with OTP
curl -X POST http://localhost:3001/auth/otp/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "otp": "123456"
  }'

# 4. User logs in
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'

# Response: { user, accessToken, refreshToken }

# 5. User detects their currency
# Frontend calls: GET /currency/detect
# User sees amounts in their local currency

# 6. User explores investment plans
# Sees 6 plans with correct rates
# All amounts displayed in local currency via Money component

# 7. User invests $1000 in Starter Yield
# Investment record created
# Daily profit accrual starts

# 8. Admin views investment
# Navigate to /admin/dashboard/investments
# Filter and search working
# Can view all user investments
```

---

## 🚨 Common Issues & Debugging

### Issue: OTP Not Sending
```bash
# Check logs:
tail -f backend/logs.txt | grep SMTP

# Should show: "SMTP connected successfully"
# If not:
1. Verify SMTP_HOST and SMTP_PORT in .env
2. Check SMTP_USER and SMTP_PASS
3. Verify email account is active in MailerLite
4. Check firewall/port 587 is accessible
```

### Issue: FX Rates Not Updating
```bash
# Check logs for API calls
tail -f backend/logs.txt | grep "ExchangeRate"

# Test providers manually:
curl https://api.exchangerate.host/latest?base=USD
curl https://open.er-api.com/v6/latest?base=USD

# If both fail:
1. Check internet connectivity
2. Check if providers are blocking your IP
3. Increase FX_TTL_SECONDS to cache longer
4. Check logs for specific error messages
```

### Issue: Currency Store Not Persisting
```bash
# Check browser console for errors
console.log(localStorage)

# Should show VARLIXO_CURRENCY_CODE, etc.
# If not:
1. Check if localStorage is enabled
2. Check browser privacy settings
3. Look for errors in useCurrencyStore hook
```

### Issue: Admin Page Shows 404
```bash
# Verify file exists:
ls -la frontend/app/admin/dashboard/investments/page.tsx

# Should exist and contain page component
# Check import paths are correct
# Verify __layout__ structure
```

---

## 📊 Performance Checks

### Check FX Cache Efficiency
```bash
# Make 100 requests in quick succession
for i in {1..100}; do
  curl -s "http://localhost:3001/currency/detect" | jq .
done

# Check cache stats
curl http://localhost:3001/currency/admin/cache-stats

# Hit rate should be 95%+
# TTL should prevent stale data
```

### Check Email Queue
```bash
# Monitor SMTP queue
# MailerLite admin → Activity → Recent Sends
# All OTPs should be delivered within 1 second
```

### Check Database Indexes
```bash
# Verify TTL index on OTP collection:
db.otps.getIndexes()

# Should show:
# { 
#   "key": { "createdAt": 1 },
#   "expireAfterSeconds": 600
# }

# Verify other indexes for query performance
db.investment_plans.getIndexes()
db.country_rules.getIndexes()
```

---

## ✅ Sign-Off Criteria

All tests pass if:
- [ ] OTP sends and expires after 10 minutes
- [ ] Email arrives via MailerLite SMTP
- [ ] Forgot password flow completes successfully
- [ ] New user can login with new password
- [ ] All 6 investment plans display with correct rates
- [ ] Admin can access investments dashboard
- [ ] Filtering and search work on admin page
- [ ] Currency detects from user's country
- [ ] FX rates fetch from primary/fallback providers
- [ ] Money component displays correct local currency
- [ ] Currency preference persists across sessions
- [ ] Country rules load correctly
- [ ] Tax rates display accurately
- [ ] All API endpoints return expected responses
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser
- [ ] No critical errors in backend logs

---

**Ready for Production ✅**

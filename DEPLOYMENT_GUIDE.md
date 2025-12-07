# 🚀 VARLIXO DEPLOYMENT GUIDE

## ✅ Current Status
- **Code**: ✅ Pushed to GitHub (main branch)
- **Backend**: ✅ Running locally on port 5000
- **Frontend**: ✅ Running locally on port 3000
- **Database**: ✅ Connected to MongoDB Atlas
- **Email**: ✅ Configured with MailerLite SMTP

---

## 📋 QUICK DEPLOYMENT CHECKLIST

### Part 1: Deploy Backend to Render.com (10 minutes)

#### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easier)
3. Authorize Varlixo repository

#### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Select your `varlixo` GitHub repository
3. Configure:
   - **Name**: `varlixo-backend`
   - **Region**: US East (or closest to your users)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

#### Step 3: Add Environment Variables
Click "Environment" and add these:

```
MONGODB_URI=mongodb+srv://tomkeifermanagementgroup_db_user:yUJcPnLkS7lFzvSB@varlixo.8upxipu.mongodb.net/varlixo?retryWrites=true&w=majority&appName=varlixo

JWT_SECRET=varlixo-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=varlixo-super-secret-refresh-key-2024
JWT_REFRESH_EXPIRES_IN=30d

NODE_ENV=production
PORT=5000

FRONTEND_URL=https://varlixo.vercel.app

SMTP_HOST=smtp.mailerlite.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=georgestraitmanagementgroup0@gmail.com
SMTP_PASS=[YOUR_MAILERLITE_API_TOKEN]
EMAIL_FROM=noreply@varlixo.com
SKIP_SMTP_VERIFICATION=false

ADMIN_SECRET_ROUTE=secure-admin-panel-2024
ADMIN_DEFAULT_EMAIL=admin@varlixo.com
ADMIN_DEFAULT_PASSWORD=Admin123!@#

AUTO_CURRENCY_ENABLED=true
AUTO_PROFIT_ENABLED=true
```

#### Step 4: Deploy
Click "Deploy" → Render will automatically build and deploy
- Build takes ~3-5 minutes
- You'll get a URL like: `https://varlixo-backend.onrender.com`
- **Copy this URL** - you'll need it for frontend

---

### Part 2: Deploy Frontend to Vercel (5 minutes)

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Varlixo repository

#### Step 2: Import Project
1. Click "Add New..."
2. Select `varlixo` repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### Step 3: Add Environment Variables
Before deploying, add this:

```
NEXT_PUBLIC_API_URL=https://varlixo-backend.onrender.com
```

(Replace with your actual Render backend URL from Step 1)

#### Step 4: Deploy
Click "Deploy" → Vercel will automatically build and deploy
- Build takes ~2-3 minutes
- You'll get a URL like: `https://varlixo.vercel.app`
- Site is immediately live! 🎉

---

## 🔗 Post-Deployment Configuration

### Update Backend's FRONTEND_URL
Once Vercel gives you your frontend URL:
1. Go to Render dashboard
2. Go to your `varlixo-backend` service
3. Click "Environment"
4. Update `FRONTEND_URL` to your Vercel URL
5. Click "Save Changes" - backend auto-redeploys

### Verify Deployment
1. Open your Vercel frontend URL
2. Login page should load
3. Try registering → should trigger email
4. Check MongoDB Atlas for user creation
5. Check admin dashboard

---

## 🛠️ Troubleshooting

### Frontend shows "Cannot GET /api/v1/..."
**Problem**: `NEXT_PUBLIC_API_URL` not set correctly
**Fix**: 
1. Go to Vercel Settings
2. Add/update `NEXT_PUBLIC_API_URL=https://varlixo-backend.onrender.com`
3. Redeploy

### Email not sending
**Problem**: SMTP firewall blocking
**Fix**: 
1. In Render environment, set `SKIP_SMTP_VERIFICATION=false`
2. Or use MailerLite API instead of SMTP

### Database connection fails
**Problem**: MongoDB URI expired or IP not whitelisted
**Fix**:
1. Check MongoDB Atlas IP whitelist
2. Add Render IP: https://docs.render.com/outbound-ips
3. Or allow all IPs (0.0.0.0/0)

### Build fails on Render
**Problem**: Missing dependencies
**Fix**:
1. Run `npm install` locally in both folders
2. Verify `package-lock.json` is committed
3. Push again

---

## 📊 After Deployment

### Monitor Backend Performance
- Render dashboard shows logs, CPU, memory
- Check for error patterns

### Monitor Frontend Performance
- Vercel analytics in dashboard
- Check Core Web Vitals

### Update DNS (Optional)
If you have a custom domain:
1. Add CNAME records pointing to Vercel
2. Update `FRONTEND_URL` in Render backend

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a random 32-char string
- [ ] Change `ADMIN_DEFAULT_PASSWORD` 
- [ ] Enable 2FA in dashboard settings
- [ ] Review MongoDB Atlas IP whitelist
- [ ] Set up rate limiting in production
- [ ] Enable HTTPS (Vercel/Render do this automatically)

---

## 📈 Next Steps

1. **Monitor Logs** - Check for any errors
2. **Test All Features** - Register, login, invest, withdraw
3. **Load Testing** - Use tools like k6 or JMeter
4. **Set Up Alerting** - Render/Vercel both have alerting
5. **Backup Database** - Schedule MongoDB backups

---

## 🚨 Emergency Rollback

If something breaks:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel/Render auto-redeploy
# Takes 2-5 minutes
```

---

**🎉 You're all set! Your platform is production-ready!**

For questions: Check the logs in Render and Vercel dashboards.

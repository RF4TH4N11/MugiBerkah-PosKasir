# Production Deployment Configuration

## Backend Status

✅ **Production URL**: https://mugiberkah.famsy.my.id  
✅ **API Status**: All endpoints responding 200 OK  
✅ **Database**: MongoDB Atlas (Connected)  
✅ **PM2 Cluster**: 2 instances running  
✅ **SSL/TLS**: Let's Encrypt certificates  
✅ **Reverse Proxy**: Nginx configured

## Frontend Configuration

### Environment Variables

File: `src/constant.ts`

```typescript
export const BASE_URL = "https://mugiberkah.famsy.my.id";
```

### Build Configuration

File: `vite.config.ts`

- Framework: React
- Build Tool: Vite
- Output: dist/
- Source Maps: Enabled

### Responsive Configuration

File: `tailwind.config.js`

```javascript
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
darkMode: 'class',
theme: {
  extend: {
    // Custom animations for fade-in, slide-up
  }
}
```

## Deployment Checklist

### Pre-Deployment

- [ ] Code pushed to GitHub/GitLab
- [ ] All tests passing
- [ ] Build successful locally
- [ ] Environment variables configured
- [ ] Backend health check passes

### Vercel Setup

- [ ] Repository connected to Vercel
- [ ] Build settings correct:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Environment variables added (if needed)
- [ ] Domain configured (optional)

### Post-Deployment

- [ ] Frontend loads at Vercel URL
- [ ] Mobile responsive verified
- [ ] API calls working
- [ ] Dark mode functional
- [ ] All pages accessible
- [ ] No console errors

## Performance Targets

### Lighthouse Scores

- Performance: > 85
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Core Web Vitals

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## API Integration

### Endpoints Used

```
GET  /api/health              - Health check
GET  /api/products            - All products
GET  /api/products/category   - By category
GET  /api/transactions        - Transaction list
GET  /api/transactions/stats  - Statistics
POST /api/transactions        - Create transaction
```

### Request/Response Format

- Method: REST
- Content-Type: application/json
- Auth: None (development)
- Timeout: 30s

## Monitoring & Debugging

### Vercel Dashboard

- Build logs: View build history
- Deployments: Track versions
- Analytics: Monitor performance
- Errors: View stack traces

### Frontend Debugging

```bash
# Check build output
npm run build

# Dev server with HMR
npm run dev

# Preview production build
npm run preview

# Lint check
npm run lint
```

### Backend Health

```bash
# Check API health
curl https://mugiberkah.famsy.my.id/api/health

# Expected response
{"status":"ok","message":"Server is running"}
```

## Scaling Considerations

### Frontend

- Vercel auto-scales
- CDN cache enabled
- Edge locations optimized
- Bandwidth unlimited

### Backend

- PM2 cluster mode (2 instances)
- Scale up: Increase instances in ecosystem.config.cjs
- Load testing: Use Apache Bench or Artillery
- Monitor: PM2 Plus dashboard

## Security Settings

### Headers

- HTTPS enforced
- CORS configured for API
- Content Security Policy
- X-Frame-Options: SAMEORIGIN

### Backend Protection

- Rate limiting (optional)
- Input validation
- SQL injection prevention
- CSRF tokens (not needed for API)

## Rollback Procedure

### If Deployment Fails

1. **Vercel**: Click "Redeploy" for previous version
2. **GitHub**: Revert commit and push
3. **Database**: No changes (read-only from frontend)

### Version Control

```bash
# View deployment history
vercel deployments

# Rollback to previous
vercel rollback
```

## Maintenance

### Weekly

- Monitor performance metrics
- Check error rates
- Review user feedback

### Monthly

- Update dependencies
- Security audit
- Performance optimization

### Quarterly

- Full feature review
- Accessibility audit
- Load testing

## Support Contacts

### Vercel Support

- Dashboard: https://vercel.com
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com/

### MongoDB Atlas

- Console: https://cloud.mongodb.com
- Docs: https://docs.mongodb.com/atlas

### Nginx/PM2

- Server: AWS EC2
- SSH Access: [Configure SSH key]

---

## Quick Deploy Command

```bash
# One-click deploy to Vercel
vercel --prod
```

## Post-Deploy Validation

```bash
# Test API connectivity
curl -I https://mugiberkah.famsy.my.id/api/health

# Check frontend
curl -I https://[your-vercel-domain]

# Verify responsive design
# Open in DevTools → Device Toolbar
# Test: 375px (iPhone), 768px (iPad), 1440px (Desktop)
```

---

**Last Updated**: 2024
**Status**: Ready for Production Deployment ✅

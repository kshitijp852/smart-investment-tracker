# Deployment Checklist

## Pre-Deployment

- [ ] Code is working locally
- [ ] All tests pass
- [ ] Environment variables documented
- [ ] Code pushed to GitHub

## Build

- [ ] Run `cd client && npm run build`
- [ ] Check `client/dist` folder exists
- [ ] No build errors

## Netlify (Client)

- [ ] Account created
- [ ] Site deployed
- [ ] Custom domain added (optional)
- [ ] Environment variable `REACT_APP_API_URL` set
- [ ] Site is accessible

## Render (Server)

- [ ] Account created
- [ ] Web service created
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `JWT_SECRET` (random string)
  - [ ] `MONGODB_URI` (from Atlas)
- [ ] Service is running
- [ ] Health check passes: `/api/health`

## MongoDB Atlas (Database)

- [ ] Account created
- [ ] Free cluster created (M0)
- [ ] Database user created
- [ ] IP whitelist: 0.0.0.0/0
- [ ] Connection string copied
- [ ] Connection string added to Render

## Integration

- [ ] Netlify points to Render URL
- [ ] CORS configured correctly
- [ ] Database seeded: `curl -X GET .../api/data/mock-seed`

## Testing

- [ ] Client loads
- [ ] Can register new user
- [ ] Can login
- [ ] Can get recommendations
- [ ] All 3 bucket options show
- [ ] Mobile responsive
- [ ] Works in Chrome
- [ ] Works in Safari
- [ ] Works in Firefox

## Optional

- [ ] Custom domain configured
- [ ] SSL certificate active (auto with Netlify)
- [ ] Google Analytics added
- [ ] Error monitoring (Sentry)
- [ ] Daily MFApi sync cron job

## Post-Deployment

- [ ] Share URL with team
- [ ] Document any issues
- [ ] Monitor error logs
- [ ] Collect user feedback

---

## Quick Reference

**Netlify Dashboard**: https://app.netlify.com/
**Render Dashboard**: https://dashboard.render.com/
**MongoDB Atlas**: https://cloud.mongodb.com/

**Your URLs**:
- Client: `https://__________.netlify.app`
- Server: `https://__________.onrender.com`

**Important Commands**:
```bash
# Build client
cd client && npm run build

# Seed database
curl -X GET https://your-server.onrender.com/api/data/mock-seed

# Test health
curl https://your-server.onrender.com/api/health

# Test recommendations
curl "https://your-server.onrender.com/api/buckets/generate?amount=50000&risk=medium"
```

---

## Rollback Plan

If something goes wrong:

1. **Netlify**: Go to Deploys → Click previous deploy → "Publish deploy"
2. **Render**: Go to Events → Click previous deploy → "Redeploy"
3. **Database**: Restore from backup (if configured)

---

## Support

- Netlify Docs: https://docs.netlify.com/
- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com/

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

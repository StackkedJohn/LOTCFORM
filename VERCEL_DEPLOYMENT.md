# Vercel Deployment Guide

## Quick Deploy

1. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import from GitHub: `StackkedJohn/LOTCFORM`

2. **Configure Environment Variables**

   In Vercel project settings, add these environment variables:

   ```
   NEON_ORG_ID=lotcarolinas
   NEON_API_KEY=your_api_key_here
   NEON_API_BASE_URL=https://api.neoncrm.com/v2
   NODE_ENV=production
   ```

3. **Build Settings** (should auto-detect)
   - Framework Preset: Other
   - Build Command: `npm install`
   - Output Directory: `.`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your form will be live!

## Post-Deployment

### Testing
- Visit your Vercel URL
- Test form submission
- Verify Neon CRM integration
- Check submissions are saved

### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Environment Variables Management
- Navigate to Project Settings → Environment Variables
- Add/Edit variables as needed
- Redeploy for changes to take effect

## Important Notes

- **Submissions Folder**: The `/submissions` directory is committed to Git. This is intentional for backup purposes.
- **Environment Variables**: Never commit `.env` file. Always use Vercel's environment variable settings.
- **Neon CRM**: Ensure API credentials are valid and have proper permissions.

## Monitoring

- Check Vercel deployment logs for errors
- Monitor form submissions in both Vercel logs and Neon CRM
- Review JSON backups in `/submissions` directory

## Support

For issues:
1. Check Vercel deployment logs
2. Review NEON_INTEGRATION.md for API troubleshooting
3. Test locally first: `npm start`

# Deployment Guide

This guide provides detailed instructions for deploying the OpenAPI Swagger Viewer to various platforms.

## GitHub Pages

### Prerequisites
- Repository: [girijashankarj/garry-openapi-swagger-viewer](https://github.com/girijashankarj/garry-openapi-swagger-viewer)
- GitHub Pages enabled in repository settings

### Setup Instructions

#### 1. Enable GitHub Pages

1. Go to your repository: https://github.com/girijashankarj/garry-openapi-swagger-viewer
2. Click **Settings** (in the repository navigation bar)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, configure:
   - **Source**: `Deploy from a branch`
   - **Branch**: Select `main`
   - **Folder**: `/ (root)`
5. Click **Save**

**Important:** After enabling Pages, wait 1-2 minutes before triggering the workflow.

#### 2. Configure GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that will automatically deploy when you push to `main`.

Once Pages is enabled, the workflow will:
- Build the site
- Deploy to GitHub Pages
- Make it available at `https://girijashankarj.github.io/garry-openapi-swagger-viewer/`

#### 3. Deploy

**Option A: Automatic (after enabling Pages)**
```bash
# Push your code
git push origin main

# The workflow will automatically trigger
# Check: https://github.com/girijashankarj/garry-openapi-swagger-viewer/actions
```

**Option B: Manual trigger**
1. Go to https://github.com/girijashankarj/garry-openapi-swagger-viewer/actions
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

#### 4. Access Your Site

After deployment completes (usually 1-2 minutes), your site will be available at:
- **Main URL**: `https://girijashankarj.github.io/garry-openapi-swagger-viewer/openapi-viewer.html`
- **Direct link**: `https://girijashankarj.github.io/garry-openapi-swagger-viewer/`

Monitor deployment status at:
- https://github.com/girijashankarj/garry-openapi-swagger-viewer/actions

### Troubleshooting

**Error: "Get Pages site failed" or "HttpError: Not Found"**
- ✅ **Fix**: Enable GitHub Pages first at: https://github.com/girijashankarj/garry-openapi-swagger-viewer/settings/pages
- ✅ Select "Deploy from a branch" → `main` → `/ (root)`
- ✅ Wait 1-2 minutes after enabling before running the workflow
- ✅ Check workflow status: https://github.com/girijashankarj/garry-openapi-swagger-viewer/actions

**Workflow fails**
- Check the Actions tab: https://github.com/girijashankarj/garry-openapi-swagger-viewer/actions
- Ensure Pages is enabled (see above)
- Verify you're pushing to the `main` branch
- Check repository permissions in Settings → Actions → General

## Netlify

### Option 1: Netlify Dashboard

1. Go to [Netlify](https://www.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `echo "No build step"`
   - **Publish directory**: `.`
5. Click **Deploy site**

The `netlify.toml` file will automatically configure redirects and headers.

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## Vercel

### Option 1: Vercel Dashboard

1. Go to [Vercel](https://vercel.com/)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect settings from `vercel.json`
5. Click **Deploy**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Manual Deployment

You can deploy to any static hosting service:

### AWS S3 + CloudFront

1. Create an S3 bucket
2. Upload all files to the bucket
3. Enable static website hosting
4. Configure CloudFront distribution
5. Point your domain to CloudFront

### Google Cloud Storage

1. Create a storage bucket
2. Upload files
3. Enable static website hosting
4. Configure load balancer or Cloud CDN

### Azure Static Web Apps

1. Create a Static Web App resource
2. Connect your GitHub repository
3. Configure build settings (no build needed)
4. Deploy

### Traditional Web Server (nginx/Apache)

1. Upload files to your web server
2. Configure server to serve `openapi-viewer.html` as index
3. Ensure proper MIME types are set

## Environment-Specific Notes

### Custom Domain

For all platforms, you can configure a custom domain:
- **GitHub Pages**: Settings → Pages → Custom domain
- **Netlify**: Site settings → Domain management
- **Vercel**: Project settings → Domains

### HTTPS

All recommended platforms provide HTTPS by default. Ensure your custom domain has SSL configured.

### CORS and CDN

The application uses CDN resources. Ensure your hosting platform allows:
- Loading external scripts (Tailwind, Swagger UI, etc.)
- Fetching resources from CDNs

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] "Load Sample" button works
- [ ] File upload works
- [ ] All CDN resources load
- [ ] HTTPS is enabled
- [ ] Custom domain configured (if applicable)
- [ ] Analytics/monitoring set up (optional)

## Support

If you encounter deployment issues:
1. Check the platform's documentation
2. Review error logs in the platform dashboard
3. Verify all files are present in the repository
4. Ensure file permissions are correct

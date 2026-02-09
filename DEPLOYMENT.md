# Deployment Guide - GitHub Pages

This guide provides detailed instructions for deploying Garry Micro Dev Utilities to GitHub Pages.

## Prerequisites

- Repository: [girijashankarj/garry-micro-dev-utilities](https://github.com/girijashankarj/garry-micro-dev-utilities)
- GitHub Pages enabled in repository settings
- GitHub Actions enabled

## Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/girijashankarj/garry-micro-dev-utilities
2. Click **Settings** (in the repository navigation bar)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, configure:
   - **Source**: `Deploy from a branch`
   - **Branch**: Select `main`
   - **Folder**: `/ (root)`
5. Click **Save**

**Important:** After enabling Pages, wait 1-2 minutes for GitHub to initialize Pages before triggering the workflow.

### Step 2: Automatic Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys when you push to `main`.

Once Pages is enabled, the workflow will:
- Build the site
- Deploy to GitHub Pages
- Make it available at `https://girijashankarj.github.io/garry-micro-dev-utilities/`

### Step 3: Deploy

**Automatic (on push):**
```bash
git push origin main

# The workflow will automatically trigger
# Check status: https://github.com/girijashankarj/garry-micro-dev-utilities/actions
```

**Manual trigger:**
1. Go to: https://github.com/girijashankarj/garry-micro-dev-utilities/actions
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

### Step 4: Access Your Site

After deployment completes (usually 1-2 minutes), your site will be live at:
- **Main URL**: `https://girijashankarj.github.io/garry-micro-dev-utilities/`
- **Direct link**: `https://girijashankarj.github.io/garry-micro-dev-utilities/index.html`

Monitor deployment status at:
- https://github.com/girijashankarj/garry-micro-dev-utilities/actions

## Troubleshooting

### Error: "Get Pages site failed" or "HttpError: Not Found"

**Fix:**
1. Enable GitHub Pages first at: https://github.com/girijashankarj/garry-micro-dev-utilities/settings/pages
2. Select "Deploy from a branch" → `main` → `/ (root)`
3. Wait 1-2 minutes after enabling before running the workflow
4. Check workflow status: https://github.com/girijashankarj/garry-micro-dev-utilities/actions

### Workflow Fails

- Check the Actions tab: https://github.com/girijashankarj/garry-micro-dev-utilities/actions
- Ensure Pages is enabled (see above)
- Verify you're pushing to the `main` branch
- Check repository permissions in Settings → Actions → General
- Ensure GitHub Actions is enabled in repository settings

### Site Not Updating

- Wait 1-2 minutes for deployment to complete
- Clear browser cache (Ctrl/Cmd + Shift + R)
- Check Actions tab for deployment status
- Verify the latest commit is on `main` branch

## Custom Domain (Optional)

To use a custom domain:

1. Go to repository Settings → Pages
2. Enter your custom domain in the "Custom domain" field
3. Follow GitHub's DNS configuration instructions
4. Wait for DNS propagation (can take up to 24 hours)

## Post-Deployment Checklist

- [ ] Site loads correctly at GitHub Pages URL
- [ ] All tool cards are visible
- [ ] Tools load when clicked
- [ ] File uploads work (OpenAPI, CSV, etc.)
- [ ] Sample data loads correctly
- [ ] All CDN resources load
- [ ] HTTPS is enabled (automatic on GitHub Pages)
- [ ] Mobile view works correctly

## GitHub Pages Limitations

- **Repository must be public** (or GitHub Pro for private repos)
- **Build time**: Usually 1-2 minutes
- **Bandwidth**: 1GB/month for free accounts
- **Storage**: 1GB limit

## Support

If you encounter deployment issues:

1. Check GitHub Actions logs: https://github.com/girijashankarj/garry-micro-dev-utilities/actions
2. Review GitHub Pages documentation: https://docs.github.com/en/pages
3. Verify all files are committed and pushed
4. Check repository settings for Pages configuration

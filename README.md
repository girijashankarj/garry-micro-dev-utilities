# Garry OpenAPI Swagger Viewer

<p align="center">
  <strong>Single-file Swagger UI viewer</strong><br/>
  Upload any OpenAPI YAML/JSON and render it instantly in a clean, professional UI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML-5-orange?logo=html5" alt="HTML5" />
  <img src="https://img.shields.io/badge/Tailwind-CDN-blue?logo=tailwindcss" alt="Tailwind CDN" />
  <img src="https://img.shields.io/badge/Swagger%20UI-5.17.14-black?logo=swagger" alt="Swagger UI" />
  <img src="https://img.shields.io/badge/js--yaml-4.1.0-yellow" alt="js-yaml" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  <img src="https://img.shields.io/badge/status-production--ready-brightgreen" alt="Production Ready" />
</p>

---

## Overview

**Garry OpenAPI Swagger Viewer** is a tiny dev utility to render **OpenAPI 3.x** specs using **Swagger UI**.

It is designed for quick sharing in teams:
- one HTML file UI
- one sample OpenAPI spec
- one README

No build step. No backend.

---

## What this repo contains

| File | Purpose |
| --- | --- |
| `openapi-viewer.html` | Main UI: Tailwind + Swagger UI + YAML/JSON upload |
| `pizza-store.yaml` | Sample Pizza Store CRUD API (9 endpoints) |
| `README.md` | Documentation |
| `LICENSE` | MIT License |
| `package.json` | Project metadata and scripts |
| `.gitignore` | Git ignore rules |
| `.github/workflows/` | CI/CD pipelines (GitHub Actions) |
| `netlify.toml` | Netlify deployment configuration |
| `vercel.json` | Vercel deployment configuration |
| `scripts/validate-openapi.js` | OpenAPI spec validation script |

---

## Features

- ✅ Upload **.yaml / .yml / .json** OpenAPI files and render instantly
- ✅ **Load Sample** button to preview quickly (`pizza-store.yaml`)
- ✅ Clean “LinkedIn-like” professional theme
- ✅ Runs fully in the browser (no backend required)
- ✅ No installation, no bundler, no build step
- ✅ **Production-ready**: Security headers, accessibility, error handling
- ✅ **Keyboard shortcuts**: Ctrl/Cmd+O to open file, Esc to clear
- ✅ **File size validation**: 10MB limit with user-friendly errors
- ✅ **OpenAPI validation**: Validates spec structure before rendering
- ✅ **Loading states**: Visual feedback during file operations
- ✅ **Error boundaries**: Graceful error handling and recovery

---

## Quick Start

### Recommended (local server)
`Load Sample` uses `fetch()` so most browsers block it on `file://`.

Run a simple local server:

```bash
python3 -m http.server 8080
```

Open:

- `http://localhost:8080/openapi-viewer.html`

Now:
- Click **Load Sample** to load `pizza-store.yaml`
- Or upload your own OpenAPI YAML/JSON file

### Alternate (file://)
You can open `openapi-viewer.html` directly by double-clicking.
- Upload still works
- Only **Load Sample** may fail due to browser restrictions

---

## Sample API: Pizza Store (9 endpoints)

Included sample spec: `pizza-store.yaml`

Endpoints:
- `GET /pizzas`
- `POST /pizzas`
- `GET /pizzas/{pizzaId}`
- `PUT /pizzas/{pizzaId}`
- `DELETE /pizzas/{pizzaId}`
- `GET /orders`
- `POST /orders`
- `GET /orders/{orderId}`
- `DELETE /orders/{orderId}`

---

## CDN Dependencies

This project uses pinned CDN versions for security and stability:
- **TailwindCSS** 3.4.1 (via CDN)
- **Swagger UI** 5.17.14 (via unpkg)
- **js-yaml** 4.1.0 (via jsDelivr)
- **Font Awesome** 6.5.1 (via Cloudflare CDN)

All dependencies are loaded from reputable CDNs with integrity checks where possible.

---

## Production Deployment

### GitHub Pages

1. Push your code to a GitHub repository
2. Go to **Settings** → **Pages**
3. Select source branch (e.g., `main`)
4. The GitHub Actions workflow will automatically deploy on push

Or use the included workflow:
```bash
git push origin main
# GitHub Actions will deploy automatically
```

### Netlify

1. Connect your repository to Netlify
2. Build settings:
   - Build command: `echo "No build step"`
   - Publish directory: `.`
3. Deploy!

Or use Netlify CLI:
```bash
netlify deploy --prod
```

### Vercel

1. Import your repository in Vercel dashboard
2. Vercel will auto-detect settings from `vercel.json`
3. Deploy!

Or use Vercel CLI:
```bash
vercel --prod
```

### Manual Deployment

Simply upload all files to any static hosting service:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Any web server (nginx, Apache, etc.)

---

## Development

### Local Development

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js (if you have http-server installed)
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080/openapi-viewer.html`

### Validation

Validate OpenAPI specs:
```bash
node scripts/validate-openapi.js pizza-store.yaml
```

---

## Security Features

- ✅ Content Security Policy (CSP) headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection enabled
- ✅ Pinned CDN dependency versions
- ✅ File size limits (10MB)
- ✅ Input validation and sanitization
- ✅ Error boundary for unhandled errors

---

## Accessibility

- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Semantic HTML structure

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Requires modern browser with ES6+ support.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

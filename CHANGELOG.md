# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-09

### Added
- Production-ready HTML viewer with security headers
- Pinned CDN dependency versions for stability
- Comprehensive error handling and validation
- Accessibility improvements (ARIA labels, keyboard navigation)
- File size validation (10MB limit)
- OpenAPI specification validation
- Loading states and visual feedback
- Keyboard shortcuts (Ctrl/Cmd+O, Esc)
- Error boundaries for graceful error handling
- CI/CD pipelines (GitHub Actions)
- Deployment configurations (GitHub Pages, Netlify, Vercel)
- Validation script for OpenAPI specs
- Comprehensive documentation

### Security
- Content Security Policy (CSP) headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection enabled
- Pinned CDN versions with integrity checks

### Changed
- Improved error messages with actionable feedback
- Enhanced UI with loading indicators
- Better file handling with size limits

### Fixed
- Improved browser compatibility
- Better error recovery mechanisms

[1.0.0]: https://github.com/yourusername/garry-openapi-swagger-viewer/releases/tag/v1.0.0

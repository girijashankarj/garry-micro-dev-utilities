# Architecture Overview

## Project Structure

```
garry-micro-dev-utilities/
├── index.html                 # Single HTML file with dashboard + all tools
├── samples/                   # Sample data files
│   └── pizza-store.yaml
├── README.md                  # Main documentation
├── ARCHITECTURE.md            # This file
└── package.json               # Project metadata
```

**Single File Design**: All tools are embedded in `index.html`. The dashboard shows tool cards, and clicking a card loads the tool section dynamically using JavaScript.

## Design Philosophy

### Core Principles

1. **Zero Backend**: Everything runs in the browser
2. **Zero Login**: No authentication required
3. **Zero Build**: No compilation or bundling
4. **CDN Only**: All dependencies loaded via CDN
5. **Privacy First**: No data leaves the browser
6. **One Tool, One File**: Each tool is self-contained

### Shared Design System

All tools share:
- **Color Palette**: LinkedIn-inspired blue (#0A66C2) with light backgrounds
- **Typography**: Clean, readable fonts via Tailwind
- **Layout**: Consistent header with "Back to Home" link
- **Icons**: Font Awesome 6.5.1
- **Spacing**: Consistent padding and margins

## Tool Structure Pattern

Each tool is a section within `index.html`:

```html
<!-- Tool card in dashboard -->
<div class="tool-card" data-tool="tool-name">
  <!-- Card content -->
</div>

<!-- Tool section (hidden by default) -->
<div id="tool-tool-name" class="tool-section">
  <!-- Tool interface -->
</div>
```

**Navigation**: Clicking a tool card shows that tool's section and hides the dashboard. JavaScript handles show/hide logic.

## Tool Categories

### API & Backend
- OpenAPI Swagger Viewer ✅
- JWT Inspector
- API Response Diff
- Curl Command Visualizer
- API Contract Risk Analyzer

### Data & Formats
- JSON / YAML Formatter
- CSV Explorer

### Debugging & Security
- SQL Query Explainer

## Technical Stack

- **Styling**: Tailwind CSS 3.4.1 (CDN)
- **Icons**: Font Awesome 6.5.1 (CDN)
- **JavaScript**: Vanilla ES6+
- **No Frameworks**: Pure HTML/CSS/JS

## Security Model

- **CSP Headers**: Content Security Policy on all pages
- **No External Requests**: Tools don't send data anywhere
- **File Size Limits**: 10MB default limit per tool
- **Input Validation**: Client-side validation only
- **Error Boundaries**: Graceful error handling

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires ES6+ support.

## Development Guidelines

### Adding a New Tool

1. Create `tools/your-tool.html`
2. Follow the shared header pattern
3. Include "Back to Home" link
4. Add tool card to `index.html`
5. Update README.md
6. Test in multiple browsers

### Tool Requirements

- Self-contained HTML file
- No external API calls
- Clear instructions
- Error handling
- Accessibility (ARIA labels)
- Keyboard shortcuts (if applicable)

## Deployment

**Deployed on GitHub Pages**

The project uses GitHub Actions for automatic deployment:
- Push to `main` branch triggers deployment
- No build step required
- Static files served directly

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

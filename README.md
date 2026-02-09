# Garry Micro Dev Utilities

<p align="center">
  <strong>A collection of small, fast, browser-only developer tools</strong><br/>
  that solve everyday engineering problems.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/typescript-5.9-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-7-purple?logo=vite" alt="Vite 7" />
  <img src="https://img.shields.io/badge/tailwind-4-blue?logo=tailwindcss" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  <img src="https://img.shields.io/badge/status-production--ready-brightgreen" alt="Production Ready" />
</p>

---

## 🎯 Project Vision

**Garry Micro Dev Utilities** is a curated platform of browser-only developer tools inspired by [ilovepdf.com](https://www.ilovepdf.com) but for developers.

### Core Philosophy

- ✅ **Small, sharp utilities** - Each tool does ONE thing well
- ✅ **Zero backend** - Everything runs in your browser
- ✅ **Zero login** - No authentication required
- ✅ **Modern stack** - React 19, TypeScript, Vite
- ✅ **Maximum daily usefulness** - Tools you'll actually use

**This is NOT a SaaS. This is NOT a framework. This is a curated toolbox.**

---

## 🚀 Quick Start

**Prerequisites**: Node.js >= 20.19 (recommended: v24.13.0), npm >= 10

```bash
# Clone the repo
git clone https://github.com/girijashankarj/garry-micro-dev-utilities.git
cd garry-micro-dev-utilities

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Production Deployment

**Deployed on GitHub Pages**

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Enable Pages at: https://github.com/girijashankarj/garry-micro-dev-utilities/settings/pages
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)` → `/dist` (after build)
2. Push to `main` branch
3. Site will be live at: **https://girijashankarj.github.io/garry-micro-dev-utilities/**

The GitHub Actions workflow will automatically build and deploy on every push to `main`.

---

## 🛠️ Available Tools

### Tools Overview

```mermaid
mindmap
  root((Garry Micro<br/>Dev Utilities))
    Developer Tools
      Token Counter
      PII Removal Tool
    API & Backend
      OpenAPI Viewer
      JWT Inspector
      API Response Diff
      Curl Visualizer
      API Risk Analyzer
    Data & Formats
      JSON/YAML Formatter
      CSV Explorer
    Debugging & Security
      SQL Explainer
```

### API & Backend

| Tool | Status | Description |
|------|--------|-------------|
| **OpenAPI Swagger Viewer** | ✅ Available | Upload OpenAPI YAML/JSON and render interactive API documentation |
| **JWT Inspector** | ✅ Available | Decode and inspect JWT tokens offline. View header, payload, and expiration warnings |
| **API Response Diff** | ✅ Available | Compare two JSON API responses and highlight semantic differences and breaking changes |
| **Curl Command Visualizer** | ✅ Available | Parse curl commands, visualize headers/params/body, and convert to Fetch/Axios code |
| **API Contract Risk Analyzer** | ✅ Available | Analyze OpenAPI specs for missing error responses, weak validation, and breaking change risks |

### Data & Formats

| Tool | Status | Description |
|------|--------|-------------|
| **JSON / YAML Formatter** | ✅ Available | Format, validate, minify JSON/YAML. Convert between formats. Copy formatted output |
| **CSV Explorer** | ✅ Available | Upload CSV files, render as sortable table, search/filter rows, export to JSON |

### Debugging & Security

| Tool | Status | Description |
|------|--------|-------------|
| **SQL Query Explainer** | ✅ Available | Explain SQL queries without execution. Detect joins, filters, and potential performance issues |

### Developer Tools

| Tool | Status | Description |
|------|--------|-------------|
| **Token Counter** | ✅ Available | Count tokens in text or files using GPT tokenizer (cl100k_base). Features color-coded token visualization showing how text is tokenized, with hover tooltips for detailed token information. Includes side-by-side layout with token count statistics and interactive visualization |
| **PII Removal Tool** | ✅ Available | Identify and mask Personally Identifiable Information (PII) from files. Enter keywords to find and mask sensitive data values with custom patterns. Advanced matching options: case sensitivity, complete/substring matching, word boundaries. Download masked files with original format preserved |

**Total: 10 tools, all fully functional**

---

## 🎨 Design Principles

### User Experience

- **Simple & Clear**: No jargon, self-explanatory interfaces
- **Fast**: Instant results, no waiting
- **Private**: All processing happens in your browser
- **Accessible**: Keyboard navigation, screen reader support
- **Mobile-Friendly**: Works on all devices

### Technical Constraints

- ✅ Frontend only (React + TypeScript)
- ✅ No backend, no database
- ✅ No authentication
- ✅ Modern build tooling (Vite)
- ✅ Each tool works offline after load
- ✅ No user data stored

---

## 📁 Project Structure

```
garry-micro-dev-utilities/
├── src/
│   ├── components/          # React components
│   │   ├── tools/          # Tool components
│   │   ├── ui/             # shadcn/ui components
│   │   └── shared/         # Shared components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core business logic
│   │   └── utils/          # Utility functions
│   ├── store/              # Redux Toolkit store
│   ├── types/              # TypeScript types
│   ├── common/             # Constants, messages
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
│   └── samples/            # Sample data files
│       └── pizza-store.yaml
├── scripts/                # Utility scripts
│   └── validate-openapi.js
├── .github/workflows/      # CI/CD pipelines
│   ├── ci.yml              # Continuous Integration
│   ├── pr-check.yml        # PR checks
│   └── deploy.yml          # GitHub Pages deployment
├── README.md               # This file
├── ARCHITECTURE.md         # Architecture documentation
├── DEPLOYMENT.md           # GitHub Pages deployment guide
├── TOOLS.md                # Detailed tool specifications
├── CONTRIBUTING.md         # Contribution guidelines
├── CHANGELOG.md            # Version history
├── LICENSE                 # MIT License
├── package.json            # Project metadata
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── eslint.config.js        # ESLint configuration
```

**Modern React Architecture**: All tools are React components. Click a tool card in the dashboard to navigate to the tool component.

### Architecture Diagram

```mermaid
graph TB
    A[Vite Dev Server] --> B[React App]
    B --> C[Dashboard Component]
    B --> D[Tool Components]
    
    C --> E[Tool Cards Grid]
    E --> E1[Developer Tools]
    E --> F[API & Backend Tools]
    E --> G[Data & Formats Tools]
    E --> H[Debugging & Security Tools]
    
    E1 --> E1A[Token Counter]
    E1 --> E1B[PII Removal Tool]
    
    F --> F1[OpenAPI Viewer]
    F --> F2[JWT Inspector]
    F --> F3[API Response Diff]
    F --> F4[Curl Visualizer]
    F --> F5[API Risk Analyzer]
    
    G --> G1[JSON/YAML Formatter]
    G --> G2[CSV Explorer]
    
    H --> H1[SQL Explainer]
    
    I[User Clicks Card] --> J[React Router/Navigation]
    J --> K[Render Tool Component]
    J --> L[Hide Dashboard]
    
    K --> M[User Interacts]
    M --> N[Browser Processing]
    N --> O[Results Displayed]
    
    P[GitHub Actions] --> Q[Build with Vite]
    Q --> R[Deploy to GitHub Pages]
    R --> S[Live Site]
    
    style A fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#1f2937
    style B fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#1f2937
    style C fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151
    style D fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151
    style P fill:#d1d5db,stroke:#4b5563,stroke-width:2px,color:#1f2937
    style Q fill:#d1d5db,stroke:#4b5563,stroke-width:2px,color:#1f2937
    style R fill:#d1d5db,stroke:#4b5563,stroke-width:2px,color:#1f2937
    style S fill:#d1d5db,stroke:#4b5563,stroke-width:2px,color:#1f2937
```

### Tool Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant React
    participant Tool
    participant Browser
    
    User->>Dashboard: Opens app
    Dashboard->>User: Shows tool cards
    
    User->>Dashboard: Clicks tool card
    Dashboard->>React: setSelectedTool(toolId)
    React->>Dashboard: Hide dashboard
    React->>Tool: Render tool component
    
    User->>Tool: Uploads file / Pastes data
    Tool->>Browser: Process in browser
    Browser->>Tool: Return results
    Tool->>User: Display results
    
    User->>Tool: Clicks "Back to Home"
    Tool->>React: setSelectedTool(null)
    React->>Tool: Hide tool component
    React->>Dashboard: Show dashboard
    Dashboard->>User: Display tool cards
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture.

---

## 🔒 Security & Privacy

```mermaid
graph TB
    A[User Input] --> B[Browser Processing]
    B --> C{Validation}
    C -->|Valid| D[Process Locally]
    C -->|Invalid| E[Show Error]
    
    D --> F[Display Results]
    F --> G[User Views Results]
    
    H[File Upload] --> I{Size Check}
    I -->|>10MB| J[Reject]
    I -->|<10MB| B
    
    K[NPM Packages] --> L[Pinned Versions]
    L --> M[Security Audits]
    M --> B
    
    N[No Backend] --> O[No Data Transmission]
    O --> P[Privacy Guaranteed]
    
    style B fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#1f2937
    style O fill:#d1d5db,stroke:#4b5563,stroke-width:2px,color:#1f2937
    style P fill:#d1d5db,stroke:#4b5563,stroke-width:2px,color:#1f2937
    style J fill:#fca5a5,stroke:#dc2626,stroke-width:2px,color:#991b1b
```

**Security Features:**
- ✅ **No external requests** - Tools don't send data anywhere
- ✅ **File size limits** - 10MB default limit per tool
- ✅ **Input validation** - Client-side validation with TypeScript
- ✅ **Error boundaries** - Graceful error handling
- ✅ **Pinned dependencies** - All packages use specific versions
- ✅ **Type safety** - TypeScript ensures type safety

**All tools run entirely in your browser. No data is sent to any server.**

---

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Requires modern browser with ES6+ support.

---

## 🛠️ Technology Stack

```mermaid
graph LR
    A[React 19] --> B[TypeScript 5.9]
    A --> C[Vite 7]
    C --> D[Tailwind CSS v4]
    D --> E[shadcn/ui]
    
    F[Redux Toolkit] --> A
    G[Jest] --> H[Testing Library]
    I[ESLint 9] --> J[Prettier]
    
    A --> K[Browser]
    B --> K
    C --> K
    D --> K
    E --> K
    
    K --> L[User Interface]
    
    style A fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#1f2937
    style B fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#1f2937
    style C fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#1f2937
    style D fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#1f2937
    style E fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#1f2937
    style K fill:#d1d5db,stroke:#4b5563,stroke-width:2px,color:#1f2937
    style L fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151
```

**Dependencies:**
- **React 19** — UI framework
- **TypeScript 5.9** — Type safety
- **Vite 7** — Build tool
- **Tailwind CSS v4** — Styling
- **shadcn/ui** — UI component library
- **Redux Toolkit** — State management
- **Swagger UI React** — OpenAPI rendering
- **js-yaml** — YAML parsing
- **jwt-decode** — JWT token decoding
- **gpt-tokenizer** — Token counting and visualization
- **lucide-react** — Icon library
- **Jest + Testing Library** — Testing
- **ESLint 9 + Prettier** — Code quality

---

## 📝 Development

### Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Fix ESLint errors
- `npm run format` — Format code with Prettier
- `npm run format:check` — Check code formatting
- `npm test` — Run tests with coverage
- `npm run test:coverage` — Run tests with coverage report

### Code Quality

- **Type checking**: `tsc -b`
- **Linting**: ESLint 9 (flat config)
- **Formatting**: Prettier
- **Testing**: Jest + Testing Library (80% coverage minimum)

---

## 📝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding a New Tool

1. Create a new component in `src/components/tools/`
2. Add the tool to `src/common/constants.ts` (TOOLS array)
3. Import and add to `TOOL_COMPONENTS` mapping in `src/App.tsx`
4. Update this README with the new tool
5. Write tests for the new tool
6. Submit a pull request

See [TOOLS.md](TOOLS.md) for detailed tool specifications and patterns.

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [ilovepdf.com](https://www.ilovepdf.com)
- Built with [React](https://react.dev) and [Vite](https://vitejs.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- OpenAPI rendering by [Swagger UI](https://swagger.io/tools/swagger-ui/)
- YAML parsing by [js-yaml](https://github.com/nodeca/js-yaml)
- Token counting by [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer)
- Icons from [Lucide](https://lucide.dev)

---

## 🔗 Links

- **Live Site**: https://girijashankarj.github.io/garry-micro-dev-utilities/
- **Repository**: https://github.com/girijashankarj/garry-micro-dev-utilities
- **Issues**: https://github.com/girijashankarj/garry-micro-dev-utilities/issues
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Tool Specifications**: [TOOLS.md](TOOLS.md)

---

<p align="center">
  Made with ❤️ for developers who value simplicity and privacy
</p>

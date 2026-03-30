# Garry Micro Dev Utilities

<p align="center">
  <strong>Local-first, browser-only developer utilities</strong><br/>
  for JSON, APIs, data formats, planning, and architecture — no server, no login.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/typescript-5.9-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-7-purple?logo=vite" alt="Vite 7" />
  <img src="https://img.shields.io/badge/tailwind-4-blue?logo=tailwindcss" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  <img src="https://img.shields.io/badge/PWA-enabled-blue" alt="Progressive Web App" />
</p>

---

## Table of contents

| Section                                                                            | What you will find                                       |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [Vision and scope](#vision-and-scope)                                              | Product goals and non-goals                              |
| [Glossary](#glossary)                                                              | Abbreviations used in the app and docs                   |
| [Distribution](#distribution-web-progressive-web-app--pwa-chrome-extension-mobile) | Web, Progressive Web App (PWA), Chrome extension, phones |
| [Quick start](#quick-start)                                                        | Clone, install, run, build                               |
| [NPM scripts](#npm-scripts)                                                        | All package.json commands                                |
| [Tool catalog](#tool-catalog)                                                      | Every utility with id, category, and summary             |
| [Architecture](#architecture)                                                      | Diagrams: runtime, navigation, CI/CD                     |
| [Security and privacy](#security-and-privacy)                                      | Local-only processing                                    |
| [Technology stack](#technology-stack)                                              | Major dependencies                                       |
| [Browser support](#browser-support)                                                | Supported clients                                        |
| [Project structure](#project-structure)                                            | Repository layout                                        |
| [Contributing and links](#contributing-and-links)                                  | How to extend the suite                                  |

---

## Vision and scope

**Garry Micro Dev Utilities** is a curated **single-page application (SPA)** of small tools that run entirely in the browser. It is inspired by the “one job per page” clarity of sites like [ilovepdf.com](https://www.ilovepdf.com), but aimed at **software engineers, testers, and technical leads**.

| Goal                                | Detail                                                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Local-first**                     | Workloads run in your browser; nothing is uploaded to an application backend by design.                                          |
| **No account**                      | No sign-up, no API keys required to use the tools.                                                                               |
| **Offline after load**              | The web build is a **Progressive Web App (PWA)** with a service worker so repeat visits can work offline once assets are cached. |
| **Same codebase, multiple outputs** | One React codebase produces the **hosted site** and an optional **Chrome extension** bundle.                                     |

**Non-goals:** This is not a software-as-a-service (SaaS) product, not a generic framework, and not a replacement for dedicated IDEs or API gateways.

---

## Glossary

User-facing copy in the app follows the pattern **full term (abbreviation)** where jargon first appears. This table aligns documentation with the same terms.

| Abbreviation | Full form                                     | Typical use in this project                                   |
| ------------ | --------------------------------------------- | ------------------------------------------------------------- |
| **ADR**      | Architecture Decision Record                  | Structured decisions for tech choices; ADR builder tool.      |
| **API**      | Application programming interface             | REST-style contracts, responses, and risk analysis.           |
| **CI**       | Continuous integration                        | GitHub Actions workflows on push and pull requests.           |
| **CSV**      | Comma-separated values                        | Table exports from several planning tools.                    |
| **GDPR**     | General Data Protection Regulation            | Privacy checklist item in non-functional requirements (NFR).  |
| **JSON**     | JavaScript Object Notation                    | Payloads, configs, diffing, formatting.                       |
| **JWT**      | JSON Web Token                                | Token inspection and decoding tools.                          |
| **LLM**      | Large language model                          | Token counting for prompt sizing and cost hints.              |
| **NFR**      | Non-functional requirements                   | Quality attributes: security, performance, availability, etc. |
| **npm**      | Node Package Manager                          | Package installs and dependency lockfile.                     |
| **OpenAPI**  | OpenAPI Specification                         | Machine-readable API descriptions (often YAML or JSON).       |
| **PII**      | Personally identifiable information           | Data that can identify individuals; masking tool.             |
| **PWA**      | Progressive Web App                           | Installable web app with manifest and service worker.         |
| **RACI**     | Responsible, Accountable, Consulted, Informed | Role assignment matrix for tasks.                             |
| **RegExp**   | Regular expression                            | Pattern matching in the regex playground.                     |
| **RPO**      | Recovery point objective                      | How much data loss is acceptable in a disaster.               |
| **RTO**      | Recovery time objective                       | How long restore may take after an outage.                    |
| **SQL**      | Structured Query Language                     | Query explanation without executing against a database.       |
| **TLS**      | Transport Layer Security                      | Encryption in transit (often referred to with HTTPS).         |
| **URL**      | Uniform Resource Locator                      | Links, query strings, encoding helpers.                       |
| **URI**      | Uniform Resource Identifier                   | Broader identifier class; used in URL toolkit copy.           |
| **YAML**     | YAML Ain’t Markup Language                    | Human-readable data serialization (often used for OpenAPI).   |
| **cURL**     | Client URL (command-line tool)                | `curl` command parsing and code generation.                   |

---

## Distribution: web (Progressive Web App / PWA), Chrome extension, mobile

| Channel              | Artifact                                      | Best for                                       | Mobile (Android / iOS)?                                                                                                 |
| -------------------- | --------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Hosted site**      | `npm run build:web` → `dist/`                 | Sharing one URL, full window size, PWA install | Yes — open the URL in the mobile browser; install via **Add to Home Screen** (PWA).                                     |
| **Chrome extension** | `npm run build:extension` → `dist-extension/` | Quick access from Chrome toolbar (desktop)     | **No** — Chrome extensions are not the standard way to “install” on phones. Use the **same PWA URL** on mobile instead. |
| **Source**           | This repository                               | Contributing, forking, custom hosting          | N/A                                                                                                                     |

```mermaid
flowchart TB
  subgraph repo [Single repository]
    Src[React plus TypeScript source]
  end
  subgraph web [Web build]
    ViteWeb[Vite plus vite-plugin-pwa]
    DistWeb[dist folder]
  end
  subgraph ext [Extension build]
    ViteExt[vite.extension.config.ts]
    DistExt[dist-extension folder]
  end
  subgraph users [Users]
    Browser[Desktop and mobile browsers]
    ChromeDesktop[Chrome desktop with extension]
  end
  Src --> ViteWeb
  Src --> ViteExt
  ViteWeb --> DistWeb
  ViteExt --> DistExt
  DistWeb --> Browser
  DistExt --> ChromeDesktop
  Browser --> PWAInstall[Add to Home Screen PWA on mobile]
```

**Mobile install (recommended path):** deploy or open the **hosted web app**, then use the browser’s **Add to Home Screen** (or equivalent). That uses the **web app manifest** and service worker from the PWA build — the same experience users expect on Android and iOS Safari, without an app store.

### Install icon / app preview (Chrome and standalone mode)

| Topic                                            | Detail                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Why the install preview was missing**          | Chrome’s install UI expects **PNG** icons (**192×192** and **512×512**). A manifest that only listed **SVG** often shows a blank or generic install preview. This repo now ships **`public/pwa-192.png`**, **`public/pwa-512.png`**, and **`public/apple-touch-icon.png`** (regenerated from `favicon.svg` via `npm run icons` or automatically before `build:web`).                                                     |
| **Which browser for “like an app” (standalone)** | **Chrome or Edge** (desktop or Android): install from the menu → opens in its **own window** with `display: standalone`. **Safari (iOS / iPadOS)**: **Share → Add to Home Screen** — standalone home-screen icon (use **`apple-touch-icon`**). **Samsung Internet** (Android): similar to Chrome. Use the **real HTTPS URL** of the site (or `localhost` for dev); installability does not apply to raw `file://` pages. |
| **After changing the logo**                      | Run **`npm run icons`** and commit the updated PNGs under **`public/`**.                                                                                                                                                                                                                                                                                                                                                 |

---

## Quick start

**Prerequisites:** Node.js **>= 20.19** (project CI uses Node 24), **npm** (Node Package Manager) **>= 10**.

| Step                   | Command                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| Clone                  | `git clone https://github.com/girijashankarj/garry-micro-dev-utilities.git` |
| Enter directory        | `cd garry-micro-dev-utilities`                                              |
| Install                | `npm ci` or `npm install`                                                   |
| Development server     | `npm run dev`                                                               |
| Production web build   | `npm run build:web`                                                         |
| Chrome extension build | `npm run build:extension`                                                   |
| Both builds            | `npm run build:all`                                                         |

**Load the unpacked extension:** run `npm run build:extension`, then in Chrome go to **Extensions → Load unpacked** and select the `dist-extension` folder.

**Production deployment (GitHub Pages):** see [DEPLOYMENT.md](DEPLOYMENT.md). The live site is typically at **https://girijashankarj.github.io/garry-micro-dev-utilities/** when Pages is enabled on `main`.

---

## NPM scripts

| Script                    | Purpose                                                               |
| ------------------------- | --------------------------------------------------------------------- |
| `npm run dev`             | Start Vite dev server                                                 |
| `npm run build`           | Alias for `build:web`                                                 |
| `npm run build:web`       | Typecheck (`tsc -b`) then Vite production build (includes PWA assets) |
| `npm run build:extension` | Typecheck then extension bundle to `dist-extension/`                  |
| `npm run build:all`       | `build:web` then `build:extension`                                    |
| `npm run preview`         | Preview the web production build                                      |
| `npm run lint`            | ESLint with zero warnings allowed                                     |
| `npm run lint:fix`        | ESLint with auto-fix                                                  |
| `npm run format`          | Prettier write                                                        |
| `npm run format:check`    | Prettier check only                                                   |
| `npm test`                | Jest with coverage                                                    |
| `npm run validate`        | Sample OpenAPI validation helper script                               |

---

## Tool catalog

All tools are registered in `src/common/constants.ts` (`TOOLS`) and mounted from `src/App.tsx`. **22** tools are listed below (id matches the route query parameter in the Chrome extension build and the `/tools/:id` path on the web).

| Id                           | Name (as shown in UI)                                       | Category                  |
| ---------------------------- | ----------------------------------------------------------- | ------------------------- |
| `json-diff-tool`             | JavaScript Object Notation (JSON) diff (fixed left / right) | Developer Essentials      |
| `encoding-utils`             | Base64 + JSON Web Token (JWT) decode                        | Developer Essentials      |
| `json-diagram-workflow`      | JavaScript Object Notation (JSON) diagram & workflow        | Diagrams & Modeling       |
| `url-toolkit`                | Uniform Resource Locator (URL) toolkit                      | Developer Essentials      |
| `unix-time-converter`        | Unix time converter                                         | Developer Essentials      |
| `regex-playground`           | Regular expression (RegExp) playground                      | Developer Essentials      |
| `token-counter`              | Token counter                                               | Developer Essentials      |
| `pii-removal`                | Personally identifiable information (PII) removal           | Developer Essentials      |
| `openapi-viewer`             | Swagger / OpenAPI (API specification) preview               | APIs & Integration        |
| `jwt-inspector`              | JSON Web Token (JWT) inspector                              | APIs & Integration        |
| `api-response-diff`          | Application programming interface (API) response diff       | APIs & Integration        |
| `curl-visualizer`            | cURL (command-line URL) command visualizer                  | APIs & Integration        |
| `api-risk-analyzer`          | API contract risk analyzer (OpenAPI)                        | APIs & Integration        |
| `json-yaml-formatter`        | JavaScript Object Notation (JSON) / YAML formatter          | Data & Files              |
| `sql-explainer`              | Structured Query Language (SQL) query explainer             | Data & Files              |
| `csv-explorer`               | Comma-separated values (CSV) explorer                       | Data & Files              |
| `raci-matrix`                | Responsible, Accountable, Consulted, Informed (RACI) matrix | Planning & Delivery       |
| `risk-register`              | Risk register                                               | Planning & Delivery       |
| `meeting-action-tracker`     | Meeting notes & actions                                     | Planning & Delivery       |
| `timeline-milestone-planner` | Timeline & milestones                                       | Planning & Delivery       |
| `adr-builder`                | Architecture Decision Record (ADR) builder                  | Architecture & Governance |
| `nfr-checklist`              | Non-functional requirements (NFR) checklist                 | Architecture & Governance |

```mermaid
mindmap
  root((Garry Micro<br/>Dev Utilities))
    DeveloperEssentials
      JsonDiff
      Base64JwtDecode
      UrlToolkit
      UnixTime
      RegexPlayground
      TokenCounter
      PiiRemoval
    DiagramsModeling
      JsonDiagramWorkflow
    ApisIntegration
      OpenApiViewer
      JwtInspector
      ApiResponseDiff
      CurlVisualizer
      ApiRiskAnalyzer
    DataFiles
      JsonYamlFormatter
      SqlExplainer
      CsvExplorer
    PlanningDelivery
      RaciMatrix
      RiskRegister
      MeetingActions
      TimelineMilestones
    ArchitectureGovernance
      AdrBuilder
      NfrChecklist
```

---

## Architecture

### High-level runtime

```mermaid
graph LR
  User[User] --> UI[React SPA]
  UI --> State[Redux Toolkit]
  UI --> Tools[Tool components]
  Tools --> BrowserAPIs[Browser APIs]
  WebBuild[PWA build] --> SW[Service worker]
  SW --> Cache[Precache and runtime cache]
```

### In-app navigation (web vs extension)

On the **web** build, the selected tool is reflected in the path **`/tools/:toolId`** (with optional GitHub Pages base path). On the **extension** build, the same state uses the query parameter **`?tool=`** so it does not collide with OpenAPI share links that use the URL **hash** fragment.

```mermaid
sequenceDiagram
  participant User
  participant App
  participant Tool
  User->>App: Open site or extension popup
  App->>User: Show library or restore tool from URL
  User->>App: Choose tool
  App->>Tool: Render tool component
  User->>Tool: Paste upload or edit data
  Tool->>User: Show results in browser only
  User->>App: Back to library
  App->>User: Show library again
```

### Continuous integration and deployment

```mermaid
flowchart LR
  Push[Push or PR] --> GHA[GitHub Actions]
  GHA --> Lint[Lint]
  GHA --> Test[Test]
  GHA --> BuildWeb[build:web]
  GHA --> BuildExt[build:extension]
  PushMain[Push to main] --> Deploy[deploy.yml]
  Deploy --> Pages[GitHub Pages artifact]
```

---

## Security and privacy

| Topic                       | Behavior                                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data leaving the device** | Tools are designed to process input locally. There is no first-party backend in this repository.                                                       |
| **Third-party calls**       | Optional links (for example to **npm** package pages or documentation) open in a new tab; core tools do not require calling your APIs from our server. |
| **Files**                   | Large uploads are bounded per tool (for example OpenAPI files up to **10 MB** in the viewer).                                                          |
| **Extension permissions**   | The MV3 manifest ships with **no host permissions**; see `scripts/extension-scope.json` for the rationale.                                             |

```mermaid
flowchart TB
  Input[User input and files] --> Local[In-browser processing]
  Local --> Out[Results on screen or clipboard]
  Input -.->|No project backend| Nowhere[No Garry server]
```

---

## Technology stack

| Layer                       | Choice                                                |
| --------------------------- | ----------------------------------------------------- |
| UI                          | React 19, TypeScript                                  |
| Styling                     | Tailwind CSS v4, **shadcn**-style Radix UI primitives |
| State                       | Redux Toolkit                                         |
| Build                       | Vite 7, `@vitejs/plugin-react`                        |
| PWA                         | `vite-plugin-pwa` with `injectManifest` (`src/sw.ts`) |
| OpenAPI UI                  | `swagger-ui-react`, `js-yaml`                         |
| JWT decode (inspector tool) | `jwt-decode`                                          |
| Tokenizer                   | `gpt-tokenizer`                                       |
| Quality                     | ESLint 9, Prettier, Jest, Testing Library             |

---

## Browser support

| Client        | Notes                                                                        |
| ------------- | ---------------------------------------------------------------------------- |
| Chrome / Edge | Fully supported; extension targets Chromium.                                 |
| Firefox       | Supported for the web app.                                                   |
| Safari        | Supported; PWA install behavior follows **iOS** / **macOS** Safari rules.    |
| Mobile        | Use the **web/PWA** URL; test **Add to Home Screen** on your target devices. |

Requires a modern **ECMAScript** environment (ES2022 class fields and standard Web APIs used by Vite’s browser target).

---

## Project structure

```
garry-micro-dev-utilities/
├── extension/                 # Chrome MV3 manifest (copied into dist-extension)
├── public/                    # Static assets (favicon, robots.txt)
├── samples/                   # Example OpenAPI YAML
├── scripts/                   # validate-openapi.js, extension-scope.json
├── src/
│   ├── App.tsx                # Library + tool routing
│   ├── main.tsx               # Web entry (PWA registration)
│   ├── extension-main.tsx     # Extension entry (no service worker)
│   ├── components/tools/      # One folder per tool
│   ├── components/ui/         # Shared UI primitives
│   ├── common/constants.ts    # TOOLS definitions and BRAND copy
│   ├── config/distribution.ts # PWA vs extension vs mobile notes
│   ├── lib/                   # Routing, search, OpenAPI helpers
│   ├── store/                 # Redux store
│   └── sw.ts                  # Service worker source for PWA
├── vite.config.ts             # Web + PWA
├── vite.extension.config.ts   # Extension bundle
├── full.html                  # Extension HTML entry
└── .github/workflows/         # ci.yml, pr-check.yml, deploy.yml
```

---

## Contributing and links

- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Tool patterns:** [TOOLS.md](TOOLS.md)
- **Architecture deep dive:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Deploy:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **License:** [LICENSE](LICENSE) (MIT)

| Resource   | URL                                                                |
| ---------- | ------------------------------------------------------------------ |
| Live site  | https://girijashankarj.github.io/garry-micro-dev-utilities/        |
| Repository | https://github.com/girijashankarj/garry-micro-dev-utilities        |
| Issues     | https://github.com/girijashankarj/garry-micro-dev-utilities/issues |

### Adding a tool

1. Add a component under `src/components/tools/`.
2. Append a `ToolDefinition` to `TOOLS` in `src/common/constants.ts`.
3. Register the component in `TOOL_COMPONENTS` in `src/App.tsx`.
4. Run `npm run lint` and `npm run build:all`.
5. Update **this README** tool table and any focused docs if needed.

---

<p align="center">
  Built for developers who want small, sharp utilities without giving data to a server.
</p>

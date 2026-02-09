# Tools Specification

This document provides detailed specifications for each tool in the platform.

## OpenAPI Swagger Viewer ✅

**Status**: Available  
**Category**: API & Backend  
**File**: Embedded in `index.html` (tool section: `tool-openapi-viewer`)

### Purpose
Upload OpenAPI YAML/JSON files and render interactive API documentation using Swagger UI.

### Features
- Upload `.yaml`, `.yml`, or `.json` files
- Load sample API spec
- Interactive API documentation
- Try-it-out functionality
- File size validation (10MB limit)
- OpenAPI 3.x validation

### Dependencies
- Swagger UI 5.17.14 (CDN)
- js-yaml 4.1.0 (CDN)
- Tailwind CSS 3.4.1 (CDN)

### Usage
1. Click "Choose file" to upload OpenAPI spec
2. Or click "Load Sample" to see example
3. View rendered API documentation
4. Use Swagger UI features to explore endpoints

---

## JWT Inspector 🚧

**Status**: Coming Soon  
**Category**: API & Backend  
**File**: `tools/jwt-inspector.html`

### Purpose
Decode and inspect JWT tokens offline. View header, payload, expiration details, and highlight potential security issues.

### Planned Features
- Paste JWT token
- Decode header (base64)
- Decode payload (base64)
- Display expiration status
- Highlight security risks
- No secret validation (offline only)

### Dependencies
- jsonwebtoken library (CDN) or custom decoder
- Tailwind CSS 3.4.1 (CDN)

### Usage (Planned)
1. Paste JWT token
2. View decoded header and payload
3. Check expiration status
4. Review security warnings

---

## API Response Diff 🚧

**Status**: Coming Soon  
**Category**: API & Backend  
**File**: `tools/api-response-diff.html`

### Purpose
Compare two JSON API responses and highlight semantic differences. Flag breaking changes and schema modifications.

### Planned Features
- Paste two JSON responses
- Semantic diff highlighting
- Breaking change detection
- Schema comparison
- Side-by-side view

### Dependencies
- JSON diff library (CDN)
- Tailwind CSS 3.4.1 (CDN)

### Usage (Planned)
1. Paste first JSON response
2. Paste second JSON response
3. View highlighted differences
4. Review breaking change warnings

---

## JSON / YAML Formatter 🚧

**Status**: Coming Soon  
**Category**: Data & Formats  
**File**: `tools/json-formatter.html`

### Purpose
Format and validate JSON/YAML files. Auto-format, show syntax errors, and copy formatted output.

### Planned Features
- Upload or paste JSON/YAML
- Auto-format with indentation
- Syntax error highlighting
- Copy formatted output
- Minify option
- Convert between JSON/YAML

### Dependencies
- js-yaml 4.1.0 (CDN)
- JSON parser (native)
- Tailwind CSS 3.4.1 (CDN)

### Usage (Planned)
1. Upload file or paste content
2. View formatted output
3. Fix syntax errors if any
4. Copy formatted result

---

## Curl Command Visualizer 🚧

**Status**: Coming Soon  
**Category**: API & Backend  
**File**: `tools/curl-visualizer.html`

### Purpose
Paste a curl command and visualize headers, parameters, body. Convert to Fetch or Axios code.

### Planned Features
- Parse curl command
- Visualize request components
- Convert to Fetch API
- Convert to Axios
- Export as code snippet

### Dependencies
- curl parser library (CDN)
- Tailwind CSS 3.4.1 (CDN)

### Usage (Planned)
1. Paste curl command
2. View parsed components
3. Select output format (Fetch/Axios)
4. Copy generated code

---

## CSV Explorer 🚧

**Status**: Coming Soon  
**Category**: Data & Formats  
**File**: `tools/csv-explorer.html`

### Purpose
Upload CSV files, render as table, apply simple filters, and export to JSON.

### Planned Features
- Upload CSV file
- Render as sortable table
- Simple column filters
- Search functionality
- Export to JSON
- Export filtered results

### Dependencies
- PapaParse or similar CSV parser (CDN)
- Tailwind CSS 3.4.1 (CDN)

### Usage (Planned)
1. Upload CSV file
2. View table preview
3. Apply filters if needed
4. Export to JSON

---

## SQL Query Explainer 🚧

**Status**: Coming Soon  
**Category**: Debugging & Security  
**File**: `tools/sql-explainer.html`

### Purpose
Paste SQL queries and get explanations of joins, filters, and potential risks. No database execution.

### Planned Features
- Parse SQL query
- Explain joins and relationships
- Highlight filter conditions
- Identify potential performance issues
- Explain query structure
- No actual execution

### Dependencies
- SQL parser library (CDN)
- Tailwind CSS 3.4.1 (CDN)

### Usage (Planned)
1. Paste SQL query
2. View query explanation
3. Review join analysis
4. Check for potential issues

---

## API Contract Risk Analyzer 🚧

**Status**: Coming Soon  
**Category**: API & Backend  
**File**: `tools/api-risk-analyzer.html`

### Purpose
Upload OpenAPI spec and flag missing error responses, weak validation, and breaking change risks.

### Planned Features
- Upload OpenAPI spec
- Analyze error response coverage
- Check validation rules
- Detect breaking change risks
- Generate risk report
- Suggest improvements

### Dependencies
- OpenAPI parser (CDN)
- Tailwind CSS 3.4.1 (CDN)

### Usage (Planned)
1. Upload OpenAPI spec
2. Run analysis
3. Review risk report
4. Address flagged issues

---

## Tool Development Guidelines

### Required Elements

1. **Header**: Consistent header with "Back to Home" link
2. **Privacy Notice**: Clear statement that tool runs in browser
3. **Instructions**: Clear usage instructions
4. **Error Handling**: User-friendly error messages
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Responsive**: Works on mobile devices

### Code Standards

- Use shared CSS variables for colors
- Follow existing header/footer pattern
- Include security headers
- Validate inputs client-side
- Handle errors gracefully
- No external API calls

### Testing Checklist

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Error handling tested
- [ ] File size limits enforced

# Codebase Structure

## Directory Layout

```
LOTCFORM/
├── api/                          # Vercel serverless functions
│   └── submit.js                 # POST /api/submit handler
├── node_modules/                 # NPM dependencies (gitignored)
├── submissions/                  # Local JSON submission storage
│   └── submission_*.json         # Individual submission files
├── .git/                         # Git repository data
├── .serena/                      # Serena MCP configuration
├── .vscode/                      # VS Code workspace settings
├── index.html                    # Main form interface (client-side)
├── neonService.js                # Neon CRM API integration service
├── server.js                     # Express server (local development)
├── package.json                  # Node.js project configuration
├── package-lock.json             # Locked dependency versions
├── vercel.json                   # Vercel deployment configuration
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── NEON_INTEGRATION.md           # Neon CRM integration guide
├── NEON_TEST_RESULTS.md          # Neon testing documentation
├── VERCEL_DEPLOYMENT.md          # Vercel deployment guide
├── IMPROVEMENTS.md               # Future improvements list
├── BRAND_REDESIGN.md             # Brand redesign notes
├── LOTC Brand Guideline.pdf      # Brand guidelines reference
└── FOrm1                         # Legacy form file (replaced by index.html)
```

## Key Files and Their Purpose

### Frontend Files
- **index.html**: Complete form interface with embedded CSS and JavaScript
  - Form structure and validation
  - Client-side interactivity (ZIP lookup, age calculation)
  - Mapbox integration
  - Form submission logic

### Backend Files
- **server.js**: Express server for local development
  - Serves static files (index.html)
  - Health check endpoint
  - Routes API requests
  - Local development only (not used in Vercel deployment)

- **api/submit.js**: Serverless function for form submission
  - CORS configuration
  - Request validation
  - JSON file storage
  - Neon CRM integration
  - Production deployment handler

- **neonService.js**: Neon CRM API service class
  - Authentication handling
  - Account search by email/name
  - Account creation
  - Form data submission orchestration
  - Class structure with methods:
    - `isConfigured()`: Check if Neon credentials exist
    - `loginV1()`: V1 API authentication (if needed)
    - `searchAccountByEmail(email)`: Find existing accounts
    - `searchAccountByName(firstName, lastName)`: Alternative search
    - `getOrCreateAccount(accountData)`: Smart account handling
    - `createAccount(accountData)`: Create new account
    - `createServiceRecord(data)`: Create service records
    - `submitFormToNeon(formData)`: Main submission orchestrator

### Configuration Files
- **package.json**: NPM configuration
  - Dependencies: express, axios, cors, dotenv
  - Scripts: `start` (production), `dev` (development with nodemon)
  - Project metadata

- **vercel.json**: Vercel deployment configuration
  - Serverless function routing
  - Static file serving
  - Environment variable configuration

- **.env**: Environment variables (not in version control)
  - `PORT`: Server port (default 3000)
  - `NODE_ENV`: Environment mode
  - `NEON_ORG_ID`: Neon CRM organization ID
  - `NEON_API_KEY`: Neon CRM API key
  - `NEON_API_BASE_URL`: Neon API endpoint

- **.gitignore**: Version control exclusions
  - node_modules/
  - .env
  - *.log files
  - OS-specific files (.DS_Store)

### Documentation Files
- **README.md**: Primary project documentation
- **NEON_INTEGRATION.md**: Comprehensive Neon CRM integration guide
- **VERCEL_DEPLOYMENT.md**: Deployment instructions
- **IMPROVEMENTS.md**: Planned enhancements
- **BRAND_REDESIGN.md**: Design guidelines
- **NEON_TEST_RESULTS.md**: Testing documentation

## Data Flow

### Local Development Flow
```
Browser (index.html)
    ↓ POST /api/submit
Express Server (server.js)
    ↓
Request Handler
    ↓
Validation → Save JSON → Neon CRM
    ↓
Response to Browser
```

### Production (Vercel) Flow
```
Browser (index.html)
    ↓ POST /api/submit
Vercel Serverless Function (api/submit.js)
    ↓
Validation → Save JSON (/tmp) → Neon CRM
    ↓
Response to Browser
```

## Module Dependencies

### neonService.js
- Requires: `axios`, `dotenv`
- Exports: `NeonService` class instance
- Used by: `api/submit.js`, `server.js`

### api/submit.js
- Requires: `neonService.js`, `fs`, `path`
- Exports: Async request handler function
- Invoked by: Vercel runtime

### server.js
- Requires: `express`, `cors`, `dotenv`, `path`, `fs`, `neonService.js`
- Exports: None (executable)
- Purpose: Local development only

## Storage Locations

### Local Development
- **Submissions**: `./submissions/submission_*.json`
- **Static files**: Root directory

### Vercel Production
- **Submissions**: `/tmp/submissions/submission_*.json` (ephemeral)
- **Static files**: Served from root via Vercel CDN
- **Note**: /tmp storage is temporary and cleared between deployments

## External Dependencies

### NPM Packages
- `express`: Web framework
- `axios`: HTTP client
- `cors`: Cross-origin middleware
- `dotenv`: Environment variable loader
- `nodemon`: Development auto-reload (dev only)

### External APIs
- Neon CRM API v2 (api.neoncrm.com)
- zippopotam.us (ZIP code lookup)
- Mapbox GL JS (mapping)
- Google Fonts (Poppins typography)

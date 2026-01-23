# Technology Stack

## Frontend
- **HTML5**: Semantic markup for form structure
- **CSS3**: Custom styling with CSS variables
  - Brand colors from LOTC guidelines (red: #c22035, blue: #86b2d3)
  - Poppins font family from Google Fonts
  - Responsive design patterns
- **Vanilla JavaScript**: Client-side validation and interactivity
  - ZIP code auto-population via zippopotam.us API
  - Age calculation from date of birth
  - Conditional field visibility
  - Mapbox GL JS integration (v3.3.0)

## Backend
- **Node.js**: Runtime environment
- **Express.js**: Local development server (v4.18.2)
- **Serverless Functions**: Vercel deployment model

## Dependencies (package.json)
### Production
- `express@^4.18.2`: Web application framework
- `axios@^1.13.2`: HTTP client for Neon CRM API calls
- `cors@^2.8.5`: Cross-origin resource sharing middleware
- `dotenv@^16.3.1`: Environment variable management

### Development
- `nodemon@^3.0.1`: Auto-reload during development

## External APIs
- **Neon CRM API v2**: Customer relationship management
  - Base URL: https://api.neoncrm.com/v2
  - Authentication: HTTP Basic Auth (Org ID + API Key)
- **zippopotam.us**: ZIP code lookup for address auto-population
- **Mapbox GL JS**: Mapping functionality (if used)

## File Storage
- **Local Development**: `./submissions/` directory for JSON files
- **Vercel Production**: `/tmp/submissions/` for temporary storage

## Programming Language
- **JavaScript** (ES6+ syntax with async/await)
- **TypeScript**: Project configured for TypeScript (detected by Serena)

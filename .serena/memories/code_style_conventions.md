# Code Style and Conventions

## General Conventions
- **Indentation**: 4 spaces for JavaScript/HTML/CSS
- **Encoding**: UTF-8
- **Line Endings**: Unix-style (LF)

## JavaScript Style
### Naming Conventions
- **Variables/Functions**: camelCase
  - Examples: `formData`, `searchAccountByEmail`, `neonService`
- **Constants**: UPPER_SNAKE_CASE or camelCase for imported modules
  - Examples: `NEON_API_KEY`, `axios`
- **Classes**: PascalCase
  - Example: `NeonService`
- **File Names**: camelCase for JavaScript files
  - Examples: `neonService.js`, `submit.js`

### Code Patterns
- **Async/Await**: Preferred over promise chains
- **Error Handling**: Try-catch blocks with graceful degradation
- **Logging**: Console.log for important operations, console.error for failures
- **Validation**: Check required fields before processing
- **Conditional Logic**: Explicit field validation with clear error messages

### Function Structure
- Arrow functions for callbacks and exports: `module.exports = async (req, res) => {}`
- Class methods use standard method syntax: `async submitFormToNeon(formData) {}`
- Descriptive parameter names: `formData`, `accountData`, `email`

## HTML/CSS Style
### HTML Conventions
- Semantic elements where appropriate
- Form fields with descriptive IDs matching backend field names
- Required fields marked with `required` attribute
- Conditional fields controlled by JavaScript

### CSS Conventions
- **CSS Variables**: Brand colors defined in `:root`
  - `--brand-red`, `--brand-blue`, `--brand-grey`, `--brand-black`, `--brand-white`
- **Class Names**: Descriptive, lowercase with hyphens
  - Examples: `.form-section`, `.submit-button`, `.header`
- **Layout**: Flexbox and responsive design patterns
- **Typography**: Poppins font family throughout

## File Organization
### Project Structure
```
LOTCFORM/
├── index.html          # Main form interface
├── neonService.js      # Neon CRM API service class
├── server.js           # Local Express server (development)
├── api/
│   └── submit.js       # Vercel serverless function
├── submissions/        # Local JSON storage
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel deployment configuration
├── .env                # Environment variables (not committed)
└── *.md                # Documentation files
```

## Comments and Documentation
- **Inline Comments**: Used sparingly, for complex logic explanation
- **Documentation Files**: Comprehensive markdown files for features
  - `NEON_INTEGRATION.md`: API integration details
  - `VERCEL_DEPLOYMENT.md`: Deployment guide
  - `README.md`: Usage and setup instructions

## Error Handling Patterns
- **Graceful Degradation**: Form submission succeeds even if Neon CRM fails
- **User-Friendly Messages**: Clear error messages in API responses
- **Logging**: Detailed console logs for debugging
- **Validation**: Both client-side (HTML5) and server-side validation

## Environment Variables
- Stored in `.env` file (gitignored)
- Accessed via `process.env.VARIABLE_NAME`
- Required variables documented in README and integration docs

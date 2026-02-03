# LOTC Form - Least of These Carolinas Request Form

A functional web form with Node.js/Express backend for local development, designed for form submissions from Least of These Carolinas.

## Features

- ✅ Full-featured HTML form with validation
- ✅ Multiple request types: Bags of Hope, Shoes of Hope, General Request, Birthday, Life Box, Just Like You
- ✅ Node.js/Express backend server
- ✅ JSON file storage for submissions (backup)
- ✅ Neon CRM API integration (v1 + v2)
- ✅ Supabase database integration with bidirectional sync
- ✅ CORS enabled for API access
- ✅ Loading states and error handling
- ✅ Advanced conditional form fields with gender-based size selections
- ✅ Production deployment on Vercel

## Project Structure

```
LOTCFORM/
├── index.html          # Main form (~2700 lines)
├── server.js           # Express backend server (local dev)
├── api/
│   └── submit.js       # Vercel serverless function (production)
├── neonService.js      # Neon CRM API integration
├── supabaseService.js  # Supabase client and field mapping
├── package.json        # Node.js dependencies
├── .env                # Environment variables (not in git)
├── docs/               # Documentation and migrations
│   ├── CLAUDE.md       # Context for AI assistance
│   ├── add-all-new-fields-migration.sql
│   ├── add-shoes-of-hope-fields-migration.sql
│   ├── SUPABASE_FIELD_AUDIT.md
│   └── FORM_GAP_ANALYSIS.md
├── submissions/        # Form submission storage (JSON backups)
└── README.md           # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Open terminal and navigate to the project directory:
   ```bash
   cd /Users/johnlohr/StackkedDev/LOTCFORM
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Access the Form

Open your browser and navigate to:
```
http://localhost:3000/index.html
```

Or simply:
```
http://localhost:3000
```

## Testing the Form

### Manual Testing Steps:

1. **Start the server**: Run `npm start`
2. **Open the form**: Navigate to `http://localhost:3000/index.html` in your browser
3. **Fill out the form**: Complete all required fields (marked with *)
4. **Submit the form**: Click "Submit Request"
5. **Verify success**: You should see a success message
6. **Check submissions**: Look in the `submissions/` directory for a new JSON file

### Testing Validation:

- Try submitting without filling required fields (should show browser validation)
- Test conditional fields:
  - Set "Relationship" to "Other" → "Please specify" field should appear
  - Select "Yes" for "Do you know the Caregiver's email address?" → Email field should appear
  - Set "Child's Placement Type" to "Other" → Specify field should appear

## Form Data Storage

Submissions are saved as JSON files in the `submissions/` directory with the following format:

**Filename**: `submission_YYYYMMDD_HHMMSS_randomID.json`

**Example**: `submission_20260119_143022_a7b3c9d2e.json`

**Content**:
```json
{
  "timestamp": "2026-01-19T14:30:22.789Z",
  "relationship": "Caregiver",
  "caregiverFirstName": "John",
  "caregiverLastName": "Doe",
  ...
}
```

## API Endpoints

### POST /api/submit
Submit form data

**Request Body**: JSON object with all form fields

**Response**:
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "submissionId": "submission_20260119_143022_a7b3c9d2e.json"
}
```

### GET /api/health
Health check endpoint

**Response**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Configuration

Environment variables are stored in `.env`:

```bash
# Server
PORT=3000
NODE_ENV=development

# Neon CRM
NEON_ORG_ID=your_org_id
NEON_API_KEY=your_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

To change the port, edit the `.env` file or set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Future Neon CRM Integration

The backend is designed for easy Neon CRM integration:

1. Install Neon SDK or API client
2. Add Neon API credentials to `.env`:
   ```
   NEON_API_KEY=your_api_key
   NEON_ORG_ID=your_org_id
   ```
3. Update `server.js` to send data to Neon CRM after saving to JSON
4. JSON files serve as backup/redundancy

Example integration point in `server.js`:
```javascript
// After saving JSON file
try {
  await sendToNeonCRM(submission);
} catch (error) {
  console.error('Neon CRM error:', error);
  // JSON backup already saved
}
```

## Supabase Integration

The form now syncs data to Supabase in addition to Neon CRM. This enables:
- Centralized database for all form submissions
- Bidirectional sync between Neon CRM and Supabase
- Access to form data from other applications

### Setup

1. Create Supabase project at https://supabase.com
2. Run schema from `docs/supabase-schema.sql`
3. Configure database webhooks (see `docs/SUPABASE_SETUP.md`)
4. Add environment variables:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_KEY=your-service-key
   SUPABASE_WEBHOOK_SECRET=your-secret
   ```

### Features

- **Form Submission**: Automatically saves to Supabase with Neon IDs
- **Neon → Supabase Sync**: Updates propagate from Neon to Supabase
- **Supabase → Neon Sync**: Updates propagate from Supabase to Neon
- **Conflict Resolution**: Last write wins (timestamp-based)
- **Graceful Degradation**: Form succeeds even if sync fails

### Testing

See `docs/TESTING_SYNC.md` for comprehensive testing guide.

### Webhook Endpoints

- **POST /api/neon-webhook** - Receives Neon CRM updates
- **POST /api/supabase-webhook** - Receives Supabase updates

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, either:
- Stop the other application using port 3000
- Change the port in `.env` file
- Run with a different port: `PORT=8080 npm start`

### Dependencies Not Installed
If you get module not found errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Form Not Submitting
1. Check that the server is running
2. Open browser console (F12) to see any errors
3. Verify the server is accessible at `http://localhost:3000`
4. Check server terminal for error messages

### Submissions Not Saving
1. Verify the `submissions/` directory exists
2. Check file permissions on the directory
3. Look for errors in the server terminal

## Development

### Adding New Fields

1. Add the field to `index.html` in the appropriate section
2. Update required fields list in `server.js` if the field is required
3. Test the form submission

### Customizing Validation

Edit the required fields array in `server.js`:
```javascript
const requiredFields = [
    'relationship',
    'caregiverFirstName',
    // ... add or remove fields
];
```

## Security Notes

- `.env` file is ignored by git (contains sensitive config)
- `node_modules/` is ignored by git
- Consider adding authentication before deploying to production
- CORS is currently open for development - restrict in production

## Support

For issues or questions, contact the development team or refer to:
- Express documentation: https://expressjs.com/
- Node.js documentation: https://nodejs.org/

## License

Internal use only - Least of These Carolinas

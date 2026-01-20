const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Neon CRM service
const neonService = require('./neonService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML form)
app.use(express.static(__dirname));

// Ensure submissions directory exists
const submissionsDir = path.join(__dirname, 'submissions');
if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir);
}

// Helper function to generate filename
function generateFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const randomId = Math.random().toString(36).substr(2, 9);

    return `submission_${year}${month}${day}_${hours}${minutes}${seconds}_${randomId}.json`;
}

// POST endpoint to handle form submissions
app.post('/api/submit', async (req, res) => {
    try {
        // Get form data from request body
        const formData = req.body;

        // Validate required fields - conditional based on checkbox
        const baseRequiredFields = [
            'requestType',
            'relationship',
            'caregiverFirstName',
            'caregiverLastName',
            'knowCaregiverEmail',
            'caregiverStreet',
            'caregiverCity',
            'caregiverState',
            'caregiverZip',
            'caregiverCounty',
            'isLicensedFoster',
            'socialWorkerFirstName',
            'socialWorkerLastName',
            'socialWorkerEmail',
            'socialWorkerCounty',
            'completionContact',
            'pickupLocation',
            'childFirstName',
            'childLastInitial',
            'childPlacementType',
            'childGender',
            'childAge',
            'childDOB',
            'childEthnicity',
            'agreeToTerms'
        ];

        // Conditionally require phone based on checkboxes
        let requiredFields = [...baseRequiredFields];

        // Caregiver phone requirement
        if (formData.noMobileNumber === 'on') {
            requiredFields.push('alternativePhone');
        } else {
            requiredFields.push('caregiverPhone');
        }

        // Social worker phone requirement
        if (formData.noSocialWorkerMobileNumber === 'on') {
            requiredFields.push('alternativeSocialWorkerPhone');
        } else {
            requiredFields.push('socialWorkerPhone');
        }

        // Check for missing required fields
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Add timestamp to submission
        const submission = {
            timestamp: new Date().toISOString(),
            ...formData
        };

        // Generate filename and save to JSON file (always save as backup)
        const filename = generateFilename();
        const filepath = path.join(submissionsDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(submission, null, 2));

        console.log(`Form submission saved: ${filename}`);

        // Submit to Neon CRM if configured
        let neonResult = null;
        if (neonService.isConfigured()) {
            try {
                console.log('Submitting form data to Neon CRM...');
                neonResult = await neonService.submitFormToNeon(formData);
                console.log('Successfully submitted to Neon CRM:', neonResult);
            } catch (neonError) {
                console.error('Failed to submit to Neon CRM, but local backup saved:', neonError);
                // Continue with success response since we saved locally
                // Log the error for manual review
            }
        } else {
            console.log('Neon CRM not configured - skipping Neon submission');
        }

        // Send success response
        res.json({
            success: true,
            message: 'Form submitted successfully!',
            submissionId: filename,
            neonSubmitted: neonResult ? true : false,
            neonDetails: neonResult || null
        });

    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Form accessible at: http://localhost:${PORT}/index.html`);
    console.log(`Press Ctrl+C to stop the server`);
});

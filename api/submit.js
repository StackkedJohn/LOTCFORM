const neonService = require('../neonService');
const supabaseService = require('../supabaseService');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const formData = req.body;

        // Check if Life Box 18+ (no caregiver needed)
        const isLifeBox18Plus = formData.requestType === 'Life Box' && parseInt(formData.childAge) >= 18;

        // Validation
        const baseRequiredFields = [
            'requestType', 'relationship',
            'socialWorkerFirstName', 'socialWorkerLastName', 'socialWorkerEmail', 'socialWorkerCounty',
            'completionContact', 'pickupDate', 'pickupTime', 'pickupLocation', 'childFirstName', 'childLastName',
            'childPlacementType', 'childGender', 'childAge', 'childDOB', 'childEthnicity',
            'isLicensedFoster', 'agreeToTerms'
        ];

        let requiredFields = [...baseRequiredFields];

        // Caregiver fields - NOT required for Life Box 18+
        if (!isLifeBox18Plus) {
            requiredFields.push('caregiverFirstName', 'caregiverLastName', 'caregiverStreet', 'caregiverZip',
                              'caregiverCity', 'caregiverState', 'caregiverCounty');

            // Caregiver phone requirement
            if (formData.noMobileNumber === 'on') {
                requiredFields.push('alternativePhone');
            } else {
                requiredFields.push('caregiverPhone');
            }

            // Caregiver email requirement
            if (formData.knowCaregiverEmail === 'yes') {
                requiredFields.push('caregiverEmail');
            }
        } else {
            // Life Box 18+ - require youth contact info
            requiredFields.push('childPhone', 'childEmail');
        }

        // Social worker phone requirement
        if (formData.noSocialWorkerMobileNumber === 'on') {
            requiredFields.push('alternativeSocialWorkerPhone');
        } else {
            requiredFields.push('socialWorkerPhone');
        }

        // General Request sub-type requirement
        if (formData.requestType === 'General Request') {
            requiredFields.push('generalRequestSubType');
        }

        // Group Home fields requirement
        if (formData.childPlacementType === 'Foster - Group Home placement') {
            requiredFields.push('groupHomeName', 'groupHomePhone');
        }

        // Person Completing Form fields requirement
        if (formData.relationship === 'Other') {
            requiredFields.push('relationshipOtherType', 'personCompletingFirstName', 'personCompletingLastName',
                              'personCompletingPhone', 'personCompletingTextable', 'personCompletingEmail');

            // If Other type is also "Other", require custom text
            if (formData.relationshipOtherType === 'Other') {
                requiredFields.push('relationshipOtherCustom');
            }

            // If textable is No, require alternative phone
            if (formData.personCompletingTextable === 'No') {
                requiredFields.push('personCompletingAltPhone');
            }
        }

        // Completion Contact requirements
        if (formData.completionContact === 'Other') {
            requiredFields.push('completionContactOtherType');

            // If Other type is also "Other", require custom text
            if (formData.completionContactOtherType === 'Other') {
                requiredFields.push('completionContactOtherCustom');
            }
        }

        // DSS Social Worker alternative phone requirement
        if (formData.relationship === 'DSS Social Worker' && formData.socialWorkerCanText === 'No') {
            requiredFields.push('alternativeSocialWorkerPhone');
        }

        // Licensing Agency requirement
        if (formData.isLicensedFoster === 'Yes') {
            requiredFields.push('licensingAgency');
        }

        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Generate submission ID
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const randomId = Math.random().toString(36).substring(2, 15);
        const filename = `submission_${timestamp}_${randomId}.json`;

        const submission = {
            timestamp: new Date().toISOString(),
            submissionId: filename,
            ...formData
        };

        // Save to local JSON (this will work in /tmp on Vercel)
        const submissionsDir = path.join('/tmp', 'submissions');
        if (!fs.existsSync(submissionsDir)) {
            fs.mkdirSync(submissionsDir, { recursive: true });
        }

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
            }
        } else {
            console.log('Neon CRM not configured, skipping API submission');
        }

        // Submit to Supabase if configured
        let supabaseResult = null;
        if (supabaseService.isConfigured()) {
            try {
                console.log('Submitting form data to Supabase...');
                supabaseResult = await supabaseService.insertSubmission({
                    submissionId: filename,
                    neonCaregiverId: neonResult?.caregiverAccountId || null,
                    neonSocialWorkerId: neonResult?.socialWorkerAccountId || null,
                    neonServiceId: neonResult?.serviceRecordId || null,
                    ...formData
                });
                console.log('Successfully submitted to Supabase:', supabaseResult);
            } catch (supabaseError) {
                console.error('Failed to submit to Supabase, but local backup saved:', supabaseError);
            }
        } else {
            console.log('Supabase not configured, skipping database submission');
        }

        res.status(200).json({
            success: true,
            message: 'Form submitted successfully!',
            submissionId: filename,
            neonSubmitted: neonResult ? true : false,
            neonDetails: neonResult || null,
            supabaseSubmitted: supabaseResult?.success || false,
            supabaseId: supabaseResult?.data?.id || null
        });

    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process form submission',
            error: error.message
        });
    }
};

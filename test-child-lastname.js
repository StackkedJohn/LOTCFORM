#!/usr/bin/env node
/**
 * Test with childLastName instead of childLastInitial
 */

require('dotenv').config();
const neonService = require('./neonService');
const supabaseService = require('./supabaseService');

const timestamp = Date.now();
const testFormData = {
    requestType: 'furniture',
    relationship: 'foster',
    caregiverFirstName: 'Test',
    caregiverMiddleName: '',
    caregiverLastName: 'Caregiver',
    caregiverPhone: '(555) 123-4567',
    noMobileNumber: false,
    knowCaregiverEmail: 'yes',
    caregiverEmail: `test${timestamp}@example.com`,
    caregiverStreet: '123 Test Street',
    caregiverZip: '28205',
    caregiverCity: 'Charlotte',
    caregiverState: 'NC',
    caregiverCounty: 'Mecklenburg',
    isLicensedFoster: 'yes',
    hasSocialWorkerInfo: 'yes',
    socialWorkerFirstName: 'Jane',
    socialWorkerMiddleName: '',
    socialWorkerLastName: 'Smith',
    socialWorkerPhone: '(555) 987-6543',
    socialWorkerPhoneExt: '123',
    socialWorkerCanText: 'yes',
    socialWorkerEmail: `worker${timestamp}@dss.nc.gov`,
    socialWorkerCounty: 'mecklenburg',
    completionContact: 'caregiver',
    pickupLocation: 'charlotte',
    childFirstName: 'Tommy',
    childLastName: 'Thompson',  // Full last name now!
    childPlacementType: 'kinship',
    childNickname: 'Tom',
    childGender: 'male',
    childDOB: '2015-06-15',
    childAge: '9',
    childEthnicity: 'caucasian',
    additionalInfo: 'Test with full child last name',
    agreeToTerms: true
};

async function runTest() {
    console.log('='.repeat(60));
    console.log('Testing Child Last Name Fix');
    console.log('='.repeat(60));
    console.log('Child Name:', testFormData.childFirstName, testFormData.childLastName);
    console.log('\n' + '='.repeat(60));

    // Test Neon CRM
    console.log('\n1. Testing Neon CRM...');
    let neonResult = null;
    try {
        neonResult = await neonService.submitFormToNeon(testFormData);
        console.log('\n✓ Neon submission successful!');
        console.log('  Child Account ID:', neonResult.childAccountId);
        console.log('  Service Record ID:', neonResult.serviceRecordId);
    } catch (error) {
        console.error('\n✗ Neon submission failed:', error.message);
    }

    // Test Supabase
    console.log('\n2. Testing Supabase...');
    let supabaseResult = null;
    if (neonResult) {
        try {
            const submissionId = `test_lastname_${timestamp}`;
            supabaseResult = await supabaseService.insertSubmission({
                submissionId: submissionId,
                neonCaregiverId: neonResult.caregiverAccountId,
                neonSocialWorkerId: neonResult.socialWorkerAccountId,
                neonServiceId: neonResult.serviceRecordId,
                ...testFormData
            });

            if (supabaseResult.success) {
                console.log('\n✓ Supabase submission successful!');
                console.log('  Submission UUID:', supabaseResult.data.id);

                // Verify the child name fields
                const client = supabaseService.getClient();
                const { data: checkData } = await client
                    .from('submissions')
                    .select('child_first_name, child_last_name, child_last_initial')
                    .eq('id', supabaseResult.data.id)
                    .single();

                console.log('\n3. Verifying Child Name Fields in Supabase:');
                console.log('  First Name:', checkData.child_first_name);
                console.log('  Last Name:', checkData.child_last_name);
                console.log('  Last Initial:', checkData.child_last_initial);

                if (checkData.child_last_name === 'Thompson' && checkData.child_last_initial === 'T') {
                    console.log('\n🎉 SUCCESS! Both full last name and initial are stored correctly!');
                } else {
                    console.log('\n⚠️  Warning: Expected last name "Thompson" and initial "T"');
                }
            }
        } catch (error) {
            console.error('\n✗ Supabase error:', error.message);
        }
    }

    console.log('\n' + '='.repeat(60));
}

runTest().catch(error => {
    console.error('\n❌ Test error:', error);
    process.exit(1);
});

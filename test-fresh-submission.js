#!/usr/bin/env node
/**
 * Test with completely fresh data to avoid conflicts
 */

require('dotenv').config();
const neonService = require('./neonService');
const supabaseService = require('./supabaseService');

const timestamp = Date.now();
const testFormData = {
    requestType: 'clothing',
    relationship: 'kinship',
    caregiverFirstName: 'Fresh',
    caregiverMiddleName: '',
    caregiverLastName: `TestUser${timestamp}`,
    caregiverPhone: '(555) 999-0001',
    noMobileNumber: false,
    knowCaregiverEmail: 'yes',
    caregiverEmail: `fresh${timestamp}@testexample.com`,
    caregiverStreet: '456 New Test Avenue',
    caregiverZip: '28202',
    caregiverCity: 'Charlotte',
    caregiverState: 'NC',
    caregiverCounty: 'Mecklenburg',
    isLicensedFoster: 'no',
    hasSocialWorkerInfo: 'yes',
    socialWorkerFirstName: 'Sarah',
    socialWorkerMiddleName: '',
    socialWorkerLastName: `Worker${timestamp}`,
    socialWorkerPhone: '(555) 999-0002',
    socialWorkerPhoneExt: '456',
    socialWorkerCanText: 'no',
    socialWorkerEmail: `worker${timestamp}@dss.nc.gov`,
    socialWorkerCounty: 'wake',
    completionContact: 'socialworker',
    pickupLocation: 'durham',
    childFirstName: 'Emma',
    childLastInitial: 'J',
    childPlacementType: 'foster',
    childNickname: 'Em',
    childGender: 'female',
    childDOB: '2018-03-20',
    childAge: '8',
    childEthnicity: 'hispanic',
    additionalInfo: 'Fresh test with unique data to verify Service_c creation',
    agreeToTerms: true
};

async function runFreshTest() {
    console.log('='.repeat(60));
    console.log('Fresh Submission Test - Unique Data');
    console.log('='.repeat(60));
    console.log('Timestamp:', timestamp);
    console.log('Caregiver Email:', testFormData.caregiverEmail);
    console.log('Social Worker Email:', testFormData.socialWorkerEmail);
    console.log('\n' + '='.repeat(60));

    // Test Neon CRM
    console.log('\n1. Testing Neon CRM with Fresh Data...');
    let neonResult = null;
    try {
        neonResult = await neonService.submitFormToNeon(testFormData);
        console.log('\n✓ Neon submission successful!');
        console.log('  Caregiver Account ID:', neonResult.caregiverAccountId);
        console.log('  Social Worker Account ID:', neonResult.socialWorkerAccountId);
        console.log('  Child Account ID:', neonResult.childAccountId);
        console.log('  Service Record ID:', neonResult.serviceRecordId || '(null - check error above)');
    } catch (error) {
        console.error('\n✗ Neon submission failed:', error.message);
    }

    // Test Supabase
    console.log('\n2. Testing Supabase...');
    let supabaseResult = null;
    if (neonResult) {
        try {
            const submissionId = `test_fresh_${timestamp}`;
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
                console.log('  Neon Service ID stored:', supabaseResult.data.neon_service_id || '(null)');
            }
        } catch (error) {
            console.error('\n✗ Supabase error:', error.message);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary:');
    console.log('='.repeat(60));
    console.log('Neon Accounts:', neonResult ? '✓ Created' : '✗ Failed');
    console.log('Neon Service_c:', neonResult?.serviceRecordId ? `✓ Created (ID: ${neonResult.serviceRecordId})` : '✗ Failed or Null');
    console.log('Supabase Record:', supabaseResult?.success ? '✓ Inserted' : '✗ Failed');
    console.log('Service ID in Supabase:', supabaseResult?.data?.neon_service_id || 'null');
    console.log('='.repeat(60));

    if (neonResult?.serviceRecordId && supabaseResult?.data?.neon_service_id) {
        console.log('\n🎉 Perfect! Service ID is being captured and stored in Supabase!');
    } else if (neonResult && !neonResult.serviceRecordId) {
        console.log('\n⚠️  Service_c record creation failed. Check permissions or Neon API logs above.');
    }
    console.log();
}

runFreshTest().catch(error => {
    console.error('\n❌ Test error:', error);
    process.exit(1);
});

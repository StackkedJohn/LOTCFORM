#!/usr/bin/env node
/**
 * Test script to verify form submission with Neon and Supabase integration
 */

require('dotenv').config();
const neonService = require('./neonService');
const supabaseService = require('./supabaseService');

const testFormData = {
    requestType: 'furniture',
    relationship: 'foster',
    caregiverFirstName: 'Test',
    caregiverMiddleName: '',
    caregiverLastName: 'Caregiver',
    caregiverPhone: '(555) 123-4567',
    noMobileNumber: false,
    knowCaregiverEmail: 'yes',
    caregiverEmail: 'test@example.com',
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
    socialWorkerEmail: 'jsmith@dss.nc.gov',
    socialWorkerCounty: 'mecklenburg',
    completionContact: 'caregiver',
    pickupLocation: 'charlotte',
    childFirstName: 'Tommy',
    childLastInitial: 'T',
    childPlacementType: 'kinship',
    childNickname: 'Tom',
    childGender: 'male',
    childDOB: '2015-06-15',
    childAge: '9',
    childEthnicity: 'caucasian',
    additionalInfo: 'Test submission to verify Neon and Supabase integration',
    agreeToTerms: true
};

async function runTest() {
    console.log('='.repeat(60));
    console.log('LOTC Form Submission Test');
    console.log('='.repeat(60));
    console.log('\nTest Data:', JSON.stringify(testFormData, null, 2));
    console.log('\n' + '='.repeat(60));

    // Test Neon CRM
    console.log('\n1. Testing Neon CRM Integration...');
    console.log('   Neon configured:', neonService.isConfigured());

    let neonResult = null;
    if (neonService.isConfigured()) {
        try {
            console.log('   Submitting to Neon CRM...');
            neonResult = await neonService.submitFormToNeon(testFormData);
            console.log('   ✓ Neon submission successful!');
            console.log('   Caregiver Account ID:', neonResult.caregiverAccountId);
            console.log('   Social Worker Account ID:', neonResult.socialWorkerAccountId);
        } catch (error) {
            console.error('   ✗ Neon submission failed:', error.message);
        }
    } else {
        console.log('   ⚠ Neon CRM not configured (skipped)');
    }

    // Test Supabase
    console.log('\n2. Testing Supabase Integration...');
    console.log('   Supabase configured:', supabaseService.isConfigured());

    let supabaseResult = null;
    if (supabaseService.isConfigured()) {
        try {
            const submissionId = `test_${Date.now()}`;
            console.log('   Submitting to Supabase...');

            supabaseResult = await supabaseService.insertSubmission({
                submissionId: submissionId,
                neonCaregiverId: neonResult?.caregiverAccountId || null,
                neonSocialWorkerId: neonResult?.socialWorkerAccountId || null,
                ...testFormData
            });

            if (supabaseResult.success) {
                console.log('   ✓ Supabase submission successful!');
                console.log('   Submission UUID:', supabaseResult.data.id);
                console.log('   Submission ID:', supabaseResult.data.submission_id);
                console.log('   Created at:', supabaseResult.data.created_at);
            } else {
                console.error('   ✗ Supabase submission failed:', supabaseResult.error);
            }
        } catch (error) {
            console.error('   ✗ Supabase submission error:', error.message);
        }
    } else {
        console.log('   ⚠ Supabase not configured (skipped)');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary:');
    console.log('='.repeat(60));
    console.log('Neon CRM:     ', neonResult ? '✓ SUCCESS' : (neonService.isConfigured() ? '✗ FAILED' : '⚠ NOT CONFIGURED'));
    console.log('Supabase:     ', supabaseResult?.success ? '✓ SUCCESS' : (supabaseService.isConfigured() ? '✗ FAILED' : '⚠ NOT CONFIGURED'));
    console.log('='.repeat(60));

    if (neonResult && supabaseResult?.success) {
        console.log('\n🎉 All systems working! Form data successfully synced to both Neon and Supabase.');
    } else if (!neonService.isConfigured() || !supabaseService.isConfigured()) {
        console.log('\n⚠️  Some services not configured. Check your .env file.');
    } else {
        console.log('\n❌ Some tests failed. Check the errors above.');
    }
    console.log();
}

runTest().catch(error => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
});

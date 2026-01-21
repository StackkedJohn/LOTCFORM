const axios = require('axios');

/**
 * Neon CRM API Service
 * Handles all interactions with Neon CRM API v2
 * Creates Service_c records and links to Child, Caregiver, and Social Worker accounts
 */
class NeonService {
    constructor() {
        this.orgId = process.env.NEON_ORG_ID;
        this.apiKey = process.env.NEON_API_KEY;
        this.baseURL = process.env.NEON_API_BASE_URL || 'https://api.neoncrm.com/v2';
        this.baseURLv1 = 'https://api.neoncrm.com/neonws/services/api';
        this.sessionId = null;

        // Create axios instance for API v2
        this.client = axios.create({
            baseURL: this.baseURL,
            auth: {
                username: this.orgId,
                password: this.apiKey
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Create axios instance for API v1
        this.clientV1 = axios.create({
            baseURL: this.baseURLv1
        });
    }

    /**
     * Login to API v1 and get session ID
     */
    async loginV1() {
        try {
            const response = await this.clientV1.get('/common/login', {
                params: {
                    'login.apiKey': this.apiKey,
                    'login.orgid': this.orgId
                }
            });

            if (response.data?.loginResponse?.operationResult === 'SUCCESS') {
                this.sessionId = response.data.loginResponse.userSessionId;
                console.log('API v1 login successful');
                return this.sessionId;
            }
            throw new Error('API v1 login failed');
        } catch (error) {
            console.error('API v1 login error:', error.message);
            throw error;
        }
    }

    /**
     * Check if Neon CRM integration is configured
     */
    isConfigured() {
        return this.orgId &&
               this.apiKey &&
               this.orgId !== 'your_organization_id_here' &&
               this.apiKey !== 'your_api_key_here';
    }

    /**
     * Search for an existing account by email
     * @param {string} email - Email address to search for
     * @returns {Promise<Object|null>} Account object if found, null otherwise
     */
    async searchAccountByEmail(email) {
        if (!email) return null;

        try {
            const response = await this.client.get('/accounts', {
                params: {
                    'userType': 'INDIVIDUAL',
                    'email': email
                }
            });

            if (response.data && response.data.accounts && response.data.accounts.length > 0) {
                return response.data.accounts[0];
            }
            return null;
        } catch (error) {
            console.log('Account search error or not available:', error.message);
            return null;
        }
    }

    /**
     * Search for an existing account by name
     * @param {string} firstName - First name
     * @param {string} lastName - Last name
     * @returns {Promise<Object|null>} Account object if found, null otherwise
     */
    async searchAccountByName(firstName, lastName) {
        if (!firstName || !lastName) return null;

        try {
            const response = await this.client.get('/accounts', {
                params: {
                    'userType': 'INDIVIDUAL',
                    'firstName': firstName,
                    'lastName': lastName
                }
            });

            if (response.data && response.data.accounts && response.data.accounts.length > 0) {
                return response.data.accounts[0];
            }
            return null;
        } catch (error) {
            console.log('Account search by name error:', error.message);
            return null;
        }
    }

    /**
     * Create a new individual account in Neon CRM
     * @param {Object} accountData - Account data
     * @returns {Promise<Object>} Created account object
     */
    async createAccount(accountData) {
        try {
            const payload = {
                individualAccount: {
                    primaryContact: {
                        firstName: accountData.firstName,
                        lastName: accountData.lastName
                    }
                }
            };

            // Add email if provided
            if (accountData.email) {
                payload.individualAccount.primaryContact.email1 = accountData.email;
            }

            // Add phone if provided
            if (accountData.phone) {
                payload.individualAccount.primaryContact.phone1 = accountData.phone;
            }

            // Add date of birth if provided (for child accounts)
            if (accountData.dob) {
                payload.individualAccount.primaryContact.dob = accountData.dob;
            }

            // Add gender if provided
            if (accountData.gender) {
                payload.individualAccount.primaryContact.gender = {
                    name: accountData.gender
                };
            }

            // Only add address if we have complete address data
            if (accountData.street && accountData.city && accountData.state && accountData.zip) {
                payload.individualAccount.primaryContact.addresses = [{
                    addressLine1: accountData.street,
                    city: accountData.city,
                    stateProvince: {
                        code: accountData.state
                    },
                    zipCode: accountData.zip,
                    county: accountData.county || '',
                    isPrimaryAddress: true
                }];
            }

            const response = await this.client.post('/accounts', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating account:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get or create an account
     * @param {Object} accountData - Account data with firstName, lastName, email, etc.
     * @returns {Promise<Object>} Account object with accountId
     */
    async getOrCreateAccount(accountData) {
        // First try to find by email if provided
        if (accountData.email) {
            const existingByEmail = await this.searchAccountByEmail(accountData.email);
            if (existingByEmail) {
                console.log(`Found existing account by email: ${existingByEmail.accountId}`);
                return existingByEmail;
            }
        }

        // Then try to find by name
        const existingByName = await this.searchAccountByName(accountData.firstName, accountData.lastName);
        if (existingByName) {
            console.log(`Found existing account by name: ${existingByName.accountId}`);
            return existingByName;
        }

        // Create new account if not found
        const newAccount = await this.createAccount(accountData);
        console.log(`Created new account: ${newAccount.accountId || newAccount.id}`);
        return newAccount;
    }

    /**
     * Create a Service_c custom object record using API v1
     * @param {Object} serviceData - Service record data
     * @returns {Promise<Object>} Created service record
     */
    async createServiceRecord(serviceData) {
        try {
            // Ensure we have a valid session
            if (!this.sessionId) {
                await this.loginV1();
            }

            // Build query params for API v1
            // API v1 uses repeated params: customObjectRecord.customObjectRecordDataList.customObjectRecordData.name/value
            const params = new URLSearchParams();
            params.append('userSessionId', this.sessionId);
            params.append('customObjectRecord.objectApiName', 'Service_c');

            // Add each field as a separate name/value pair
            Object.entries(serviceData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    params.append('customObjectRecord.customObjectRecordDataList.customObjectRecordData.name', key);
                    params.append('customObjectRecord.customObjectRecordDataList.customObjectRecordData.value', String(value));
                }
            });

            // Use POST with form data (not GET with query params) to avoid URL length limits
            const response = await this.clientV1.post('/customObjectRecord/createCustomObjectRecord', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.data?.createCustomObjectRecordResponse?.operationResult === 'SUCCESS') {
                console.log('Service_c record created:', response.data.createCustomObjectRecordResponse.customObjectRecord);
                return response.data.createCustomObjectRecordResponse.customObjectRecord;
            } else {
                const errors = response.data?.createCustomObjectRecordResponse?.errors;
                console.error('Failed to create Service_c record:', errors);
                throw new Error(JSON.stringify(errors));
            }
        } catch (error) {
            console.error('Error creating Service_c record:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Submit LOTC form data to Neon CRM
     * Creates accounts for Child, Caregiver, and Social Worker
     * Creates a Service_c record linking all accounts
     * @param {Object} formData - Complete form submission data
     * @returns {Promise<Object>} Result object with success status and details
     */
    async submitFormToNeon(formData) {
        try {
            // 1. Create or find CHILD account
            let childAccount = null;
            try {
                // Format child DOB to yyyy-MM-dd if present (Neon API v2 format for accounts)
                let childDobFormatted = null;
                if (formData.childDOB) {
                    // DOB from form is already in yyyy-MM-dd format
                    childDobFormatted = formData.childDOB;
                }

                childAccount = await this.getOrCreateAccount({
                    firstName: formData.childFirstName,
                    lastName: formData.childLastInitial
                    // Don't send DOB/gender for now - causing JSON errors
                });
                console.log('Child account:', childAccount?.accountId || childAccount?.id);
            } catch (childError) {
                console.error('Error with child account:', childError.message);
            }

            // 2. Create or find CAREGIVER account
            let caregiverAccount = null;
            try {
                caregiverAccount = await this.getOrCreateAccount({
                    firstName: formData.caregiverFirstName,
                    lastName: formData.caregiverLastName,
                    email: formData.caregiverEmail || null,
                    phone: formData.caregiverPhone || formData.alternativePhone,
                    street: formData.caregiverStreet,
                    city: formData.caregiverCity,
                    state: formData.caregiverState,
                    zip: formData.caregiverZip,
                    county: formData.caregiverCounty
                });
                console.log('Caregiver account:', caregiverAccount?.accountId || caregiverAccount?.id);
            } catch (caregiverError) {
                console.error('Error with caregiver account:', caregiverError.message);
            }

            // 3. Create or find SOCIAL WORKER account
            let socialWorkerAccount = null;
            try {
                if (formData.socialWorkerFirstName && formData.socialWorkerLastName) {
                    socialWorkerAccount = await this.getOrCreateAccount({
                        firstName: formData.socialWorkerFirstName,
                        lastName: formData.socialWorkerLastName,
                        email: formData.socialWorkerEmail,
                        phone: formData.socialWorkerPhone || formData.alternativeSocialWorkerPhone
                    });
                    console.log('Social Worker account:', socialWorkerAccount?.accountId || socialWorkerAccount?.id);
                }
            } catch (swError) {
                console.error('Error with social worker account:', swError.message);
            }

            // 4. Create SERVICE_C record with all form data and account links
            const childAccountId = childAccount?.accountId || childAccount?.id || null;
            const caregiverAccountId = caregiverAccount?.accountId || caregiverAccount?.id || null;
            const socialWorkerAccountId = socialWorkerAccount?.accountId || socialWorkerAccount?.id || null;

            // Parse child age as number (remove "months" text if present)
            let childAgeNumber = null;
            if (formData.childAge) {
                const ageMatch = formData.childAge.match(/\d+/);
                if (ageMatch) {
                    childAgeNumber = parseInt(ageMatch[0], 10);
                }
            }

            // Map age to Neon age groups: Baby (0-2), Toddler (3-5), School Age (6-12), Teen (13+)
            let ageGroup = null;
            if (childAgeNumber !== null) {
                if (childAgeNumber <= 2) ageGroup = 'Baby (0-2)';
                else if (childAgeNumber <= 5) ageGroup = 'Toddler (3-5)';
                else if (childAgeNumber <= 12) ageGroup = 'School Age (6-12)';
                else ageGroup = 'Teen (13+)';
            }

            // Map gender: Form uses Male/Female, Neon uses Boy/Girl
            let genderMapped = null;
            if (formData.childGender === 'Male') genderMapped = 'Boy';
            else if (formData.childGender === 'Female') genderMapped = 'Girl';

            // Map pickup location to Neon values
            const pickupLocationMap = {
                'Belmont/Keith Hawthorne': 'Other',
                'Buncombe County/Asheville': 'Other',
                'Burke County/Morganton - Jamestown Road': 'Other',
                'Catawba County/Hickory - S. Center Street': 'Other',
                'Cleveland County/Shelby - E. Dixon Blvd.': 'Other',
                'Cornelius/Lake Norman- Torrence Chapel Rd. Cornelius': 'Lake Norman',
                'LOTC Office - S. Myrtle School Rd, Gastonia': 'LOTC Office',
                'McDowell County/Marion - Worley Road': 'Other',
                'Hendrick Motors/Charlotte': 'Hendrick Honda',
                'Mecklenburg County/Northlake': 'Other',
                'Rutherford County/Forest City': 'Other',
                'Stanly County/Albemarle - Aquadale Road': 'Other'
            };
            const pickupLocationMapped = pickupLocationMap[formData.pickupLocation] || 'Other';

            // Map county: Extract just county name from "County, ST" format
            let countyMapped = null;
            const countySource = formData.socialWorkerCounty || formData.caregiverCounty;
            if (countySource) {
                // Extract county name (before comma) and handle SC suffix
                const countyMatch = countySource.match(/^([^,]+)/);
                if (countyMatch) {
                    countyMapped = countyMatch[1].trim();
                    // Add (SC) suffix for South Carolina counties
                    if (countySource.includes(', SC')) {
                        countyMapped = countyMapped + ' (SC)';
                    }
                }
            }

            // Service type mapping - pass through directly
            // Neon options: Bags of Hope, Birthday, Beds, Baby Equipment, Camp, Shoes of Hope, Christmas, Just Like You, General Request, Life Box
            // Note: General Request and Life Box need to be added manually in Neon CRM admin
            const serviceTypeMapped = formData.requestType;

            // Format date as MM/dd/yyyy for Neon API
            const today = new Date();
            const serviceDateFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

            // Build notes with additional form data not in Service_c fields
            const notesArray = [];
            if (formData.relationship) notesArray.push(`Relationship: ${formData.relationship}`);
            if (formData.completionContact) notesArray.push(`Contact when ready: ${formData.completionContact}`);
            if (formData.isLicensedFoster) notesArray.push(`Licensed Foster: ${formData.isLicensedFoster}`);
            if (formData.childPlacementType) notesArray.push(`Placement Type: ${formData.childPlacementType}`);
            if (formData.childEthnicity) notesArray.push(`Ethnicity: ${formData.childEthnicity}`);
            if (formData.childNickname) notesArray.push(`Nickname: ${formData.childNickname}`);
            if (formData.childDOB) notesArray.push(`DOB: ${formData.childDOB}`);
            // Store original pickup location if mapped to Other
            if (pickupLocationMapped === 'Other' && formData.pickupLocation) {
                notesArray.push(`Pickup Location Detail: ${formData.pickupLocation}`);
            }

            const serviceData = {
                // Account Links (LOOKUP fields)
                Child_c: childAccountId,
                Caregiver_c: caregiverAccountId,
                Social_Worker_c: socialWorkerAccountId,

                // Service Information
                Service_Type_c: serviceTypeMapped,
                Service_Date_c: serviceDateFormatted,
                Status_c: 'Pending',

                // Location
                County_c: countyMapped,
                Pickup_Location_c: pickupLocationMapped,

                // Child Information
                Child_Name_c: formData.childFirstName,
                Child_Age_c: childAgeNumber,
                Age_Group_c: ageGroup,
                Gender_c: genderMapped,

                // Additional Info
                Child_Preferences_c: formData.additionalInfo || '',
                Notes_c: notesArray.join('\n')
            };

            let serviceRecord = null;
            try {
                serviceRecord = await this.createServiceRecord(serviceData);
                console.log('Created Service_c record:', serviceRecord);
            } catch (serviceError) {
                console.error('Error creating Service_c record:', serviceError.message);
                // Log the full error for debugging
                if (serviceError.response?.data) {
                    console.error('Service_c API Error Details:', JSON.stringify(serviceError.response.data, null, 2));
                }
            }

            return {
                success: true,
                childAccountId: childAccountId,
                caregiverAccountId: caregiverAccountId,
                socialWorkerAccountId: socialWorkerAccountId,
                serviceRecordId: serviceRecord?.id || serviceRecord?.recordId || null,
                message: 'Successfully submitted to Neon CRM'
            };

        } catch (error) {
            console.error('Error submitting form to Neon CRM:', error);
            throw {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }
}

module.exports = new NeonService();

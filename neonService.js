const axios = require('axios');

/**
 * Neon CRM API Service
 * Handles all interactions with Neon CRM API v2
 */
class NeonService {
    constructor() {
        this.orgId = process.env.NEON_ORG_ID;
        this.apiKey = process.env.NEON_API_KEY;
        this.baseURL = process.env.NEON_API_BASE_URL || 'https://api.neoncrm.com/v2';

        // Create axios instance with default config
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
        try {
            // Try GET /accounts with email filter
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
            // Search might not be configured or available - that's okay
            // We'll just create a new account
            console.log('Account search not available, will create new account');
            return null;
        }
    }

    /**
     * Create a new individual account in Neon CRM
     * @param {Object} accountData - Account data from form
     * @returns {Promise<Object>} Created account object
     */
    async createAccount(accountData) {
        try {
            const payload = {
                individualAccount: {
                    primaryContact: {
                        firstName: accountData.firstName,
                        lastName: accountData.lastName,
                        email1: accountData.email
                    }
                }
            };

            // Add phone if provided
            if (accountData.phone) {
                payload.individualAccount.primaryContact.phone1 = accountData.phone;
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
     * Update an existing account
     * @param {string} accountId - Neon account ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated account object
     */
    async updateAccount(accountId, updateData) {
        try {
            const response = await this.client.patch(`/accounts/${accountId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating account:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create a custom field entry for the account
     * @param {string} accountId - Neon account ID
     * @param {Object} customFields - Custom field data
     * @returns {Promise<Object>} Response from Neon API
     */
    async addCustomFields(accountId, customFields) {
        try {
            // Custom fields handling would depend on your Neon CRM setup
            // This is a placeholder for future implementation
            console.log('Custom fields would be added here:', customFields);
            return { success: true };
        } catch (error) {
            console.error('Error adding custom fields:', error.message);
            throw error;
        }
    }

    /**
     * Submit LOTC form data to Neon CRM
     * @param {Object} formData - Complete form submission data
     * @returns {Promise<Object>} Result object with success status and details
     */
    async submitFormToNeon(formData) {
        try {
            // 1. Search for existing caregiver account by email
            let caregiverAccount = null;
            if (formData.caregiverEmail) {
                caregiverAccount = await this.searchAccountByEmail(formData.caregiverEmail);
            }

            // 2. Create or update caregiver account
            if (!caregiverAccount) {
                caregiverAccount = await this.createAccount({
                    firstName: formData.caregiverFirstName,
                    lastName: formData.caregiverLastName,
                    email: formData.caregiverEmail,
                    phone: formData.caregiverPhone || formData.alternativePhone,
                    street: formData.caregiverStreet,
                    city: formData.caregiverCity,
                    state: formData.caregiverState,
                    zip: formData.caregiverZip,
                    county: formData.caregiverCounty
                });
                console.log('Created new caregiver account:', caregiverAccount.accountId);
            } else {
                console.log('Found existing caregiver account:', caregiverAccount.accountId);
            }

            // 3. Search for existing social worker account
            let socialWorkerAccount = null;
            if (formData.socialWorkerEmail) {
                socialWorkerAccount = await this.searchAccountByEmail(formData.socialWorkerEmail);
            }

            // 4. Create or update social worker account
            if (!socialWorkerAccount && formData.socialWorkerEmail) {
                socialWorkerAccount = await this.createAccount({
                    firstName: formData.socialWorkerFirstName,
                    lastName: formData.socialWorkerLastName,
                    email: formData.socialWorkerEmail,
                    phone: formData.socialWorkerPhone,
                    street: '', // Social worker address not collected in form
                    city: '',
                    state: '',
                    zip: '',
                    county: formData.socialWorkerCounty
                });
                console.log('Created new social worker account:', socialWorkerAccount.accountId);
            } else if (socialWorkerAccount) {
                console.log('Found existing social worker account:', socialWorkerAccount.accountId);
            }

            // 5. Store form-specific data (request type, child info, etc.)
            // This would typically go into custom fields or a related object in Neon
            const submissionDetails = {
                requestType: formData.requestType,
                relationship: formData.relationship,
                childFirstName: formData.childFirstName,
                childLastName: formData.childLastInitial,
                childAge: formData.childAge,
                childDOB: formData.childDOB,
                childGender: formData.childGender,
                childEthnicity: formData.childEthnicity,
                childPlacementType: formData.childPlacementType,
                pickupLocation: formData.pickupLocation,
                completionContact: formData.completionContact,
                isLicensedFoster: formData.isLicensedFoster
            };

            return {
                success: true,
                caregiverAccountId: caregiverAccount?.accountId || caregiverAccount?.id,
                socialWorkerAccountId: socialWorkerAccount?.accountId || socialWorkerAccount?.id,
                submissionDetails: submissionDetails,
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

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * Supabase Service
 * Manages Supabase database client connection and configuration
 * Provides methods for database operations with proper server-side configuration
 */
class SupabaseService {
    /**
     * Initialize Supabase service
     * Checks configuration on instantiation
     */
    constructor() {
        this.supabase = null;
        this.configured = this.checkConfiguration();
    }

    /**
     * Check if required Supabase environment variables are configured
     * @returns {boolean} True if configured, false otherwise
     */
    checkConfiguration() {
        const hasUrl = !!process.env.SUPABASE_URL;
        const hasKey = !!process.env.SUPABASE_SERVICE_KEY;

        if (!hasUrl || !hasKey) {
            console.log('Supabase not configured - missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
            return false;
        }
        return true;
    }

    /**
     * Check if Supabase is properly configured
     * @returns {boolean} Configuration status
     */
    isConfigured() {
        return this.configured;
    }

    /**
     * Get Supabase client instance
     * Lazily initializes client with server-side configuration
     * @returns {import('@supabase/supabase-js').SupabaseClient} Configured Supabase client
     * @throws {Error} If Supabase is not configured
     */
    getClient() {
        if (!this.configured) {
            throw new Error('Supabase is not configured');
        }

        if (!this.supabase) {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false
                    }
                }
            );
        }

        return this.supabase;
    }

    /**
     * Insert a new form submission into Supabase
     * @param {Object} data - Form submission data with Neon IDs
     * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Result object
     */
    async insertSubmission(data) {
        if (!this.configured) {
            return { success: false, error: 'Supabase not configured' };
        }

        try {
            const client = this.getClient();

            // Map form data to database schema
            const submission = {
                submission_id: data.submissionId,
                neon_caregiver_id: data.neonCaregiverId || null,
                neon_social_worker_id: data.neonSocialWorkerId || null,
                neon_service_id: data.neonServiceId || null,

                // Request information
                request_type: data.requestType,
                general_request_sub_type: data.generalRequestSubType || null,
                bed_reason: data.bedReason || null,
                additional_info: data.additionalInfo || null,

                // Relationship information
                relationship: data.relationship,
                relationship_other: data.relationshipOther || null,

                // Person Completing Form (when relationship = Other)
                person_completing_first_name: data.personCompletingFirstName || null,
                person_completing_middle_name: data.personCompletingMiddleName || null,
                person_completing_last_name: data.personCompletingLastName || null,
                person_completing_phone: data.personCompletingPhone || null,
                person_completing_textable: data.personCompletingTextable || null,
                person_completing_email: data.personCompletingEmail || null,

                // Caregiver information
                caregiver_first_name: data.caregiverFirstName,
                caregiver_middle_name: data.caregiverMiddleName || null,
                caregiver_last_name: data.caregiverLastName,
                caregiver_email: data.caregiverEmail || null,
                caregiver_phone: data.caregiverPhone || null,
                caregiver_no_mobile: data.noMobileNumber || null,
                alternative_phone: data.alternativePhone || null,
                caregiver_textable: data.caregiverTextable || null,
                know_caregiver_email: data.knowCaregiverEmail || null,
                caregiver_street: data.caregiverStreet,
                caregiver_city: data.caregiverCity,
                caregiver_state: data.caregiverState,
                caregiver_zip: data.caregiverZip,
                caregiver_county: data.caregiverCounty,
                has_caregiver_info: data.hasCaregiverInfo || null,

                // Foster/Licensing information
                is_licensed_foster: data.isLicensedFoster,
                licensing_agency: data.licensingAgency || null,

                // Social worker information
                has_social_worker_info: data.hasSocialWorkerInfo || null,
                social_worker_first_name: data.socialWorkerFirstName,
                social_worker_middle_name: data.socialWorkerMiddleName || null,
                social_worker_last_name: data.socialWorkerLastName,
                social_worker_email: data.socialWorkerEmail,
                social_worker_phone: data.socialWorkerPhone || null,
                social_worker_no_mobile: data.noSocialWorkerMobileNumber || null,
                alternative_social_worker_phone: data.alternativeSocialWorkerPhone || null,
                social_worker_phone_ext: data.socialWorkerPhoneExt || null,
                social_worker_can_text: data.socialWorkerCanText || null,
                social_worker_county: data.socialWorkerCounty,
                social_worker_county_other: data.socialWorkerCountyOther || null,

                // Pickup information
                completion_contact: data.completionContact,
                pickup_location: data.pickupLocation,

                // Child information
                child_first_name: data.childFirstName,
                child_last_name: data.childLastName || data.childLastInitial || null,
                child_last_initial: data.childLastInitial || (data.childLastName ? data.childLastName.charAt(0) : null),
                child_nickname: data.childNickname || null,
                has_siblings: data.hasSiblings || null,
                child_siblings_names: data.childSiblingsNames || null,
                siblings_same_home: data.siblingsSameHome || null,
                child_placement_type: data.childPlacementType,
                child_placement_type_other: data.childPlacementTypeOther || null,
                child_gender: data.childGender,
                child_age: data.childAge,
                child_dob: data.childDOB,
                child_ethnicity: data.childEthnicity,
                child_custody_county: data.childCustodyCounty,

                // Group Home information (when placement type = Group Home)
                group_home_name: data.groupHomeName || null,
                group_home_phone: data.groupHomePhone || null,

                // Clothing sizes (for Bags of Hope)
                shirt_size: data.shirtSize || null,
                pant_size: data.pantSize || null,
                sock_shoe_size: data.sockShoeSize || null,
                undergarment_size: data.undergarmentSize || null,
                diaper_size: data.diaperSize || null,

                // Shoes of Hope sizes
                child_grade_fall: data.childGradeFall || null,
                shoe_gender: data.shoeGender || null,
                girl_shoe_size: data.girlShoeSize || null,
                boy_shoe_size: data.boyShoeSize || null,
                underwear_gender: data.underwearGender || null,
                girls_underwear_size: data.girlsUnderwearSize || null,
                boys_underwear_size: data.boysUnderwearSize || null,
                shoes_of_hope_comments: data.shoesOfHopeComments || null,

                // Agreements
                agree_to_terms: data.agreeToTerms,

                // Sync metadata
                sync_status: 'synced',
                last_synced_at: new Date().toISOString()
            };

            const { data: insertedData, error } = await client
                .from('submissions')
                .insert([submission])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                return { success: false, error: error.message };
            }

            console.log('Successfully inserted to Supabase:', insertedData.id);
            return { success: true, data: insertedData };

        } catch (error) {
            console.error('Supabase insertSubmission error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get submission records by Neon CRM account ID
     * @param {string} neonId - Neon CRM account ID
     * @param {string} type - Account type ('caregiver' or 'social_worker')
     * @returns {Promise<{success: boolean, data?: Array, error?: string}>} Query result
     */
    async getSubmissionByNeonId(neonId, type = 'caregiver') {
        if (!this.configured) {
            return { success: false, error: 'Supabase not configured' };
        }

        try {
            const client = this.getClient();
            const column = type === 'caregiver' ? 'neon_caregiver_id' : 'neon_social_worker_id';

            const { data, error } = await client
                .from('submissions')
                .select('*')
                .eq(column, neonId);

            if (error) {
                console.error('Supabase query error:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };

        } catch (error) {
            console.error('Supabase getSubmissionByNeonId error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update a submission record
     * @param {string} id - Submission UUID
     * @param {Object} updates - Fields to update
     * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Update result
     */
    async updateSubmission(id, updates) {
        if (!this.configured) {
            return { success: false, error: 'Supabase not configured' };
        }

        try {
            const client = this.getClient();

            // Always update timestamp
            updates.updated_at = new Date().toISOString();
            updates.last_synced_at = new Date().toISOString();

            const { data, error } = await client
                .from('submissions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Supabase update error:', error);
                return { success: false, error: error.message };
            }

            console.log('Successfully updated Supabase submission:', id);
            return { success: true, data };

        } catch (error) {
            console.error('Supabase updateSubmission error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SupabaseService();

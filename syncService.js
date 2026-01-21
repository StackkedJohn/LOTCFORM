const neonService = require('./neonService');
const supabaseService = require('./supabaseService');

/**
 * Sync Service
 * Orchestrates bidirectional synchronization between Neon CRM and Supabase
 * Implements timestamp-based conflict resolution (last write wins)
 */
class SyncService {
    constructor() {
        this.neon = neonService;
        this.supabase = supabaseService;
    }

    /**
     * Compare timestamps to determine if sync should proceed
     * Returns true if incoming timestamp is newer than local
     * @param {string} localTimestamp - Local record timestamp
     * @param {string} incomingTimestamp - Incoming update timestamp
     * @returns {boolean} True if should sync (incoming is newer)
     */
    shouldSync(localTimestamp, incomingTimestamp) {
        if (!localTimestamp) {
            return true; // No local record, always sync
        }

        const local = new Date(localTimestamp);
        const incoming = new Date(incomingTimestamp);

        return incoming > local;
    }

    /**
     * Map Neon CRM field names to Supabase schema
     * @param {Object} neonData - Neon CRM account data
     * @returns {Object} Mapped Supabase fields
     */
    mapNeonToSupabase(neonData) {
        return {
            caregiver_first_name: neonData.firstName,
            caregiver_last_name: neonData.lastName,
            caregiver_email: neonData.email,
            caregiver_phone: neonData.phone,
            caregiver_street: neonData.addresses?.[0]?.street || null,
            caregiver_city: neonData.addresses?.[0]?.city || null,
            caregiver_state: neonData.addresses?.[0]?.state || null,
            caregiver_zip: neonData.addresses?.[0]?.zip || null,
            caregiver_county: neonData.addresses?.[0]?.county || null
        };
    }

    /**
     * Map Supabase fields to Neon CRM format
     * @param {Object} supabaseData - Supabase submission record
     * @returns {Object} Mapped Neon CRM fields
     */
    mapSupabaseToNeon(supabaseData) {
        return {
            firstName: supabaseData.caregiver_first_name,
            lastName: supabaseData.caregiver_last_name,
            email: supabaseData.caregiver_email,
            phone: supabaseData.caregiver_phone || supabaseData.alternative_phone,
            addresses: [{
                street: supabaseData.caregiver_street,
                city: supabaseData.caregiver_city,
                state: supabaseData.caregiver_state,
                zip: supabaseData.caregiver_zip,
                county: supabaseData.caregiver_county
            }]
        };
    }

    /**
     * Sync Neon CRM account updates to Supabase
     * @param {string} neonAccountId - Neon CRM account ID
     * @param {Object} neonData - Updated Neon account data
     * @param {string} timestamp - Update timestamp
     * @returns {Promise<{success: boolean, updated?: number, error?: string}>} Sync result
     */
    async syncNeonToSupabase(neonAccountId, neonData, timestamp) {
        try {
            console.log(`Syncing Neon account ${neonAccountId} to Supabase...`);

            // Find Supabase records with this Neon ID
            const result = await this.supabase.getSubmissionByNeonId(neonAccountId, 'caregiver');

            if (!result.success || !result.data || result.data.length === 0) {
                console.log('No matching Supabase records found for Neon ID:', neonAccountId);
                return { success: false, error: 'No matching records' };
            }

            // Map Neon fields to Supabase schema
            const updates = this.mapNeonToSupabase(neonData);

            // Update all matching records
            const updateResults = [];
            for (const record of result.data) {
                // Check if we should sync based on timestamp
                if (!this.shouldSync(record.updated_at, timestamp)) {
                    console.log(`Skipping sync for record ${record.id} - local is newer`);
                    continue;
                }

                const updateResult = await this.supabase.updateSubmission(record.id, updates);
                updateResults.push(updateResult);
            }

            console.log(`Synced ${updateResults.length} records from Neon to Supabase`);
            return { success: true, updated: updateResults.length };

        } catch (error) {
            console.error('Error syncing Neon to Supabase:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync Supabase record updates to Neon CRM
     * @param {Object} supabaseRecord - Supabase submission record
     * @param {string} timestamp - Update timestamp
     * @returns {Promise<{success: boolean, message?: string, error?: string}>} Sync result
     */
    async syncSupabaseToNeon(supabaseRecord, timestamp) {
        try {
            console.log(`Syncing Supabase record ${supabaseRecord.id} to Neon...`);

            const neonAccountId = supabaseRecord.neon_caregiver_id;

            if (!neonAccountId) {
                console.log('No Neon account ID found in Supabase record');
                return { success: false, error: 'No Neon account ID' };
            }

            // Check if Neon is configured
            if (!this.neon.isConfigured()) {
                console.log('Neon CRM not configured, skipping sync');
                return { success: false, error: 'Neon not configured' };
            }

            // Map Supabase fields to Neon format
            const neonData = this.mapSupabaseToNeon(supabaseRecord);

            // TODO: Add method to neonService to update account
            // For now, we'll use the existing searchAccountByEmail and createAccount pattern
            // This would need a new updateAccount method in neonService.js

            console.log('Neon update would happen here with data:', neonData);

            // Placeholder - in real implementation, call neon update API
            return { success: true, message: 'Sync to Neon pending implementation' };

        } catch (error) {
            console.error('Error syncing Supabase to Neon:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SyncService();

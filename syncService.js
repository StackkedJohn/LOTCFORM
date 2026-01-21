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
}

module.exports = new SyncService();

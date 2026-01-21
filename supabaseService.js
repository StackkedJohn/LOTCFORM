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
}

module.exports = new SupabaseService();

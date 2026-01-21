const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseService {
    constructor() {
        this.supabase = null;
        this.configured = this.checkConfiguration();
    }

    checkConfiguration() {
        const hasUrl = !!process.env.SUPABASE_URL;
        const hasKey = !!process.env.SUPABASE_SERVICE_KEY;

        if (!hasUrl || !hasKey) {
            console.log('Supabase not configured - missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
            return false;
        }
        return true;
    }

    isConfigured() {
        return this.configured;
    }

    getClient() {
        if (!this.configured) {
            throw new Error('Supabase is not configured');
        }

        if (!this.supabase) {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );
        }

        return this.supabase;
    }
}

module.exports = new SupabaseService();

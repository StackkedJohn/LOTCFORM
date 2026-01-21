const syncService = require('../syncService');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, X-Webhook-Signature');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Verify webhook signature if secret is configured
        const webhookSecret = process.env.NEON_WEBHOOK_SECRET;
        if (webhookSecret) {
            const signature = req.headers['x-webhook-signature'];
            // TODO: Implement signature verification based on Neon's webhook format
            // For now, we'll log and continue
            console.log('Webhook signature verification not yet implemented');
        }

        const payload = req.body;
        console.log('Received Neon webhook:', payload);

        // Extract data from webhook payload
        const { eventType, accountId, timestamp, data } = payload;

        if (eventType !== 'account.updated') {
            console.log('Ignoring non-update event:', eventType);
            return res.status(200).json({ success: true, message: 'Event ignored' });
        }

        // Sync to Supabase
        const syncResult = await syncService.syncNeonToSupabase(accountId, data, timestamp);

        res.status(200).json({
            success: true,
            message: 'Webhook processed',
            syncResult
        });

    } catch (error) {
        console.error('Error processing Neon webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process webhook',
            error: error.message
        });
    }
};

require('dotenv').config();

class Config {
    constructor() {
        this.validateRequiredEnvVars();
    }

    validateRequiredEnvVars() {
        const required = [
            'TELEGRAM_BOT_TOKEN',
            'TELEGRAM_CHANNEL_ID'
        ];

        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    get telegramBotToken() {
        return process.env.TELEGRAM_BOT_TOKEN;
    }

    get telegramChannelId() {
        return process.env.TELEGRAM_CHANNEL_ID;
    }

    get solanaRpcUrl() {
        return process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    }

    get solanaTrackerApiKey() {
        return process.env.SOLANA_TRACKER_API_KEY;
    }

    get heliusApiKey() {
        return process.env.HELIUS_API_KEY;
    }

    get checkIntervalMinutes() {
        return parseInt(process.env.CHECK_INTERVAL_MINUTES) || 1;
    }

    get minLiquidityUsd() {
        return parseFloat(process.env.MIN_LIQUIDITY_USD) || 1000;
    }

    get minMarketCapUsd() {
        return parseFloat(process.env.MIN_MARKET_CAP_USD) || 10000;
    }

    get maxAgeMinutes() {
        return parseInt(process.env.MAX_AGE_MINUTES) || 5;
    }

    get logLevel() {
        return process.env.LOG_LEVEL || 'info';
    }

    // Alternative RPC endpoints for better reliability
    get rpcEndpoints() {
        return [
            'https://api.mainnet-beta.solana.com',
            'https://solana-api.projectserum.com',
            'https://rpc.ankr.com/solana',
            'https://api.mainnet-beta.solana.com'
        ];
    }
}

module.exports = Config;

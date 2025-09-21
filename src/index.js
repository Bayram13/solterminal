const { Connection, PublicKey } = require('@solana/web3.js');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const winston = require('winston');
const axios = require('axios');
require('dotenv').config();

const TokenMonitor = require('./services/TokenMonitor');
const TelegramService = require('./services/TelegramService');
const Config = require('./config/Config');
const Logger = require('./utils/Logger');

class SolanaTokenBot {
    constructor() {
        this.logger = new Logger();
        this.config = new Config();
        this.connection = new Connection(this.config.solanaRpcUrl);
        this.telegramService = new TelegramService(this.config);
        this.tokenMonitor = new TokenMonitor(this.connection, this.config);
        
        this.processedTokens = new Set();
        this.isRunning = false;
    }

    async start() {
        try {
            this.logger.info('Starting Solana Token Monitor Bot...');
            
            // Initialize services
            await this.telegramService.initialize();
            await this.tokenMonitor.initialize();
            
            // Start monitoring
            this.startMonitoring();
            
            this.logger.info('Bot started successfully!');
            this.telegramService.sendMessage('🚀 Solana Token Monitor Bot is now active!');
            
        } catch (error) {
            this.logger.error('Failed to start bot:', error);
            process.exit(1);
        }
    }

    startMonitoring() {
        // Check for new tokens every minute
        cron.schedule(`*/${this.config.checkIntervalMinutes} * * * *`, async () => {
            if (!this.isRunning) {
                this.isRunning = true;
                await this.checkForNewTokens();
                this.isRunning = false;
            }
        });

        this.logger.info(`Monitoring started - checking every ${this.config.checkIntervalMinutes} minute(s)`);
    }

    async checkForNewTokens() {
        try {
            this.logger.info('Checking for new tokens...');
            
            const newTokens = await this.tokenMonitor.getNewTokens();
            
            for (const token of newTokens) {
                if (!this.processedTokens.has(token.mint)) {
                    await this.processNewToken(token);
                    this.processedTokens.add(token.mint);
                }
            }
            
            this.logger.info(`Found ${newTokens.length} new tokens`);
            
        } catch (error) {
            this.logger.error('Error checking for new tokens:', error);
        }
    }

    async processNewToken(token) {
        try {
            // Check if token meets our criteria
            if (this.shouldProcessToken(token)) {
                const message = this.formatTokenMessage(token);
                await this.telegramService.sendMessage(message);
                this.logger.info(`Sent new token to Telegram: ${token.symbol} (${token.mint})`);
            }
        } catch (error) {
            this.logger.error(`Error processing token ${token.mint}:`, error);
        }
    }

    shouldProcessToken(token) {
        // Filter tokens based on criteria
        const now = Date.now();
        const tokenAge = now - token.createdTime;
        const maxAge = this.config.maxAgeMinutes * 60 * 1000;

        return (
            tokenAge <= maxAge &&
            token.liquidityUsd >= this.config.minLiquidityUsd &&
            token.marketCapUsd >= this.config.minMarketCapUsd &&
            !token.risky
        );
    }

    formatTokenMessage(token) {
        const age = Math.floor((Date.now() - token.createdTime) / 60000);
        const riskEmoji = token.risky ? '⚠️' : '✅';
        
        return `🪙 **New Token Detected** ${riskEmoji}

**${token.name}** (${token.symbol})
📍 **Address:** \`${token.mint}\`
💰 **Market Cap:** $${this.formatNumber(token.marketCapUsd)}
💧 **Liquidity:** $${this.formatNumber(token.liquidityUsd)}
📊 **Price:** $${token.priceUsd ? token.priceUsd.toFixed(8) : 'N/A'}
👥 **Holders:** ${token.holders || 'N/A'}
⏰ **Age:** ${age} minutes

🔗 **Links:**
• [DexScreener](https://dexscreener.com/solana/${token.mint})
• [Solscan](https://solscan.io/token/${token.mint})
• [Jupiter](https://jup.ag/swap/SOL-${token.mint})

${token.description ? `📝 **Description:** ${token.description}` : ''}

#Solana #NewToken #${token.symbol}`;
    }

    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down bot...');
    process.exit(0);
});

// Start the bot
const bot = new SolanaTokenBot();
bot.start().catch(error => {
    console.error('Failed to start bot:', error);
    process.exit(1);
});

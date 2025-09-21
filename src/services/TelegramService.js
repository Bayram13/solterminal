const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
    constructor(config) {
        this.config = config;
        this.bot = null;
    }

    async initialize() {
        try {
            this.bot = new TelegramBot(this.config.telegramBotToken, { polling: false });
            
            // Test the bot
            const me = await this.bot.getMe();
            console.log(`Telegram bot initialized: @${me.username}`);
            
        } catch (error) {
            throw new Error(`Failed to initialize Telegram bot: ${error.message}`);
        }
    }

    async sendMessage(message, options = {}) {
        try {
            const defaultOptions = {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                ...options
            };

            await this.bot.sendMessage(this.config.telegramChannelId, message, defaultOptions);
            
        } catch (error) {
            console.error('Failed to send Telegram message:', error.message);
            throw error;
        }
    }

    async sendPhoto(photo, caption = '', options = {}) {
        try {
            const defaultOptions = {
                caption,
                parse_mode: 'Markdown',
                ...options
            };

            await this.bot.sendPhoto(this.config.telegramChannelId, photo, defaultOptions);
            
        } catch (error) {
            console.error('Failed to send Telegram photo:', error.message);
            throw error;
        }
    }

    async sendDocument(document, caption = '', options = {}) {
        try {
            const defaultOptions = {
                caption,
                parse_mode: 'Markdown',
                ...options
            };

            await this.bot.sendDocument(this.config.telegramChannelId, document, defaultOptions);
            
        } catch (error) {
            console.error('Failed to send Telegram document:', error.message);
            throw error;
        }
    }

    // Send a formatted token alert
    async sendTokenAlert(token) {
        const message = this.formatTokenAlert(token);
        await this.sendMessage(message);
    }

    formatTokenAlert(token) {
        const age = Math.floor((Date.now() - token.createdTime) / 60000);
        const riskEmoji = token.risky ? '⚠️' : '✅';
        
        return `🪙 **New Token Alert** ${riskEmoji}

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

module.exports = TelegramService;

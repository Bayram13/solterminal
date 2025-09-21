# Solana Token Monitor Bot

A Node.js bot that monitors newly released Solana tokens and sends alerts to a Telegram channel. This bot uses alternative APIs to Dexscreener and Solscan, including Solana Tracker, Helius, and direct RPC calls.

## Features

- 🔍 **Multiple Data Sources**: Uses Solana Tracker API, Helius API, and direct RPC calls
- ⚡ **Real-time Monitoring**: Checks for new tokens every minute (configurable)
- 🎯 **Smart Filtering**: Filters tokens by liquidity, market cap, and age
- 🚨 **Risk Assessment**: Identifies potentially risky tokens
- 📱 **Telegram Integration**: Sends formatted alerts to your Telegram channel
- 📊 **Rich Token Data**: Includes market cap, liquidity, holders, and links
- 🔧 **Configurable**: Easy to customize filters and settings

## Prerequisites

- Node.js 16+ 
- A Telegram bot token (get from [@BotFather](https://t.me/botfather))
- A Telegram channel to send alerts to
- Optional: API keys for enhanced data (Solana Tracker, Helius)

## Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd solana-token-monitor-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Required
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_CHANNEL_ID=@your_channel_username_or_channel_id
   
   # Optional - for enhanced data
   SOLANA_TRACKER_API_KEY=your_solana_tracker_api_key_here
   HELIUS_API_KEY=your_helius_api_key_here
   
   # Configuration
   CHECK_INTERVAL_MINUTES=1
   MIN_LIQUIDITY_USD=1000
   MIN_MARKET_CAP_USD=10000
   MAX_AGE_MINUTES=5
   ```

4. **Create logs directory**
   ```bash
   mkdir logs
   ```

## Configuration

### Required Settings

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from @BotFather
- `TELEGRAM_CHANNEL_ID`: Your channel username (e.g., @mychannel) or channel ID

### Optional API Keys (for enhanced data)

- `SOLANA_TRACKER_API_KEY`: Get from [Solana Tracker](https://solanatracker.io/)
- `HELIUS_API_KEY`: Get from [Helius](https://helius.xyz/)

### Bot Settings

- `CHECK_INTERVAL_MINUTES`: How often to check for new tokens (default: 1)
- `MIN_LIQUIDITY_USD`: Minimum liquidity to filter tokens (default: 1000)
- `MIN_MARKET_CAP_USD`: Minimum market cap to filter tokens (default: 10000)
- `MAX_AGE_MINUTES`: Maximum age of tokens to consider "new" (default: 5)

## Usage

### Start the bot
```bash
npm start
```

### Development mode (with auto-restart)
```bash
npm run dev
```

## How It Works

The bot uses multiple strategies to detect new tokens:

1. **Solana Tracker API**: Primary source for comprehensive token data
2. **Helius API**: Secondary source for token metadata
3. **Direct RPC**: Fallback method using Solana RPC calls
4. **Program Monitoring**: Monitors token creation programs

### Token Filtering

Tokens are filtered based on:
- **Age**: Only tokens created within the last X minutes
- **Liquidity**: Minimum USD liquidity threshold
- **Market Cap**: Minimum USD market cap threshold
- **Risk Assessment**: Flags potentially risky tokens

### Telegram Alerts

Each alert includes:
- Token name, symbol, and address
- Market cap and liquidity
- Current price and holder count
- Age of the token
- Links to DexScreener, Solscan, and Jupiter
- Risk assessment

## API Alternatives Used

Instead of Dexscreener and Solscan APIs, this bot uses:

1. **Solana Tracker API** - Comprehensive token data and analytics
2. **Helius API** - Token metadata and enhanced data
3. **Direct Solana RPC** - Raw blockchain data
4. **Jupiter API** - For swap links and pricing

## Troubleshooting

### Common Issues

1. **Telegram Bot Not Working**
   - Verify your bot token is correct
   - Make sure the bot is added to your channel
   - Check that the channel ID is correct

2. **No Tokens Being Detected**
   - Check your RPC endpoint is working
   - Verify API keys if using optional services
   - Adjust filtering criteria (lower thresholds)

3. **High API Usage**
   - Increase `CHECK_INTERVAL_MINUTES` to reduce frequency
   - Use free RPC endpoints or get API keys for better limits

### Logs

Check the `logs/` directory for:
- `combined.log` - All log messages
- `error.log` - Error messages only

## Customization

### Adding New Data Sources

To add a new API source, modify `src/services/TokenMonitor.js`:

```javascript
async getTokensFromNewAPI() {
    // Your implementation here
}
```

### Custom Filtering

Modify the `shouldProcessToken()` method in `src/index.js` to add custom filters.

### Custom Message Format

Edit the `formatTokenMessage()` method in `src/index.js` to customize the Telegram message format.

## Security Notes

- Never commit your `.env` file
- Use environment variables for all sensitive data
- Consider using a dedicated RPC endpoint for production
- Monitor your API usage to avoid rate limits

## License

MIT License - feel free to modify and distribute.

## Support

For issues and questions:
1. Check the logs in the `logs/` directory
2. Verify your configuration in `.env`
3. Test your Telegram bot manually
4. Check API key validity and limits

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

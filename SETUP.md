# Setup Guide for Solana Token Monitor Bot

This guide will walk you through setting up the Solana Token Monitor Bot step by step.

## Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather
3. **Send the command** `/newbot`
4. **Choose a name** for your bot (e.g., "Solana Token Monitor")
5. **Choose a username** for your bot (must end with 'bot', e.g., "solana_token_monitor_bot")
6. **Copy the bot token** that BotFather gives you

## Step 2: Create a Telegram Channel

1. **Open Telegram** and click the menu (three lines)
2. **Click "New Channel"**
3. **Choose a name** for your channel (e.g., "Solana New Tokens")
4. **Choose a username** for your channel (e.g., "solana_new_tokens")
5. **Add your bot** to the channel as an administrator:
   - Go to channel settings
   - Click "Administrators"
   - Click "Add Admin"
   - Search for your bot username
   - Give it permission to "Post Messages"

## Step 3: Get Channel ID

1. **Add your bot** to the channel (if not already done)
2. **Send a message** in the channel (e.g., "Hello")
3. **Visit this URL** in your browser: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. **Find your channel ID** in the response (it will be a negative number like `-1001234567890`)
5. **Copy the channel ID**

## Step 4: Get API Keys (Optional but Recommended)

### Solana Tracker API Key
1. **Visit** [Solana Tracker](https://solanatracker.io/)
2. **Sign up** for an account
3. **Go to API section** and get your API key
4. **Copy the API key**

### Helius API Key
1. **Visit** [Helius](https://helius.xyz/)
2. **Sign up** for an account
3. **Create a new project**
4. **Copy the API key**

## Step 5: Install and Configure the Bot

1. **Install Node.js** (version 16 or higher) from [nodejs.org](https://nodejs.org/)

2. **Open terminal/command prompt** and navigate to the bot directory:
   ```bash
   cd solana-token-monitor-bot
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create environment file**:
   ```bash
   copy env.example .env
   ```
   (On Mac/Linux: `cp env.example .env`)

5. **Edit the .env file** with your information:
   ```env
   # Required
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHANNEL_ID=-1001234567890
   
   # Optional - for better data
   SOLANA_TRACKER_API_KEY=your_solana_tracker_api_key_here
   HELIUS_API_KEY=your_helius_api_key_here
   
   # Configuration
   CHECK_INTERVAL_MINUTES=1
   MIN_LIQUIDITY_USD=1000
   MIN_MARKET_CAP_USD=10000
   MAX_AGE_MINUTES=5
   ```

## Step 6: Test the Bot

1. **Start the bot**:
   ```bash
   npm start
   ```

2. **Check the logs** for any errors

3. **Wait a few minutes** and check your Telegram channel for new token alerts

## Step 7: Customize Settings

You can adjust these settings in your `.env` file:

- `CHECK_INTERVAL_MINUTES`: How often to check for new tokens (1-60 minutes)
- `MIN_LIQUIDITY_USD`: Minimum liquidity to show tokens (default: $1,000)
- `MIN_MARKET_CAP_USD`: Minimum market cap to show tokens (default: $10,000)
- `MAX_AGE_MINUTES`: Maximum age of tokens to consider "new" (default: 5 minutes)

## Troubleshooting

### Bot Not Sending Messages
- Check that your bot token is correct
- Verify the bot is added to your channel as an admin
- Make sure the channel ID is correct (should be negative for channels)

### No Tokens Being Detected
- Check your internet connection
- Verify your RPC endpoint is working
- Try lowering the filtering criteria (MIN_LIQUIDITY_USD, MIN_MARKET_CAP_USD)
- Check the logs for error messages

### High API Usage
- Increase CHECK_INTERVAL_MINUTES to check less frequently
- Get API keys for Solana Tracker or Helius for better rate limits
- Use a dedicated RPC endpoint

## Running in Production

For production use, consider:

1. **Using PM2** for process management:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name "solana-token-bot"
   ```

2. **Setting up a VPS** or cloud server for 24/7 operation

3. **Using environment variables** instead of .env file for security

4. **Setting up monitoring** and alerts for the bot itself

## Support

If you encounter issues:

1. Check the logs in the `logs/` directory
2. Verify all your configuration is correct
3. Test your Telegram bot manually
4. Check that your API keys are valid and have sufficient limits

## Security Notes

- Never share your bot token or API keys
- Don't commit your .env file to version control
- Use environment variables in production
- Monitor your API usage to avoid rate limits

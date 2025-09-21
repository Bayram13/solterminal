/**
 * Test script to verify configuration and API connections
 * Run this before starting the main bot to ensure everything is set up correctly
 */

require('dotenv').config();
const { Connection } = require('@solana/web3.js');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

async function testConfiguration() {
    console.log('🔧 Testing Solana Token Monitor Bot Configuration...\n');

    // Test 1: Environment Variables
    console.log('1. Testing Environment Variables...');
    const requiredVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHANNEL_ID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.log('❌ Missing required environment variables:', missingVars.join(', '));
        console.log('Please check your .env file\n');
        return false;
    }
    console.log('✅ All required environment variables are set\n');

    // Test 2: Telegram Bot
    console.log('2. Testing Telegram Bot...');
    try {
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
        const me = await bot.getMe();
        console.log(`✅ Telegram bot connected: @${me.username}`);
        
        // Test sending a message
        await bot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, '🧪 Test message from Solana Token Monitor Bot');
        console.log('✅ Test message sent to channel\n');
    } catch (error) {
        console.log('❌ Telegram bot error:', error.message);
        console.log('Please check your bot token and channel ID\n');
        return false;
    }

    // Test 3: Solana RPC Connection
    console.log('3. Testing Solana RPC Connection...');
    try {
        const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
        const connection = new Connection(rpcUrl);
        const version = await connection.getVersion();
        console.log(`✅ Solana RPC connected: ${version['solana-core']}`);
    } catch (error) {
        console.log('❌ Solana RPC error:', error.message);
        console.log('Please check your RPC URL\n');
        return false;
    }

    // Test 4: Optional API Keys
    console.log('4. Testing Optional API Keys...');
    
    if (process.env.SOLANA_TRACKER_API_KEY) {
        try {
            const response = await axios.get('https://data.solanatracker.io/tokens/latest', {
                headers: { 'x-api-key': process.env.SOLANA_TRACKER_API_KEY },
                timeout: 5000
            });
            console.log('✅ Solana Tracker API working');
        } catch (error) {
            console.log('⚠️ Solana Tracker API error:', error.message);
        }
    } else {
        console.log('⚠️ Solana Tracker API key not set (optional)');
    }

    if (process.env.HELIUS_API_KEY) {
        try {
            const response = await axios.get(`https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY}`, {
                timeout: 5000
            });
            console.log('✅ Helius API working');
        } catch (error) {
            console.log('⚠️ Helius API error:', error.message);
        }
    } else {
        console.log('⚠️ Helius API key not set (optional)');
    }

    console.log('\n🎉 Configuration test completed!');
    console.log('You can now start the bot with: npm start');
    return true;
}

// Run the test
testConfiguration().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});

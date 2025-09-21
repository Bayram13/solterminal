const axios = require('axios');

/**
 * Alternative API services for Solana token data
 * This file contains implementations for various APIs that can be used
 * instead of Dexscreener and Solscan
 */
class AlternativeAPIs {
    constructor(config) {
        this.config = config;
    }

    /**
     * Jupiter API - For token pricing and swap data
     */
    async getJupiterTokenData(mintAddress) {
        try {
            const response = await axios.get(`https://price.jup.ag/v4/price?ids=${mintAddress}`, {
                timeout: 10000
            });

            if (response.data.data && response.data.data[mintAddress]) {
                const tokenData = response.data.data[mintAddress];
                return {
                    price: tokenData.price,
                    timestamp: tokenData.timestamp,
                    source: 'jupiter'
                };
            }
            return null;
        } catch (error) {
            console.error('Jupiter API error:', error.message);
            return null;
        }
    }

    /**
     * Raydium API - For DEX data and liquidity
     */
    async getRaydiumTokenData(mintAddress) {
        try {
            // Raydium API endpoint (this may need to be updated based on current API)
            const response = await axios.get(`https://api.raydium.io/v2/sdk/token/raydium.mainnet.json`, {
                timeout: 10000
            });

            // Find token in the list
            const tokenData = response.data.find(token => token.mint === mintAddress);
            return tokenData ? {
                ...tokenData,
                source: 'raydium'
            } : null;
        } catch (error) {
            console.error('Raydium API error:', error.message);
            return null;
        }
    }

    /**
     * Orca API - For DEX data
     */
    async getOrcaTokenData(mintAddress) {
        try {
            const response = await axios.get(`https://api.mainnet.orca.so/v1/token/${mintAddress}`, {
                timeout: 10000
            });

            return {
                ...response.data,
                source: 'orca'
            };
        } catch (error) {
            console.error('Orca API error:', error.message);
            return null;
        }
    }

    /**
     * Birdeye API - For comprehensive token data
     */
    async getBirdeyeTokenData(mintAddress) {
        try {
            const response = await axios.get(`https://public-api.birdeye.so/public/v1/token/${mintAddress}`, {
                headers: {
                    'X-API-KEY': this.config.birdeyeApiKey || ''
                },
                timeout: 10000
            });

            return {
                ...response.data,
                source: 'birdeye'
            };
        } catch (error) {
            console.error('Birdeye API error:', error.message);
            return null;
        }
    }

    /**
     * CoinGecko API - For market data
     */
    async getCoinGeckoTokenData(mintAddress) {
        try {
            // First get the coin ID from the contract address
            const searchResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/solana/contract/${mintAddress}`, {
                timeout: 10000
            });

            if (searchResponse.data) {
                return {
                    ...searchResponse.data,
                    source: 'coingecko'
                };
            }
            return null;
        } catch (error) {
            console.error('CoinGecko API error:', error.message);
            return null;
        }
    }

    /**
     * Get comprehensive token data from multiple sources
     */
    async getComprehensiveTokenData(mintAddress) {
        const results = await Promise.allSettled([
            this.getJupiterTokenData(mintAddress),
            this.getRaydiumTokenData(mintAddress),
            this.getOrcaTokenData(mintAddress),
            this.getBirdeyeTokenData(mintAddress),
            this.getCoinGeckoTokenData(mintAddress)
        ]);

        const data = {
            mint: mintAddress,
            sources: {}
        };

        results.forEach((result, index) => {
            const sourceNames = ['jupiter', 'raydium', 'orca', 'birdeye', 'coingecko'];
            if (result.status === 'fulfilled' && result.value) {
                data.sources[sourceNames[index]] = result.value;
            }
        });

        return data;
    }

    /**
     * Get trending tokens from various sources
     */
    async getTrendingTokens() {
        const trendingTokens = [];

        try {
            // Jupiter trending
            const jupiterResponse = await axios.get('https://quote-api.jup.ag/v6/tokens', {
                timeout: 10000
            });

            if (jupiterResponse.data) {
                trendingTokens.push({
                    source: 'jupiter',
                    tokens: jupiterResponse.data.slice(0, 10) // Top 10
                });
            }
        } catch (error) {
            console.error('Error getting Jupiter trending tokens:', error.message);
        }

        try {
            // Birdeye trending
            const birdeyeResponse = await axios.get('https://public-api.birdeye.so/public/v1/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=10', {
                headers: {
                    'X-API-KEY': this.config.birdeyeApiKey || ''
                },
                timeout: 10000
            });

            if (birdeyeResponse.data && birdeyeResponse.data.data) {
                trendingTokens.push({
                    source: 'birdeye',
                    tokens: birdeyeResponse.data.data.items
                });
            }
        } catch (error) {
            console.error('Error getting Birdeye trending tokens:', error.message);
        }

        return trendingTokens;
    }

    /**
     * Get new token launches from various sources
     */
    async getNewTokenLaunches() {
        const newTokens = [];

        try {
            // Monitor for new token creation transactions
            const connection = new (require('@solana/web3.js')).Connection(this.config.solanaRpcUrl);
            
            // Get recent transactions for token program
            const tokenProgramId = new (require('@solana/web3.js')).PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
            
            const signatures = await connection.getSignaturesForAddress(tokenProgramId, {
                limit: 50
            });

            for (const sig of signatures) {
                try {
                    const tx = await connection.getTransaction(sig.signature);
                    if (tx && this.isTokenCreationTransaction(tx)) {
                        newTokens.push({
                            signature: sig.signature,
                            timestamp: sig.blockTime * 1000,
                            source: 'rpc'
                        });
                    }
                } catch (error) {
                    continue;
                }
            }
        } catch (error) {
            console.error('Error getting new token launches:', error.message);
        }

        return newTokens;
    }

    /**
     * Check if a transaction is a token creation transaction
     */
    isTokenCreationTransaction(transaction) {
        if (!transaction || !transaction.meta || !transaction.transaction) {
            return false;
        }

        const instructions = transaction.transaction.message.instructions;
        
        // Look for token creation instructions
        return instructions.some(instruction => {
            // This is a simplified check - you might need to enhance this
            // based on the actual instruction data structure
            return instruction.programIdIndex === 0; // Token program
        });
    }
}

module.exports = AlternativeAPIs;

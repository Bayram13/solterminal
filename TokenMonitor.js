const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

class TokenMonitor {
    constructor(connection, config) {
        this.connection = connection;
        this.config = config;
        this.lastCheckTime = Date.now();
        this.knownTokens = new Set();
    }

    async initialize() {
        console.log('Initializing Token Monitor...');
        
        // Load initial token list to avoid duplicates
        await this.loadInitialTokens();
        
        console.log('Token Monitor initialized');
    }

    async loadInitialTokens() {
        try {
            // Get recent tokens to populate known tokens set
            const recentTokens = await this.getRecentTokens();
            recentTokens.forEach(token => {
                this.knownTokens.add(token.mint);
            });
            
            console.log(`Loaded ${this.knownTokens.size} known tokens`);
        } catch (error) {
            console.error('Error loading initial tokens:', error);
        }
    }

    async getNewTokens() {
        try {
            const newTokens = [];
            
            // Method 1: Use Solana Tracker API if available
            if (this.config.solanaTrackerApiKey) {
                const trackerTokens = await this.getTokensFromTracker();
                newTokens.push(...trackerTokens);
            }
            
            // Method 2: Use Helius API if available
            if (this.config.heliusApiKey) {
                const heliusTokens = await this.getTokensFromHelius();
                newTokens.push(...heliusTokens);
            }
            
            // Method 3: Direct RPC monitoring (fallback)
            if (newTokens.length === 0) {
                const rpcTokens = await this.getTokensFromRPC();
                newTokens.push(...rpcTokens);
            }
            
            // Filter out already processed tokens
            const filteredTokens = newTokens.filter(token => 
                !this.knownTokens.has(token.mint) && 
                this.isTokenNew(token)
            );
            
            // Update known tokens
            filteredTokens.forEach(token => {
                this.knownTokens.add(token.mint);
            });
            
            return filteredTokens;
            
        } catch (error) {
            console.error('Error getting new tokens:', error);
            return [];
        }
    }

    async getTokensFromTracker() {
        try {
            const response = await axios.get('https://data.solanatracker.io/tokens/latest', {
                headers: {
                    'x-api-key': this.config.solanaTrackerApiKey
                },
                timeout: 10000
            });

            return response.data.map(tokenData => this.parseTrackerToken(tokenData));
            
        } catch (error) {
            console.error('Error fetching from Solana Tracker:', error.message);
            return [];
        }
    }

    parseTrackerToken(tokenData) {
        const token = tokenData.token;
        const pool = tokenData.pools?.[0];
        
        return {
            mint: token.mint,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            description: token.description,
            image: token.image,
            createdTime: token.creation?.created_time ? token.creation.created_time * 1000 : Date.now(),
            creator: token.creation?.creator,
            liquidityUsd: pool?.liquidity?.usd || 0,
            marketCapUsd: pool?.marketCap?.usd || 0,
            priceUsd: pool?.price?.usd || 0,
            holders: tokenData.holders || 0,
            risky: this.assessRisk(tokenData.risk),
            poolAddress: pool?.poolId,
            market: pool?.market
        };
    }

    async getTokensFromHelius() {
        try {
            const response = await axios.get(`https://api.helius.xyz/v0/token-metadata`, {
                params: {
                    'api-key': this.config.heliusApiKey
                },
                timeout: 10000
            });

            // This is a simplified example - Helius API structure may vary
            return response.data.map(token => this.parseHeliusToken(token));
            
        } catch (error) {
            console.error('Error fetching from Helius:', error.message);
            return [];
        }
    }

    parseHeliusToken(tokenData) {
        return {
            mint: tokenData.mint,
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals: tokenData.decimals,
            description: tokenData.description,
            image: tokenData.image,
            createdTime: Date.now(), // Helius doesn't provide creation time directly
            liquidityUsd: 0, // Would need additional API call
            marketCapUsd: 0, // Would need additional API call
            priceUsd: 0, // Would need additional API call
            holders: 0,
            risky: false
        };
    }

    async getTokensFromRPC() {
        try {
            // Monitor for new token accounts
            const tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
            
            // Get recent token accounts
            const accounts = await this.connection.getProgramAccounts(tokenProgramId, {
                filters: [
                    { dataSize: 165 }, // Token account size
                ]
            });

            const newTokens = [];
            
            for (const account of accounts.slice(0, 10)) { // Limit to recent accounts
                try {
                    const tokenInfo = await this.getTokenInfo(account.pubkey);
                    if (tokenInfo && this.isTokenNew(tokenInfo)) {
                        newTokens.push(tokenInfo);
                    }
                } catch (error) {
                    // Skip invalid tokens
                    continue;
                }
            }
            
            return newTokens;
            
        } catch (error) {
            console.error('Error fetching from RPC:', error.message);
            return [];
        }
    }

    async getTokenInfo(tokenAccount) {
        try {
            const accountInfo = await this.connection.getAccountInfo(tokenAccount);
            if (!accountInfo) return null;

            // Parse token account data
            const data = accountInfo.data;
            const mint = new PublicKey(data.slice(0, 32));
            
            // Get token metadata
            const metadata = await this.getTokenMetadata(mint);
            
            return {
                mint: mint.toString(),
                name: metadata.name || 'Unknown',
                symbol: metadata.symbol || 'UNK',
                decimals: metadata.decimals || 6,
                description: metadata.description || '',
                image: metadata.image || '',
                createdTime: Date.now(),
                liquidityUsd: 0,
                marketCapUsd: 0,
                priceUsd: 0,
                holders: 0,
                risky: false
            };
            
        } catch (error) {
            return null;
        }
    }

    async getTokenMetadata(mint) {
        try {
            // Try to get metadata from Metaplex
            const metadataProgramId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
            
            const [metadataPDA] = await PublicKey.findProgramAddress(
                [
                    Buffer.from('metadata'),
                    metadataProgramId.toBuffer(),
                    mint.toBuffer(),
                ],
                metadataProgramId
            );

            const metadataAccount = await this.connection.getAccountInfo(metadataPDA);
            if (!metadataAccount) return {};

            // Parse metadata (simplified)
            return {
                name: 'Token',
                symbol: 'TKN',
                decimals: 6
            };
            
        } catch (error) {
            return {};
        }
    }

    isTokenNew(token) {
        const now = Date.now();
        const maxAge = this.config.maxAgeMinutes * 60 * 1000;
        return (now - token.createdTime) <= maxAge;
    }

    assessRisk(riskData) {
        if (!riskData) return false;
        
        return (
            riskData.rugged ||
            riskData.score > 50 ||
            riskData.snipers?.count > 0 ||
            riskData.insiders?.count > 0
        );
    }

    // Alternative method: Monitor specific programs for new token creation
    async monitorTokenPrograms() {
        const programs = [
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // SPL Token
            'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', // Token-2022
        ];

        for (const programId of programs) {
            try {
                const program = new PublicKey(programId);
                const accounts = await this.connection.getProgramAccounts(program, {
                    filters: [
                        { dataSize: 82 }, // Mint account size
                    ]
                });

                // Process new mint accounts
                for (const account of accounts) {
                    if (!this.knownTokens.has(account.pubkey.toString())) {
                        // This is a new token
                        console.log(`New token detected: ${account.pubkey.toString()}`);
                    }
                }
                
            } catch (error) {
                console.error(`Error monitoring program ${programId}:`, error);
            }
        }
    }
}

module.exports = TokenMonitor;

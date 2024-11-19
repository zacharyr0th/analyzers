/**
 * Account Analyzer for Aptos blockchain
 * 
 * This script analyzes an Aptos account and generates a report of its tokens and resources.
 * 
 * Usage:
 *   npm run analyze -- <account-address>
 * 
 * Example:
 *   npm run analyze -- 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
 * 
 * Output:
 * - Generates a markdown report file: account-analysis-<address>.md
 * - Generates a JSON report file: account-analysis-<address>.json
 * - Prints the markdown report to console
 * 
 * The report includes:
 * - Token holdings with balances
 * - Total number of unique resources
 * - Notable resources (CoinStore, StakePool, liquidity pools)
 */

import { Aptos, AptosConfig, Network, MoveResource } from "@aptos-labs/ts-sdk";
import { writeResults } from "./utils";
import { AnalysisResults, TokenInfo, StakingInfo } from "./types";
import { formatNumber } from "./formatting";
import debounce from 'lodash/debounce';
import { retry } from '@lifeomic/attempt';
import LRUCache from 'lru-cache';

interface CoinStore {
    coin: {
        value: string;
    };
}

interface StakePool {
    active: { value: string };
    pending_active: { value: string };
    pending_inactive: { value: string };
}

// Pre-compile regex patterns
const COIN_STORE_PATTERN = /::coin::CoinStore</;
const TOKEN_TYPE_PATTERN = /<(.+)>/;

interface AnalysisReport {
    address: string;
    tokenHoldings: Array<{
        token: string;
        address: string;
        balance: string;
    }>;
    accountResources: {
        totalUnique: number;
        notable: string[];
    };
}

async function generateReport(resources: MoveResource[], address: string): Promise<AnalysisReport> {
    const { tokenMap, resourceMap } = processResources(resources);
    
    // Format token holdings
    const tokenHoldings = Array.from(tokenMap.entries()).map(([_, token]) => ({
        token: token.name,
        address: token.address,
        balance: formatNumber(token.balance)
    }));

    // Get notable resources
    const notableTypes = ["coin::CoinStore", "stake::StakePool", "liquidity_pool"];
    const notable = Array.from(resourceMap.keys())
        .filter(type => notableTypes.some(nt => type.includes(nt)));

    return {
        address,
        tokenHoldings,
        accountResources: {
            totalUnique: resourceMap.size,
            notable
        }
    };
}

async function generateMarkdownReport(report: AnalysisReport): Promise<string> {
    const markdown = [
        `# Account Analysis Report\n\n`,
        `## Address: ${report.address}\n\n`,
        `## Token Holdings\n\n`,
        `| Token | Address | Balance |\n`,
        `|-------|---------|----------|\n`
    ];

    report.tokenHoldings.forEach(token => {
        markdown.push(`| ${token.token} | \`${token.address}\` | ${token.balance} |\n`);
    });

    markdown.push(
        `\n## Account Resources\n\n`,
        `Total unique resources: ${report.accountResources.totalUnique}\n\n`,
        `Notable resources:\n`
    );

    report.accountResources.notable.forEach(resource => {
        markdown.push(`- ${resource}\n`);
    });

    return markdown.join('');
}

// Create a debounced version of the client.getAccountResources call
const debouncedGetResources = debounce(
    (client: Aptos, address: string) => 
        client.getAccountResources({ accountAddress: address }),
    800,
    { leading: true }
);

// Add this memory cache implementation
const CACHE_SIZE = 100;
const resourceCache = new LRUCache<string, {
    data: MoveResource[],
    timestamp: number
}>({
    max: CACHE_SIZE
});

class LRUCache<K, V> {
    private cache = new Map<K, V>();
    private readonly max: number;

    constructor(opts: { max: number }) {
        this.max = opts.max;
    }

    get(key: K): V | undefined {
        const item = this.cache.get(key);
        if (item) {
            // Refresh item position
            this.cache.delete(key);
            this.cache.set(key, item);
        }
        return item;
    }

    set(key: K, val: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.max) {
            // Remove oldest item
            this.cache.delete(this.cache.keys().next().value);
        }
        this.cache.set(key, val);
    }
}

async function getResourcesWithCache(client: Aptos, address: string) {
    const cacheKey = `resources-${address}`;
    const cached = resourceCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }

    const resources = await client.getAccountResources({ accountAddress: address });
    resourceCache.set(cacheKey, {
        data: resources,
        timestamp: Date.now()
    });
    
    return resources;
}

async function analyzeAccount(address: string): Promise<void> {
    const config = new AptosConfig({ network: Network.MAINNET });
    const client = new Aptos(config);

    try {
        const resources = await retry(
            async () => getResourcesWithCache(client, address),
            {
                maxAttempts: 3,
                delay: 1000,
                factor: 2
            }
        );
        
        // Generate the report structure that will be used for both JSON and markdown
        const report = await generateReport(resources, address);
        
        // Generate the markdown from the report
        const markdown = await generateMarkdownReport(report);
        
        // Create filename with address
        const filename = `account-analysis-${address.substring(0, 10)}`;
        
        // Write both markdown and JSON results
        await writeResults(filename, markdown, report);
        
        // Also log to console
        console.log(markdown);

    } catch (error) {
        console.error('Error analyzing account:', error);
        throw error;
    }
}

const address = process.argv[2];
if (!address) {
    console.error('Please provide an account address as an argument');
    process.exit(1);
}

analyzeAccount(address).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

// Process resources more efficiently
const processResources = (resources: MoveResource[]) => {
    return resources.reduce((acc, resource) => {
        acc.resourceMap.set(resource.type, resource);
        
        if (COIN_STORE_PATTERN.test(resource.type)) {
            const [, tokenType] = resource.type.match(TOKEN_TYPE_PATTERN) || [];
            if (tokenType) {
                const [tokenAddress, , tokenName] = tokenType.split('::');
                const coinData = resource.data as CoinStore;
                
                acc.tokenMap.set(tokenType, {
                    address: tokenAddress,
                    name: tokenName || 'Unknown',
                    balance: coinData.coin?.value || '0',
                    liquidityPools: new Set()
                });
            }
        }
        return acc;
    }, {
        tokenMap: new Map<string, TokenInfo>(),
        resourceMap: new Map<string, MoveResource>()
    });
};
'use client';

import React, { useState, useEffect } from 'react';
import { Accounts } from "./components/Accounts";
import { Resources } from "./components/Resources";
import { Stats } from "./components/Stats";
import { Tokens } from "./components/Tokens";
import { Account, Resource, SortConfig, TokenData } from './types';
import constants from './constants.json';

const REFRESH_INTERVAL = 30000; // 30 seconds
const ASCII_FRAMES = [
  `
  ⚡ Loading Account Data ⚡
  ╔════════════════════╗
  ║ ■░░░░░░░░░░░░░░░░░ ║
  ╚════════════════════╝
  `,
  `
  ⚡ Loading Account Data ⚡
  ╔════════════════════╗
  ║ ■■■░░░░░░░░░░░░░░░ ║
  ╚════════════════════╝
  `,
  `
  ⚡ Loading Account Data ⚡
  ╔════════════════════╗
  ║ ■■■■■░░░░░░░░░░░░░ ║
  ╚════════════════════╝
  `
];

const Home: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>(
    constants.PANCAKESWAP.SWAP_CORE_V2  // Use full address
  );
  const [resources, setResources] = useState<Resource[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [hideUnknown, setHideUnknown] = useState(false);
  const [stats, setStats] = useState({
    totalResources: 0,
    uniqueTokens: 0,
    liquidityPools: 0,
    otherResources: 0,
  });
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [loadingFrame, setLoadingFrame] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const loadAllAnalysisFiles = async () => {
    try {
      setLoadingState('loading');
      
      const response = await fetch('/api/analysis-directories');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analysis directories');
      }
      
      console.log('📂 Found analysis directories:', data);
      
      // Create a map of address to protocol name from constants
      const addressToProtocol = new Map();
      Object.entries(constants).forEach(([protocol, addresses]) => {
        Object.entries(addresses).forEach(([key, address]) => {
          addressToProtocol.set(address.toLowerCase(), `${protocol} - ${key}`);
        });
      });
      
      // Map directories to accounts with protocol labels
      const accounts = data.map((dirInfo: { directory: string, address: string }) => {
        const protocolLabel = addressToProtocol.get(dirInfo.address.toLowerCase()) || 'Unknown Protocol';
        return {
          address: dirInfo.address,
          name: protocolLabel,
          fullPath: `/data/${dirInfo.directory}/analysis.json`
        };
      }).filter(Boolean);

      console.log('📚 Parsed accounts:', accounts);
      
      if (accounts.length === 0) {
        throw new Error('No valid analysis files found');
      }

      setAccounts(accounts);
      const firstAccount = accounts[0].address;
      setSelectedAccount(firstAccount);
      await loadAndDisplayData(firstAccount);

    } catch (error) {
      console.error('❌ Error loading analysis files:', error);
      setLoadingState('error');
      setErrorMessage(
        `Failed to load analysis files: ${error.message}\n` +
        'Please ensure analysis files exist in the public/data directory'
      );
    }
  };

  const formatBalance = (balance: string): string => {
    try {
      const cleanBalance = balance.replace(/,/g, '');
      const rawBalance = BigInt(cleanBalance);
      const formattedBalance = Number(rawBalance) / 1e8;
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }).format(formattedBalance);
    } catch (error) {
      console.error('Error formatting balance:', error);
      return '0.000';
    }
  };

  const loadAndDisplayData = async (address: string) => {
    try {
      // Use the full address
      const currentDate = '2024-11-16';
      
      // Try both formats of the path
      const possiblePaths = [
        `/data/analysis-${address}-${currentDate}/analysis.json`,
        `/data/analysis-0x${address}-${currentDate}/analysis.json`
      ];

      let response = null;
      let successPath = null;

      // Try each path until we find one that works
      for (const path of possiblePaths) {
        try {
          console.log(`🔍 Trying path: ${path}`);
          const attemptResponse = await fetch(path);
          if (attemptResponse.ok) {
            response = attemptResponse;
            successPath = path;
            console.log('✅ Found data at:', path);
            break;
          }
        } catch (err) {
          console.log(`❌ Failed to load from ${path}`);
        }
      }

      if (!response?.ok) {
        throw new Error(
          `Unable to load data for address ${address}. ` +
          `Please ensure the analysis files exist in the public directory at one of these locations:\n` +
          possiblePaths.join('\n')
        );
      }

      const data = await response.json();
      console.log('📊 Raw data:', data);

      // Process the data
      if (data.tokenHoldings) {
        setTokens(data.tokenHoldings.map((token: TokenData) => ({
          token: token.token || 'Unknown Token',
          address: token.address || 'No Address',
          balance: token.balance || '0'
        })));
      }

      if (data.accountResources?.notable) {
        setResources(data.accountResources.notable.map((resourceStr: string) => {
          const parts = resourceStr.split('::');
          return {
            token1: {
              symbol: parts[2] || 'Unknown',
              name: parts[2] || 'Unknown',
              address: parts[0] || null,
            },
            token2: {
              symbol: parts[3] || 'N/A',
              name: parts[3] || 'N/A',
              address: null,
            },
            module: parts[1] || '',
            poolContract: resourceStr,
          };
        }));
      }

      setLoadingState('success');

    } catch (error) {
      console.error('❌ Error loading data:', error);
      setLoadingState('error');
      setErrorMessage(error.message);
    }
  };

  const handleAccountChange = (address: string) => {
    setSelectedAccount(address);
    loadAndDisplayData(address);
  };

  useEffect(() => {
    loadAllAnalysisFiles().then(() => {
      // The selected account will be set by loadAllAnalysisFiles
      // when it finds the first account
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadAndDisplayData(selectedAccount);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedAccount]);

  useEffect(() => {
    if (loadingState === 'loading') {
      const animation = setInterval(() => {
        setLoadingFrame(prev => (prev + 1) % ASCII_FRAMES.length);
      }, 200);
      return () => clearInterval(animation);
    }
  }, [loadingState]);

  return (
    <div className="container">
      {loadingState === 'loading' && (
        <div className="loading-overlay">
          <pre className="loading-animation">
            {ASCII_FRAMES[loadingFrame]}
          </pre>
        </div>
      )}

      {loadingState === 'error' && (
        <div className="error-container">
          <pre>
            {`
            ⚠️ ERROR ⚠️
            ${errorMessage}
            `}
          </pre>
        </div>
      )}

      {loadingState === 'success' && (
        <>
          <Stats {...stats} />
          <Accounts
            accounts={accounts}
            selectedAccount={selectedAccount}
            onAccountChange={handleAccountChange}
          />
          {tokens.length > 0 && (
            <Tokens 
              tokens={tokens}
              formatBalance={formatBalance}
              hideZeroBalances={hideZeroBalances}
              onHideZeroBalancesChange={setHideZeroBalances}
            />
          )}
          {resources.length > 0 && (
            <Resources
              resources={resources}
              hideUnknown={hideUnknown}
              onHideUnknownChange={setHideUnknown}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          )}
        </>
      )}

      <style jsx>{`
        .container {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          min-height: 100vh;
        }
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
        }
        .loading-animation {
          color: #00ff00;
          text-align: center;
          font-family: monospace;
          margin: 0;
          padding: 2rem;
          background: #000;
          border: 1px solid #00ff00;
          border-radius: 10px;
        }
        .error-container {
          color: #ff0000;
          border: 1px solid #ff0000;
          padding: 1rem;
          margin: 1rem 0;
          font-family: monospace;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Home;


import React from 'react';
import { TokensProps } from '../types';

export function Tokens({ 
  tokens, 
  formatBalance, 
  hideZeroBalances, 
  onHideZeroBalancesChange 
}: TokensProps) {
  const filteredTokens = hideZeroBalances 
    ? tokens.filter(token => parseFloat(formatBalance(token.balance)) >= 0.001)
    : tokens;

  const getBalanceDisplay = (balance: string) => {
    const formattedBalance = formatBalance(balance);
    const numBalance = parseFloat(formattedBalance);
    if (numBalance < 0.001) {
      return <span style={{ color: '#666' }}>Low</span>;
    }
    return formattedBalance;
  };

  return (
    <>
      <style jsx>{`
        .panel {
          background: #000;
          border: 1px solid #00ff00;
          padding: 1rem;
          margin: 1rem 0;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        h2 {
          color: #00ff00;
          font-size: 1.2rem;
          margin: 0;
        }

        .toggle-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .toggle-label {
          color: #00ff00;
          font-size: 0.875rem;
          cursor: pointer;
          user-select: none;
        }

        .toggle-switch {
          position: relative;
          width: 48px;
          height: 24px;
          cursor: pointer;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #001100;
          border: 1px solid #00ff00;
          transition: 0.2s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 3px;
          background-color: #00ff00;
          transition: 0.2s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #004400;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .token-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .token-table th {
          text-align: left;
          padding: 0.75rem;
          color: #00ff00;
          border-bottom: 1px solid #00ff00;
          font-weight: 600;
        }

        .token-table td {
          padding: 0.75rem;
          color: #00ff00;
          border-bottom: 1px solid #002200;
        }

        .token-name {
          font-weight: 600;
        }

        .token-address {
          font-family: monospace;
          font-size: 0.875rem;
          word-break: break-all;
        }

        .token-balance {
          font-family: monospace;
          text-align: right;
        }

        tr:hover td {
          background: #001100;
        }

        @media (max-width: 768px) {
          .token-table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }

          .token-address {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>

      <div className="panel">
        <div className="header">
          <h2>Token Holdings</h2>
          <div className="toggle-container">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={hideZeroBalances}
                onChange={(e) => onHideZeroBalancesChange(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              Hide Low Balances
            </span>
          </div>
        </div>
        <table className="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Address</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.map((token, index) => (
              <tr key={index}>
                <td className="token-name">{token.token}</td>
                <td className="token-address">{token.address}</td>
                <td className="token-balance">{getBalanceDisplay(token.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
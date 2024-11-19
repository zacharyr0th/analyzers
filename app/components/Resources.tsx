import React, { useState } from 'react';
import { ResourcesProps } from '../types';

// Helper function to truncate addresses
const truncateAddress = (address: string) => {
  if (address.length > 20) {
    return `${address.slice(0, 20)}...`;
  }
  return address;
};

// Helper function to truncate addresses and type names
const truncateText = (text: string) => {
  if (text.length > 20) {
    return `${text.slice(0, 20)}...`;
  }
  return text;
};

export function Resources({ 
  resources, 
  hideUnknown, 
  onHideUnknownChange,
  sortConfig,
  onSort 
}: ResourcesProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownClick = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const filteredResources = hideUnknown 
    ? resources.filter(item => 
        item.token1.symbol !== 'Unknown' && 
        item.token2.symbol !== 'Unknown')
    : resources;

  if (!resources || resources.length === 0) {
    return (
      <div className="panel">
        <div className="header">
          <h2>Resources</h2>
        </div>
        <div style={{ color: '#00ff00', textAlign: 'center', padding: '2rem' }}>
          No resources found for this account.
        </div>
        <style jsx>{`
          .panel {
            background: #000;
            border: 1px solid #00ff00;
            padding: 1rem;
            margin: 1rem 0;
          }
          .header {
            color: #00ff00;
          }
        `}</style>
      </div>
    );
  }

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

        .resource-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 1rem;
        }

        .resource-table th {
          text-align: left;
          padding: 0.75rem;
          color: #00ff00;
          border-bottom: 1px solid #00ff00;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .resource-table th:hover {
          background: #001100;
        }

        .resource-table td {
          padding: 0.75rem;
          color: #00ff00;
          border-bottom: 1px solid #002200;
        }

        .token-info {
          display: flex;
          flex-direction: column;
        }

        .token-symbol {
          font-weight: 600;
        }

        .token-address {
          font-family: monospace;
          font-size: 0.75rem;
          opacity: 0.8;
          margin-top: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .token-address:hover {
          overflow: visible;
          position: relative;
          background: #001100;
          z-index: 1;
          padding: 2px 4px;
          border-radius: 4px;
          white-space: normal;
          word-break: break-all;
        }

        .module-cell, .pool-contract {
          font-family: monospace;
          font-size: 0.875rem;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .module-cell:hover, .pool-contract:hover {
          overflow: visible;
          position: relative;
          background: #001100;
          z-index: 1;
          padding: 2px 4px;
          border-radius: 4px;
          white-space: normal;
          word-break: break-all;
        }

        .sort-indicator {
          margin-left: 0.5rem;
          display: inline-block;
          transition: transform 0.2s;
        }

        tr:hover td {
          background: #001100;
        }

        @media (max-width: 768px) {
          .resource-table {
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

        .explorer-link {
          color: #00ff00;
          text-decoration: none;
        }

        .explorer-link:hover {
          text-decoration: underline;
        }

        .pool-contract {
          font-family: monospace;
          font-size: 0.875rem;
          cursor: pointer;
          color: #00ff00;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pool-contract:hover {
          overflow: visible;
          position: relative;
          background: #001100;
          z-index: 1;
          padding: 2px 4px;
          border-radius: 4px;
          white-space: normal;
          word-break: break-all;
        }

        .pool-contract:active {
          background: #002200;
        }

        .module-cell {
          font-family: monospace;
          font-size: 0.875rem;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #00ff00;
        }

        .module-cell:hover {
          overflow: visible;
          position: relative;
          background: #001100;
          z-index: 1;
          padding: 2px 4px;
          border-radius: 4px;
          white-space: normal;
          word-break: break-all;
        }

        .address-container {
          position: relative;
        }

        .token-address-trigger {
          cursor: pointer;
          font-family: monospace;
          font-size: 0.75rem;
          opacity: 0.8;
          margin-top: 0.25rem;
        }

        .token-address-trigger:hover {
          text-decoration: underline;
        }

        .address-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #001100;
          border: 1px solid #00ff00;
          padding: 0.5rem;
          border-radius: 4px;
          z-index: 10;
          font-family: monospace;
          font-size: 0.75rem;
          word-break: break-all;
          max-width: 300px;
          box-shadow: 0 2px 4px rgba(0, 255, 0, 0.1);
        }
      `}</style>

      <div className="panel">
        <div className="header">
          <h2>Resources</h2>
          <div className="toggle-container">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={hideUnknown}
                onChange={(e) => onHideUnknownChange(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              Hide Unknown
            </span>
          </div>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th onClick={() => onSort('token1')}>
                Token 1 {sortConfig.key === 'token1' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => onSort('token2')}>
                Token 2 {sortConfig.key === 'token2' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => onSort('module')}>
                Module {sortConfig.key === 'module' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Pool Contract</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map((resource, index) => (
              <tr key={`${resource.token1.address}-${resource.token2.address}-${index}`}>
                <td>
                  <div className="token-info">
                    <span className="token-symbol">{resource.token1.symbol}</span>
                    {resource.token1.address && (
                      <div className="address-container">
                        <span 
                          className="token-address-trigger"
                          onClick={() => handleDropdownClick(`token1-${index}`)}
                        >
                          {truncateAddress(resource.token1.address)}
                        </span>
                        {openDropdown === `token1-${index}` && (
                          <div className="address-dropdown">
                            {resource.token1.address}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="token-info">
                    <span className="token-symbol">{resource.token2.symbol}</span>
                    {resource.token2.address && (
                      <div className="address-container">
                        <span 
                          className="token-address-trigger"
                          onClick={() => handleDropdownClick(`token2-${index}`)}
                        >
                          {truncateAddress(resource.token2.address)}
                        </span>
                        {openDropdown === `token2-${index}` && (
                          <div className="address-dropdown">
                            {resource.token2.address}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="module-cell" title={resource.module}>
                    {truncateText(resource.module)}
                  </span>
                </td>
                <td>
                  <div 
                    className="pool-contract" 
                    title="Click to copy"
                    onClick={() => {
                      navigator.clipboard.writeText(resource.poolContract);
                      const element = event.currentTarget as HTMLElement;
                      const originalText = element.innerText;
                      element.innerText = 'Copied!';
                      setTimeout(() => {
                        element.innerText = originalText;
                      }, 1000);
                    }}
                  >
                    {truncateAddress(resource.poolContract)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
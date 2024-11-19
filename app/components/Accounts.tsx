import React from 'react';
import constants from '../constants.json';

export interface Account {
  address: string;
  name?: string;
}

interface AccountsProps {
  accounts: Account[];
  selectedAccount: string;
  onAccountChange: (address: string) => void;
}

interface ProjectAddress {
  name: string;
  address: string;
}

const getAllAddresses = (accounts: Account[]): ProjectAddress[] => {
  const addressMap = new Map<string, ProjectAddress>();
  
  const analyzedAddresses = accounts.map(account => ({
    address: account.address.toLowerCase().replace('0x', ''),
    shortAddress: account.address.slice(0, 8).toLowerCase().replace('0x', '')
  }));
  
  Object.entries(constants).forEach(([project, values]) => {
    Object.entries(values).forEach(([key, address]) => {
      const addressStr = address as string;
      const cleanAddress = addressStr.toLowerCase().replace('0x', '');
      
      const analyzed = analyzedAddresses.find(a => 
        cleanAddress === a.address || cleanAddress === a.shortAddress
      );
      
      if (analyzed && !addressMap.has(addressStr)) {
        addressMap.set(addressStr, {
          name: `${project} - ${key}`,
          address: addressStr
        });
      }
    });
  });
  
  return Array.from(addressMap.values());
};

export function Accounts({ accounts, selectedAccount, onAccountChange }: AccountsProps) {
  const projectAddresses = getAllAddresses(accounts);

  return (
    <>
      <style jsx>{`
        .panel {
          background: #000;
          border: 1px solid #00ff00;
          padding: 1rem;
          margin: 1rem 0;
        }

        h2 {
          color: #00ff00;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .account-select {
          background: #000;
          color: #00ff00;
          padding: 8px;
          border: 1px solid #00ff00;
          font-family: monospace;
          font-size: 1.2rem;
          width: 100%;
          max-width: 400px;
          cursor: pointer;
        }

        .account-select:hover {
          background: #001100;
        }

        .account-select option {
          background: #000;
          color: #00ff00;
        }

        .selected-address {
          margin-top: 1rem;
        }

        .address-label {
          font-size: 0.875rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
          color: #00ff00;
        }

        .address-value {
          font-family: monospace;
          font-size: 0.875rem;
          word-break: break-all;
          background: #001100;
          padding: 0.5rem;
          border: 1px solid #00ff00;
          color: #00ff00;
          width: 100%;
        }
      `}</style>

      <div className="panel">
        <h2>Account Selection</h2>
        <div className="account-selector">
          <select 
            value={selectedAccount} 
            onChange={(e) => onAccountChange(e.target.value)}
            className="account-select"
          >
            <option value="">Select an account</option>
            {projectAddresses.map((account) => (
              <option key={account.address} value={account.address}>
                {account.name}
              </option>
            ))}
          </select>
          
          <div className="selected-address">
            <p className="address-label">Selected Address:</p>
            <p className="address-value">{selectedAccount}</p>
          </div>
        </div>
      </div>
    </>
  );
}
export interface Account {
    name: string;
    address: string;
    protocol?: string;
  }

export interface Resource {
  token1: {
    symbol: string;
    name: string;
    address?: string;
  };
  token2: {
    symbol: string;
    name: string;
    address?: string;
  };
  module: string;
  poolContract: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface StatsProps {
  totalResources: number;
  uniqueTokens: number;
  liquidityPools: number;
  otherResources: number;
}

export interface AccountsProps {
  accounts: Account[];
  selectedAccount: string;
  onAccountChange: (address: string) => void;
}

export interface ResourcesProps {
  resources: Resource[];
  hideUnknown: boolean;
  onHideUnknownChange: (value: boolean) => void;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export interface TokenData {
  token: string;
  address: string;
  balance: string;
}

export interface TokensProps {
  tokens: TokenData[];
  formatBalance: (balance: string) => string;
  hideZeroBalances: boolean;
  onHideZeroBalancesChange: (checked: boolean) => void;
}
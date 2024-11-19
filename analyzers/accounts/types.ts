import { MoveResource } from "@aptos-labs/ts-sdk";

export interface TokenInfo {
    address: string;
    name: string;
    balance: string;
    liquidityPools: Set<string>;
}

export interface StakingInfo {
    active: boolean;
    amount?: string;
    pool?: string;
}

export interface AnalysisResults {
    tokenMap: Map<string, TokenInfo>;
    resourceMap: Map<string, MoveResource>;
    stakingInfo: StakingInfo;
    timestamp: string;
}
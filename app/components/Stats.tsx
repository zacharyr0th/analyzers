import React from 'react';
import { StatsProps } from '../types';

export function Stats({ totalResources, uniqueTokens, liquidityPools, otherResources }: StatsProps) {
  return (
    <>
      <style jsx>{`
        .stats-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(1, 1fr);
          margin: 1rem 0;
        }

        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .stat-card {
          background: #000;
          border: 1px solid #00ff00;
          padding: 1rem;
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.5rem;
        }

        .stat-title {
          color: #00ff00;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-value {
          color: #00ff00;
          font-size: 1.5rem;
          font-weight: bold;
          font-family: monospace;
        }
      `}</style>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Total Resources</h3>
          </div>
          <div className="stat-value">{totalResources}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Unique Tokens</h3>
          </div>
          <div className="stat-value">{uniqueTokens}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Liquidity Pools</h3>
          </div>
          <div className="stat-value">{liquidityPools}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Other Resources</h3>
          </div>
          <div className="stat-value">{otherResources}</div>
        </div>
      </div>
    </>
  );
}
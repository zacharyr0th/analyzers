import pandas as pd
import numpy as np
from typing import List, Tuple
import matplotlib.pyplot as plt
import seaborn as sns

def load_and_preprocess_data(csv_path: str) -> pd.DataFrame:
    """Load and preprocess data from CSV file."""
    try:
        # Read CSV file directly from path
        df = pd.read_csv(csv_path)
        
        # Clean TVL column - remove $ and commas, convert to float
        df['TVL'] = df['TVL'].replace({'\$': '', ',': ''}, regex=True).astype(float)
        
        return df
    except Exception as e:
        raise Exception(f"Error loading CSV file: {str(e)}")

def analyze_composability(df: pd.DataFrame) -> pd.DataFrame:
    composability = df.groupby(['Category', 'Subcategory']).agg({
        'TVL': 'sum',
        'Protocol': 'count'
    }).reset_index()
    composability.columns = ['Category', 'Subcategory', 'Total_TVL', 'Protocol_Count']
    composability['Avg_TVL'] = composability['Total_TVL'] / composability['Protocol_Count']
    return composability.sort_values('Total_TVL', ascending=False)

def identify_top_protocols(df: pd.DataFrame, n: int = 5) -> pd.DataFrame:
    return df.nlargest(n, 'TVL')[['Protocol', 'Category', 'Subcategory', 'TVL']]

def calculate_yield_potential(composability: pd.DataFrame) -> pd.DataFrame:
    composability['Yield_Potential'] = np.log(composability['Total_TVL']) * composability['Protocol_Count']
    return composability.sort_values('Yield_Potential', ascending=False)

def find_composability_opportunities(composability: pd.DataFrame, threshold: float = 0.5) -> List[Tuple[str, str, str, str, float]]:
    opportunities = []
    for i, row1 in composability.iterrows():
        for j, row2 in composability.iterrows():
            if i != j:
                synergy_score = (row1['Yield_Potential'] + row2['Yield_Potential']) / \
                                (row1['Total_TVL'] + row2['Total_TVL'])
                if synergy_score > threshold:
                    opportunities.append((
                        row1['Category'], row1['Subcategory'],
                        row2['Category'], row2['Subcategory'],
                        synergy_score
                    ))
    return sorted(opportunities, key=lambda x: x[4], reverse=True)

def visualize_composability(composability: pd.DataFrame):
    plt.figure(figsize=(12, 8))
    sns.scatterplot(data=composability, x='Total_TVL', y='Protocol_Count', 
                    size='Yield_Potential', hue='Category', alpha=0.7)
    plt.xscale('log')
    plt.title('DeFi Composability Landscape')
    plt.xlabel('Total TVL (log scale)')
    plt.ylabel('Number of Protocols')
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.show()

def main(csv_path: str):
    df = load_and_preprocess_data(csv_path)
    composability = analyze_composability(df)
    top_protocols = identify_top_protocols(df)
    composability_with_yield = calculate_yield_potential(composability)
    opportunities = find_composability_opportunities(composability_with_yield)

    print("Top 5 Protocols by TVL:")
    print(top_protocols)
    print("\nTop Composability Opportunities:")
    for opp in opportunities[:5]:
        print(f"{opp[0]} ({opp[1]}) + {opp[2]} ({opp[3]}) - Synergy Score: {opp[4]:.2f}")

    visualize_composability(composability_with_yield)

if __name__ == "__main__":
    csv_path = "solana.csv"  # Path to your CSV file
    main(csv_path)
import pandas as pd
import re

def standardize_functions(csv_path):
    # Read the CSV
    df = pd.read_csv(csv_path)
    
    # Create a new dataframe for standardized functions
    functions_df = pd.DataFrame(columns=['Protocol', 'Function', 'Category', 'TVL'])
    
    # Function mapping for standardization
    function_mapping = {
        # Staking related
        r'stake|staking|restake|restaking': 'staking',
        r'liquid\s*stak': 'liquid_staking',
        
        # Trading related
        r'trade|trading|swap': 'trading',
        r'leverage|leveraged': 'leveraged_trading',
        r'perpetual|perps': 'perpetuals_trading',
        r'options|option trading': 'options_trading',
        
        # Yield related
        r'yield\s*farm': 'yield_farming',
        r'liquidity\s*provision|provide\s*liquidity|LP': 'liquidity_provision',
        r'earn\s*yield|yield\s*generation': 'yield_generation',
        
        # Lending related
        r'borrow|lending|lend': 'lending',
        r'margin|margined': 'margin_lending',
        
        # Other
        r'governance': 'governance',
        r'insurance': 'insurance',
        r'launchpad': 'launchpad',
    }
    
    rows = []
    
    for _, row in df.iterrows():
        if pd.isna(row['what can be done today']):
            continue
            
        # Split functions by common delimiters
        functions = re.split(r'[,•\n]', str(row['what can be done today']))
        
        for func in functions:
            func = func.strip().lower()
            if not func:
                continue
                
            # Standardize the function name
            standardized = 'other'
            for pattern, standard in function_mapping.items():
                if re.search(pattern, func, re.IGNORECASE):
                    standardized = standard
                    break
            
            rows.append({
                'Protocol': row['Protocol'],
                'Function': standardized,
                'Category': row['category'],
                'TVL': row['tvl']
            })
    
    functions_df = pd.DataFrame(rows)
    
    # Clean TVL values
    functions_df['TVL'] = functions_df['TVL'].str.replace('$', '').str.replace(',', '').astype(float)
    
    # Add deduplication
    functions_df = functions_df.drop_duplicates()
    
    # Save to CSV
    functions_df.to_csv('function_analysis.csv', index=False)
    
    # Generate summary statistics
    summary = functions_df.groupby('Function').agg({
        'Protocol': 'count',
        'TVL': 'sum'
    }).sort_values('TVL', ascending=False)
    
    summary.columns = ['Number of Protocols', 'Total TVL']
    summary.to_csv('function_summary.csv')
    
    return functions_df, summary

def main():
    csv_path = 'solana.csv'
    functions_df, summary = standardize_functions(csv_path)
    
    print("\nFunction Analysis Summary:")
    print(summary)

if __name__ == "__main__":
    main()
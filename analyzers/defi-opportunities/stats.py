import pandas as pd
import numpy as np
from scipy import stats
import warnings
import logging
warnings.filterwarnings('ignore')

def generate_stats_report(df):
    """Generate statistical analysis report from the DataFrame."""
    try:
        # Create a copy of the DataFrame to avoid modifying the original
        df = df.copy()
        
        # Ensure column names are lowercase
        df.columns = df.columns.str.lower()
        
        stats = {
            'Total Protocols': len(df),
            'Total TVL': df['tvl'].sum(),
            'Average TVL': df['tvl'].mean(),
            'Median TVL': df['tvl'].median(),
            'Categories': df['category'].nunique(),
            'Subcategories': df['subcategory'].nunique(),
            'Functions': df['function'].str.split('\n').explode().nunique()
        }
        
        return stats
    except Exception as e:
        logging.error(f"An error occurred during analysis: {str(e)}")
        logging.error(f"Error occurred with data types: {df.dtypes}")
        raise

def write_stats_report(stats, output_file='defi_stats.md'):
    """Write statistics to markdown file."""
    with open(output_file, 'w') as f:
        f.write('# DeFi Protocol Statistics\n\n')
        
        for key, value in stats.items():
            if isinstance(value, float):
                f.write(f'- **{key}:** {value:,.2f}\n')
            elif isinstance(value, int):
                f.write(f'- **{key}:** {value:,}\n')
            else:
                f.write(f'- **{key}:** {value}\n')
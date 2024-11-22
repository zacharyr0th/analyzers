import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
from seaborn import set_style, color_palette
import logging
from pathlib import Path

# Move logging config to top
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Add configuration constants
CHART_CONFIG = {
    'figsize_large':  (15, 8),
    'figsize_medium': (14, 8),
    'dpi':           300,
    'style':         'fivethirtyeight',
    'colors': {
        'pie':        ['#FF9B9B', '#C4A484', '#90BE6D', '#43AA8B', '#4D908E',
                      '#577590', '#277DA1', '#F94144', '#F3722C', '#F8961E'],
        'histogram':  '#2ecc71'
    }
}

# Add this function before the ChartGenerator class
def millions_formatter(x, pos):
    """Format large numbers into millions (M), billions (B), or trillions (T)"""
    if x >= 1e12:
        return f'${x/1e12:.1f}T'
    elif x >= 1e9:
        return f'${x/1e9:.1f}B'
    elif x >= 1e6:
        return f'${x/1e6:.1f}M'
    elif x >= 1e3:
        return f'${x/1e3:.1f}K'
    return f'${x:.0f}'

class ChartGenerator:
    """Class to handle chart generation with shared configuration"""
    
    def __init__(self, df, output_dir: Path):
        self.df                = df
        self.df['category']    = self.df['category'].astype('category')
        self.output_dir        = output_dir
        self.setup_plot_style()
    
    @staticmethod
    def setup_plot_style():
        """Set consistent style for all charts"""
        plt.style.use(CHART_CONFIG['style'])
        set_style("whitegrid")  # Use specific seaborn function
        plt.rcParams.update({
            'font.size':         12,
            'axes.titlesize':    16,
            'axes.labelsize':    14,
            'figure.facecolor':  'white',
            'axes.facecolor':    'white'
        })
    
    def save_figure(self, filename):
        """Centralized figure saving with consistent parameters"""
        output_path = self.output_dir / filename
        plt.tight_layout()
        plt.savefig(output_path, dpi=CHART_CONFIG['dpi'], 
                   bbox_inches='tight', facecolor='white')
        plt.close()
        return output_path
    
    def create_tvl_distribution_chart(self):
        """Generate standardized TVL distribution histogram"""
        plt.figure(figsize=CHART_CONFIG['figsize_large'])
        
        # Filter and prepare data
        non_zero_tvl = self.df[self.df['tvl'] > 0]['tvl']
        
        # Define standardized bin ranges
        bin_ranges = [
            (0,      1e4,     '$0-10K'),
            (1e4,    1e5,     '$10K-100K'),
            (1e5,    1e6,     '$100K-1M'),
            (1e6,    1e7,     '$1M-10M'),
            (1e7,    1e8,     '$10M-100M'),
            (1e8,    1e9,     '$100M-1B'),
            (1e9,    1e10,    '$1B-10B'),
            (1e10,   float('inf'), '$10B+')
        ]
        
        bins = [range[0] for range in bin_ranges] + [bin_ranges[-1][1]]
        
        # Create histogram with uniform width
        counts, edges, patches = plt.hist(
            non_zero_tvl,
            bins=bins,
            color=CHART_CONFIG['colors']['histogram'],
            alpha=0.7,
            edgecolor='white',
            rwidth=0.85
        )
        
        # Add value labels and percentages
        total_protocols = len(non_zero_tvl)
        for i in range(len(counts)):
            if counts[i] > 0:
                count = int(counts[i])
                percentage = (count / total_protocols) * 100
                plt.text(
                    (edges[i] + edges[i+1])/2,  # x position
                    counts[i],                   # y position
                    f'{count}\n({percentage:.1f}%)',  # label
                    ha='center',
                    va='bottom',
                    fontsize=10
                )
        
        # Customize axes
        plt.gca().set_xscale('log')
        plt.gca().xaxis.set_major_formatter(FuncFormatter(millions_formatter))
        
        # Add custom x-axis labels
        plt.xticks(
            [(range[0] + range[1])/2 for range in bin_ranges[:-1]] + [bin_ranges[-1][0]],
            [range[2] for range in bin_ranges],
            rotation=45,
            ha='right'
        )
        
        # Customize appearance
        plt.title('Distribution of Total Value Locked (TVL) Across Protocols', 
                 pad=20, fontsize=14, fontweight='bold')
        plt.xlabel('Total Value Locked (Log Scale)', labelpad=10)
        plt.ylabel('Number of Protocols', labelpad=10)
        
        # Add grid with reduced opacity
        plt.grid(True, alpha=0.3, axis='y')
        
        # Add summary statistics
        stats_text = (
            f'Total Protocols: {total_protocols:,}\n'
            f'Median TVL: {millions_formatter(non_zero_tvl.median(), None)}\n'
            f'Mean TVL: {millions_formatter(non_zero_tvl.mean(), None)}'
        )
        plt.text(
            0.95, 0.95, stats_text,
            transform=plt.gca().transAxes,
            verticalalignment='top',
            horizontalalignment='right',
            bbox=dict(facecolor='white', alpha=0.8, edgecolor='none')
        )
        
        return self.save_figure('tvl_distribution.png')
    
    def create_top_protocols_chart(self):
        """Generate top protocols bar chart"""
        top_10 = self.df.nlargest(10, 'tvl')
        
        plt.figure(figsize=CHART_CONFIG['figsize_large'])
        bars = plt.bar(top_10['protocol'], top_10['tvl'], 
                      color=color_palette('husl', n_colors=10))  # Use specific seaborn function
        
        plt.title('Top 10 Protocols by Total Value Locked (TVL)')
        plt.xlabel('Protocol')
        plt.ylabel('Total Value Locked')
        plt.grid(True, axis='y', alpha=0.3)
        
        plt.gca().yaxis.set_major_formatter(FuncFormatter(millions_formatter))
        
        # Add value labels
        self._add_bar_labels(bars)
        plt.xticks(rotation=45, ha='right')
        
        return self.save_figure('top_protocols.png')
    
    @staticmethod
    def _add_bar_labels(bars):
        """Helper method to add labels to bars"""
        for bar in bars:
            height = bar.get_height()
            label_position = height * 1.02  # 2% above bar
            plt.text(bar.get_x() + bar.get_width()/2., label_position,
                    millions_formatter(height, None),
                    ha='center', va='bottom', fontsize=10)
    
    def create_category_distribution_chart(self):
        """Generate pie chart showing distribution across categories"""
        category_counts = self.df['category'].value_counts()
        
        plt.figure(figsize=CHART_CONFIG['figsize_medium'])
        plt.pie(category_counts.values, labels=category_counts.index, 
                colors=CHART_CONFIG['colors']['pie'], autopct='%1.1f%%')
        
        plt.title('Distribution of Protocols by Category')
        return self.save_figure('category_distribution.png')

def clean_dataframe(csv_path):
    """Clean and prepare the dataframe"""
    try:
        df = pd.read_csv(csv_path)
        df.columns = df.columns.str.lower()
        
        # Vectorized operation instead of apply
        df['tvl'] = pd.to_numeric(
            df['tvl'].replace(r'[\$,]', '', regex=True),
            errors='coerce'
        ).fillna(0)
        
        return df
    
    except Exception as e:
        logging.error(f"Error processing CSV file {csv_path}: {str(e)}")
        raise

def generate_all_charts(csv_path: Path, output_dir: Path):
    """Main function to generate all charts"""
    try:
        # Create output directory if it doesn't exist
        output_dir.mkdir(parents=True, exist_ok=True)
        
        df = clean_dataframe(csv_path)
        chart_gen = ChartGenerator(df, output_dir)
        
        # Generate all charts and collect their paths
        charts = {}
        
        # Generate TVL distribution chart
        tvl_path = chart_gen.create_tvl_distribution_chart()
        charts['TVL Distribution'] = tvl_path
        
        # Generate top protocols chart
        protocols_path = chart_gen.create_top_protocols_chart()
        charts['Top Protocols'] = protocols_path
        
        # Generate category distribution chart
        category_path = chart_gen.create_category_distribution_chart()
        charts['Category Distribution'] = category_path
        
        logging.info("Successfully generated all charts")
        return charts
        
    except Exception as e:
        logging.error(f"Failed to generate charts: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        generate_all_charts('your_data.csv', Path('output/solana-defi-llama-scraped/charts'))  # Now works with default output_dir
    except Exception as e:
        logging.error(f"Chart generation failed: {str(e)}")

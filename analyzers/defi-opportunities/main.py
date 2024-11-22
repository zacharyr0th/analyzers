# python3.11 -m venv venv
# source venv/bin/activate
# pip install -r requirements.txt
import logging
import sys
from pathlib import Path
from charts import generate_all_charts
from stats import generate_stats_report

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

def main():
    setup_logging()
    logger = logging.getLogger(__name__)
    
    # Configure paths - using relative path from current directory
    base_output_dir = Path('output/solana-defi-llama-scraped')  # Changed to be relative to current directory
    base_output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create subdirectories
    charts_dir = base_output_dir / 'charts'
    charts_dir.mkdir(exist_ok=True)
    
    csv_path = Path('solana.csv')
    if not csv_path.exists():
        logger.error(f"Could not find data file at {csv_path}")
        sys.exit(1)
    
    try:
        # Debug: Print column names
        import pandas as pd
        df = pd.read_csv(str(csv_path))
        logger.info(f"Available columns: {df.columns.tolist()}")
        
        # Clean and prepare the TVL data
        def clean_tvl(tvl_str):
            if isinstance(tvl_str, str):
                return float(tvl_str.replace('$', '').replace(',', ''))
            return 0.0
            
        # Convert column names to lowercase and clean TVL data
        df.columns = df.columns.str.lower()
        df['tvl'] = df['tvl'].apply(clean_tvl)
        
        # Generate markdown content
        logger.info("Generating markdown report...")
        markdown_content = "# DeFi Opportunities Analysis\n\n"
        
        # Add charts section
        markdown_content += "## Charts\n\n"
        charts = generate_all_charts(csv_path, charts_dir)  # Pass Path object directly
        for chart_title, chart_path in charts.items():
            # Use relative path for markdown
            relative_path = Path(chart_path).relative_to(base_output_dir)
            markdown_content += f"### {chart_title}\n"
            markdown_content += f"![{chart_title}]({relative_path})\n\n"
        
        # Add stats section
        logger.info("Adding stats to report...")
        stats = generate_stats_report(df)
        markdown_content += "## Statistics\n\n"
        # Format the stats dictionary into markdown
        for key, value in stats.items():
            if isinstance(value, (int, float)):
                markdown_content += f"- **{key}:** {value:,.2f}\n"
            else:
                markdown_content += f"- **{key}:** {value}\n"
        
        # Save the cleaned CSV
        cleaned_csv_path = base_output_dir / 'cleaned_data.csv'
        df.to_csv(cleaned_csv_path, index=False)
        logger.info(f"Saved cleaned data to {cleaned_csv_path}")
        
        # Write markdown file
        output_path = base_output_dir / 'analysis.md'
        with open(output_path, 'w') as f:
            f.write(markdown_content)
        
        logger.info(f"Analysis complete! Check {output_path} for the report.")
        
    except Exception as e:
        logger.error(f"An error occurred during analysis: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    
    // Read all directories in the data folder
    const items = await fs.readdir(dataDir, { withFileTypes: true });
    
    // Filter for directories that match our pattern and extract full addresses
    const directories = items
      .filter(item => item.isDirectory())
      .map(dir => dir.name)
      .filter(dir => dir.startsWith('analysis-'));

    // Verify each directory has an analysis.json file and extract the full address
    const validDirectories = await Promise.all(
      directories.map(async (dir) => {
        const analysisPath = path.join(dataDir, dir, 'analysis.json');
        try {
          await fs.access(analysisPath);
          // Extract the full address from the directory name
          const match = dir.match(/analysis-(?:0x)?([a-fA-F0-9]+)-\d{4}/);
          if (!match) return null;
          
          return {
            directory: dir,
            address: match[1]  // Keep the full address
          };
        } catch {
          return null;
        }
      })
    );

    const results = validDirectories.filter(Boolean);
    
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No valid analysis files found' },
        { status: 404 }
      );
    }

    console.log('Found directories:', results);
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Failed to read analysis directories:', error);
    return NextResponse.json(
      { error: 'Failed to read directories' }, 
      { status: 500 }
    );
  }
}
import { promises as fs } from 'fs';
import path from 'path';

export async function writeResults(filename: string, mdContent: string, jsonContent: any): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const outputDir = path.join(process.cwd(), 'output');
    const accountId = filename.split('-')[2] || 'unknown';
    const analysisDir = path.join(outputDir, `analysis-${accountId}-${timestamp}`);
    
    try {
        // Create directories if they don't exist
        await fs.mkdir(analysisDir, { recursive: true });

        // Use Promise.all for parallel writes with error handling
        const writeOperations = [
            {
                path: path.join(analysisDir, 'analysis.md'),
                content: mdContent
            },
            {
                path: path.join(analysisDir, 'analysis.json'),
                content: JSON.stringify(jsonContent, null, 2)
            }
        ].map(async ({ path, content }) => {
            try {
                await fs.writeFile(path, content, 'utf8');
            } catch (error) {
                throw new Error(`Failed to write to ${path}: ${(error as Error).message}`);
            }
        });

        await Promise.all(writeOperations);
        console.log(`Analysis written to: ${analysisDir}`);
    } catch (error) {
        console.error('Error writing results:', error);
        throw error;
    }
}
import * as fs from 'fs/promises';
import * as path from 'path';

export async function writeResults(filename: string, content: string): Promise<void> {
    const outputDir = path.join(process.cwd(), 'output');
    const outputPath = path.join(outputDir, filename);

    // Create directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Write the content to file
    await fs.writeFile(outputPath, content);
}

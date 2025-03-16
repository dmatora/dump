import * as fs from 'fs';
import * as path from 'path';

const excludeFiles = [
  '.DS_Store',
  '.next',
  '.git',
  '.gen',
  '.env',
  '.idea',
  'node_modules',
  'package-lock.json',
  'yarn-lock.json',
  'pnpm-lock.yaml',
];
const excludeExtensions = ['.jpg', '.jpeg', '.png', '.ico', '.svg', '.woff2']; // Add more extensions as needed

function dumpFiles(paths: string[], outputFile: string): void {
  try {
    const writeStream = fs.createWriteStream(outputFile);

    paths.forEach((p, index) => {
      const stats = fs.statSync(p);
      if (stats.isDirectory()) {
        writeStream.write(`# Folder: ${p}\n\n`);
        processFolderContents(p, 1, writeStream);
      } else if (stats.isFile()) {
        const fileName = path.basename(p);
        if (excludeFiles.includes(fileName)) return;
        const ext = path.extname(fileName).toLowerCase();
        if (excludeExtensions.includes(ext)) return;
        writeStream.write(`# File: ${p}\n\n`);
        writeStream.write(`\`\`\`\n`);
        const content = fs.readFileSync(p, 'utf8');
        writeStream.write(content);
        writeStream.write(`\n\`\`\`\n\n`);
      }

      if (index < paths.length - 1) {
        writeStream.write('\n');
      }
    });

    writeStream.end();
    console.log(`Files have been dumped to ${outputFile}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function processFolderContents(
  folderPath: string,
  depth: number,
  writeStream: fs.WriteStream
): void {
  const items = fs.readdirSync(folderPath);
  const headerLevel = '#'.repeat(depth + 1); // Starts with ## for depth=1

  items.forEach((item) => {
    if (excludeFiles.includes(item)) return;
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      writeStream.write(`${headerLevel} ${item}\n\n`);
      processFolderContents(itemPath, depth + 1, writeStream);
    } else if (stats.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (excludeExtensions.includes(ext)) return;
      writeStream.write(`${headerLevel} ${item}\n\n`);
      writeStream.write(`\`\`\`\n`);
      const content = fs.readFileSync(itemPath, 'utf8');
      writeStream.write(content);
      writeStream.write(`\n\`\`\`\n\n`);
    }
  });
}

// Example usage
const paths = ['src'];
const outputFile = 'project_files.md';
dumpFiles(paths, outputFile);

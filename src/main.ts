import * as fs from 'fs';
import * as path from 'path';

const excludeFiles = [
  '.DS_Store',
  '.next',
  '.git',
  '.idea',
  'node_modules',
  'package-lock.json',
  'yarn-lock.json',
];
const excludeExtensions = ['.jpg', '.jpeg', '.png', '.ico', '.svg']; // Add more extensions as needed

function dumpFiles(folderPaths: string[], outputFile: string): void {
  try {
    const writeStream = fs.createWriteStream(outputFile);

    function processFolder(folderPath: string, indent = ''): void {
      writeStream.write(`${indent}# Folder: ${folderPath}\n\n`);

      const items = fs.readdirSync(folderPath);

      items.forEach((item, index) => {
        if (excludeFiles.includes(item)) return;
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          processFolder(itemPath, indent + '  ');
        } else if (stats.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (excludeExtensions.includes(ext)) return;
          writeStream.write(`${indent}## ${item}\n\n`);
          writeStream.write(`${indent}\`\`\`\n`);
          const content = fs.readFileSync(itemPath, 'utf8');
          writeStream.write(content);
          writeStream.write(`\n${indent}\`\`\`\n\n`);

          if (index < items.length - 1) {
            writeStream.write('\n');
          }
        }
      });
    }

    folderPaths.forEach((folderPath, folderIndex) => {
      processFolder(folderPath);

      if (folderIndex < folderPaths.length - 1) {
        writeStream.write('\n');
      }
    });

    writeStream.end();
    console.log(`Files have been dumped to ${outputFile}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

const folderPaths = ['src'];
const outputFile = 'project_files.md';
dumpFiles(folderPaths, outputFile);

import * as fs from 'fs';
import * as path from 'path';

const excludeFiles = [
  '.DS_Store',
  '.next',
  '.nx',
  '.git',
  '.gen',
  '.env',
  '.idea',
  '.vscode',
  '.yarn',
  'dist',
  'update.sh',
  'node_modules',
  'package-lock.json',
  'yarn-lock.json',
  'pnpm-lock.yaml',
  'composer.lock',
];
const excludeExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.ico',
  '.avif',
  '.webp',
  '.bcmap',
  '.svg',
  '.ttf',
  '.woff',
  '.woff2',
  '.eot',
  '.mp3',
  '.zip',
  '.db',
];

interface OutputFile {
  stream: fs.WriteStream;
  size: number;
  index: number;
  filename: string;
}

function dumpFiles(
  paths: string[],
  outputFile: string,
  maxTokens?: number
): void {
  try {
    const maxFileSize = maxTokens || Infinity;
    let currentFile = createNewOutputFile(outputFile, 0);

    paths.forEach((p, index) => {
      const stats = fs.statSync(p);
      if (stats.isDirectory()) {
        const folderHeader = `# Folder: ${p}\n\n`;
        currentFile = writeWithSizeCheck(
          currentFile,
          folderHeader,
          outputFile,
          maxFileSize
        );
        currentFile = processFolderContents(
          p,
          1,
          currentFile,
          outputFile,
          maxFileSize
        );
      } else if (stats.isFile()) {
        const fileName = path.basename(p);
        if (excludeFiles.includes(fileName)) return;
        const ext = path.extname(fileName).toLowerCase();
        if (excludeExtensions.includes(ext)) return;

        const fileHeader = `# File: ${p}\n\n`;
        const content = fs.readFileSync(p, 'utf8');
        const fileContent = `\`\`\`\n${content}\n\`\`\`\n\n`;
        const totalContent = fileHeader + fileContent;

        currentFile = writeWithSizeCheck(
          currentFile,
          totalContent,
          outputFile,
          maxFileSize
        );
      }

      if (index < paths.length - 1) {
        currentFile = writeWithSizeCheck(
          currentFile,
          '\n',
          outputFile,
          maxFileSize
        );
      }
    });

    currentFile.stream.end();

    const totalFiles = currentFile.index + 1;
    console.log(`Files have been dumped to ${totalFiles} file(s):`);
    for (let i = 0; i <= currentFile.index; i++) {
      const filename = getOutputFileName(outputFile, i);
      const stats = fs.statSync(filename);
      console.log(`  ${filename} (${Math.round(stats.size / 1024)}KB)`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function getOutputFileName(baseOutputFile: string, index: number): string {
  if (index === 0) return baseOutputFile;

  const ext = path.extname(baseOutputFile);
  const baseName = path.basename(baseOutputFile, ext);
  const dir = path.dirname(baseOutputFile);

  return path.join(dir, `${baseName}_part${index + 1}${ext}`);
}

function createNewOutputFile(
  baseOutputFile: string,
  index: number
): OutputFile {
  const filename = getOutputFileName(baseOutputFile, index);
  const stream = fs.createWriteStream(filename);

  console.log(`Creating output file: ${filename}`);

  return {
    stream,
    size: 0,
    index,
    filename,
  };
}

function writeWithSizeCheck(
  currentFile: OutputFile,
  content: string,
  baseOutputFile: string,
  maxFileSize: number
): OutputFile {
  const contentSize = Buffer.byteLength(content, 'utf8');

  // If adding this content would exceed the limit and we already have content,
  // start a new file. We don't split individual files across multiple outputs.
  if (currentFile.size + contentSize > maxFileSize && currentFile.size > 0) {
    console.log(
      `File ${currentFile.filename} reached size limit (${Math.round(
        currentFile.size / 1024
      )}KB), starting new file...`
    );
    currentFile.stream.end();
    currentFile = createNewOutputFile(baseOutputFile, currentFile.index + 1);
  }

  currentFile.stream.write(content);
  currentFile.size += contentSize;

  return currentFile;
}

function processFolderContents(
  folderPath: string,
  depth: number,
  currentFile: OutputFile,
  baseOutputFile: string,
  maxFileSize: number
): OutputFile {
  const items = fs.readdirSync(folderPath);
  const headerLevel = '#'.repeat(depth + 1);

  items.forEach((item) => {
    if (excludeFiles.includes(item)) return;
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      const dirHeader = `${headerLevel} ${item}\n\n`;
      currentFile = writeWithSizeCheck(
        currentFile,
        dirHeader,
        baseOutputFile,
        maxFileSize
      );
      currentFile = processFolderContents(
        itemPath,
        depth + 1,
        currentFile,
        baseOutputFile,
        maxFileSize
      );
    } else if (stats.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (excludeExtensions.includes(ext)) return;

      const fileHeader = `${headerLevel} ${item}\n\n`;
      const content = fs.readFileSync(itemPath, 'utf8');
      const fileContent = `\`\`\`\n${content}\n\`\`\`\n\n`;
      const totalContent = fileHeader + fileContent;

      currentFile = writeWithSizeCheck(
        currentFile,
        totalContent,
        baseOutputFile,
        maxFileSize
      );
    }
  });

  return currentFile;
}

// Example usage
const paths = ['src'];
const outputFile = 'project_files.md';
const maxTokens = 5000000; // 900K characters limit

dumpFiles(paths, outputFile, maxTokens);

# Code-to-LLM Formatter

A lightweight TypeScript utility that transforms your codebase into LLM-friendly Markdown documentation. Perfect for code analysis, review, and improvement workflows with AI language models.

## 🚀 Features

- Generates structured Markdown documentation of your codebase
- Preserves full directory hierarchy
- Maintains code formatting and syntax
- Creates LLM-optimized context for code analysis
- Works with any programming language or framework
- Zero external dependencies for core functionality

## 📋 Installation

```bash
git clone https://github.com/dmatora/dump
cd dump
npm install
```

## 🔧 Usage

1. Configure your paths in `src/main.ts`:
```typescript
const folderPaths = ['src']; // Add multiple paths as needed
const outputFile = 'project_files.md';
```

2. Run the script:
```bash
npm run start
```

This will generate a `project_files.md` file containing your codebase in LLM-friendly format.

## 💡 Use Cases

- Code review and analysis with AI
- Getting AI suggestions for improvements and refactoring
- Documentation generation
- Codebase snapshots for version comparison
- Sharing code context with AI tools

## 🔍 Why Use This?

- **Direct Control**: You decide exactly what context to feed to the LLM
- **Transparency**: No black box intermediary making decisions
- **Speed**: Faster than complex automated tools
- **Flexibility**: Works with any codebase structure
- **Cost-Efficient**: Optimized for LLM token usage

## 🛠️ Configuration Examples

```typescript
// Single directory
const folderPaths = ['src'];

// Multiple directories
const folderPaths = [
    'apps/frontend/src',
    'apps/backend/src',
    'libs/shared/src'
];

// Specific project paths
const folderPaths = [
    'apps/your-app/src',
    'libs/core/src'
];
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## 📄 License

MIT

## ⭐ Support

If you find this tool useful, please consider giving it a star on GitHub!

const dirTree = require('directory-tree');
const path = require('path');
const fs = require('fs').promises;

async function detectProject(options) {
    console.log('\n🔍 Starting Smart Project Analysis...\n');

    try {
        const projectPath = process.cwd();
        
        // Get project structure
        const structure = dirTree(projectPath, {
            exclude: /node_modules|\.git|dist|build|\.next/
        });

        // Analyze project
        const analysis = await analyzeProject(projectPath);

        // Display Results
        displayAnalysis(analysis, structure);

        return analysis;

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function analyzeProject(projectPath) {
    const analysis = {
        type: 'Unknown',
        framework: 'Unknown',
        language: 'Unknown',
        dependencies: [],
        devDependencies: [],
        scripts: {},
        features: [],
        purpose: ''
    };

    try {
        const pkgPath = path.join(projectPath, 'package.json');
        const pkg = require(pkgPath);
        
        analysis.name = pkg.name;
        analysis.version = pkg.version;
        analysis.dependencies = Object.keys(pkg.dependencies || {});
        analysis.devDependencies = Object.keys(pkg.devDependencies || {});
        analysis.scripts = pkg.scripts || {};

        // Enhanced CLI Tool detection
        if (analysis.dependencies.includes('commander')) {
            analysis.type = 'CLI Tool';
            analysis.framework = 'Commander.js';
            analysis.features.push('Command Line Interface');
            
            // Check for specific features
            if (analysis.dependencies.includes('inquirer')) {
                analysis.features.push('Interactive Command Prompts');
            }
            if (analysis.dependencies.includes('simple-git')) {
                analysis.features.push('Git Integration');
            }
        }

        // Analyze commands directory
        const commandsPath = path.join(projectPath, 'src', 'commands');
        try {
            const commandFiles = await fs.readdir(commandsPath);
            analysis.features.push(`Multiple Commands: ${commandFiles.length} commands`);
            
            // Add specific command features
            commandFiles.forEach(file => {
                const command = file.replace('.js', '');
                analysis.features.push(`Command: ${command}`);
            });
        } catch (e) {
            // Commands directory not found
        }

        // Check for documentation features
        if (await fileExists(path.join(projectPath, '.docliteignore'))) {
            analysis.features.push('Custom Ignore Patterns');
        }
        if (await fileExists(path.join(projectPath, '.docliterc.json'))) {
            analysis.features.push('Configurable Settings');
        }

        // Set purpose based on package name and features
        if (analysis.name.includes('doclite')) {
            analysis.purpose = 'Documentation Generation Tool';
        }

        analysis.language = 'JavaScript/Node.js';

    } catch (e) {
        console.error('Error analyzing package.json:', e.message);
    }

    return analysis;
}

function displayAnalysis(analysis, structure) {
    console.log('\n📊 Project Analysis:');
    console.log('------------------');
    console.log(`Name: ${analysis.name || 'Unknown'}`);
    console.log(`Version: ${analysis.version || 'Unknown'}`);
    console.log(`Type: ${analysis.type}`);
    console.log(`Framework: ${analysis.framework}`);
    console.log(`Language: ${analysis.language}`);
    if (analysis.purpose) {
        console.log(`Purpose: ${analysis.purpose}`);
    }
    
    console.log('\n🎯 Detected Features:');
    analysis.features.forEach(feature => {
        console.log(`- ${feature}`);
    });

    console.log('\n📦 Core Dependencies:');
    ['commander', 'inquirer', 'simple-git', 'directory-tree'].forEach(dep => {
        if (analysis.dependencies.includes(dep)) {
            console.log(`- ${dep} (Core feature)`);
        }
    });

    console.log('\n📜 Available Scripts:');
    Object.entries(analysis.scripts).forEach(([name, script]) => {
        console.log(`- ${name}: ${script}`);
    });

    console.log('\n📂 Project Structure:');
    displayStructure(filterSensitiveFiles(structure.children), 0);
}

function filterSensitiveFiles(items) {
    if (!items) return [];
    return items.filter(item => {
        const sensitivePatterns = ['secret', 'password', 'private'];
        return !sensitivePatterns.some(pattern => 
            item.name.toLowerCase().includes(pattern)
        );
    });
}

function displayStructure(items, level) {
    if (!items) return;
    items.forEach(item => {
        console.log(`${'  '.repeat(level)}${item.name}`);
        if (item.children) {
            displayStructure(item.children, level + 1);
        }
    });
}

module.exports = { detectProject };
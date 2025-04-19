const fs = require('fs').promises;
const dirTree = require('directory-tree');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const inquirer = require('inquirer');
const axios = require('axios');
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Helper function for file existence check
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Main detection function
async function detectProject(options) {
    console.log('\n🔍 Starting Smart Project Analysis...\n');

    try {
        const projectPath = process.cwd();
        let selectedPath = [];
        
        if (typeof options.include === 'string') {
            selectedPath = options.include.split(',').map(p => p.trim());
        } else {
            // Interactive picker using inquirer (checkbox style)
            const allFiles = await fs.readdir(projectPath);
            const choices = allFiles.filter(f => !['node_modules', '.git', 'dist', 'build', '.next'].includes(f))
                .map(f => ({ name: f, checked: false })); // show as unchecked by default
        
            const answer = await inquirer.default.prompt([{
                type: 'checkbox',
                name: 'files',
                message: 'Select files/folders to scan with AI (use space to select, arrows to move):',
                choices
            }]);
            selectedPath = answer.files;
        }
        for (const relPath of selectedPath) {
            const absPath = path.join(projectPath, relPath);
            const stat = await fs.stat(absPath);
            if (stat.isFile()) {
                const fileContent = (await fs.readFile(absPath, 'utf-8')).split('\n').slice(0, 200).join('\n');                console.log(`\n🧠 Analyzing ${relPath} with Ollama...`);
const features = await getOpenAIFeatures(fileContent, 'gpt-3.5-turbo');                
console.log(`\n🔎 Features detected in ${relPath}:\n${features}`);
            } else {
                console.log(`\n📁 Skipping folder: ${relPath} (folder analysis coming soon)`);
            }
        }
        
        // Get project structure
        const structure = dirTree(projectPath, {
            exclude: /node_modules|\.git|dist|build|\.next/
        });

        // Analyze project
        const analysis = await analyzeProject(projectPath);

        // Get additional metrics
        analysis.coverage = await analyzeCoverage(projectPath);
        analysis.dependencies = await analyzeDependencies(projectPath);
        analysis.buildStatus = await analyzeBuildStatus(projectPath);
        analysis.metrics = await analyzeCodeMetrics(projectPath);

        // Display Results
        displayAnalysis(analysis, structure);

        return analysis;

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getOpenAIFeatures(fileContent, model = 'gpt-3.5-turbo') {
  try {
    const prompt = `
You are an expert software engineer. Analyze the following JavaScript code and list the main features and capabilities it provides.
Respond in bullet points. For example:

- Provides a CLI interface for project management
- Supports command parsing and options
- Integrates with Git for commit history

CODE:
${fileContent}
    `;
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.2,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    return `Error querying OpenAI: ${error.message}`;
  }
}

// Project analysis function
async function analyzeProject(projectPath) {
    const analysis = {
        type: 'Unknown',
        framework: 'Unknown',
        language: 'JavaScript/Node.js',
        dependencies: [],
        devDependencies: [],
        scripts: {},
        features: [],
        purpose: '',
        coverage: null,
        buildStatus: null,
        metrics: {},
        dependencyHealth: null
    };

    try {
        const pkgPath = path.join(projectPath, 'package.json');
        const pkg = require(pkgPath);
        
        // Basic info
        analysis.name = pkg.name;
        analysis.version = pkg.version;
        analysis.dependencies = Object.keys(pkg.dependencies || {});
        analysis.devDependencies = Object.keys(pkg.devDependencies || {});
        analysis.scripts = pkg.scripts || {};

        // CLI Tool detection
        if (analysis.dependencies.includes('commander')) {
            analysis.type = 'CLI Tool';
            analysis.framework = 'Commander.js';
            analysis.features.push('Command Line Interface');
            
            if (analysis.dependencies.includes('inquirer')) {
                analysis.features.push('Interactive Command Prompts');
            }
            if (analysis.dependencies.includes('simple-git')) {
                analysis.features.push('Git Integration');
            }
        }

        // Framework detection
        if (analysis.dependencies.includes('react')) {
            analysis.framework = 'React';
            analysis.type = 'Frontend Application';
        } else if (analysis.dependencies.includes('express')) {
            analysis.framework = 'Express.js';
            analysis.type = 'Backend API';
        } else if (analysis.dependencies.includes('vue')) {
            analysis.framework = 'Vue.js';
            analysis.type = 'Frontend Application';
        }

        // Testing Framework detection
        if (analysis.devDependencies.includes('jest')) {
            analysis.features.push('Jest Testing Framework');
        } else if (analysis.devDependencies.includes('mocha')) {
            analysis.features.push('Mocha Testing Framework');
        }

        // CI/CD detection
        if (await fileExists(path.join(projectPath, '.github/workflows'))) {
            analysis.features.push('GitHub Actions CI/CD');
        } else if (await fileExists(path.join(projectPath, '.travis.yml'))) {
            analysis.features.push('Travis CI Integration');
        }

        // Documentation features
        if (await fileExists(path.join(projectPath, '.docliteignore'))) {
            analysis.features.push('Custom Ignore Patterns');
        }
        if (await fileExists(path.join(projectPath, '.docliterc.json'))) {
            analysis.features.push('Configurable Settings');
        }

    } catch (error) {
        console.error('Error analyzing package.json:', error.message);
    }

    return analysis;
}

// Coverage analysis
async function analyzeCoverage(projectPath) {
    try {
        const coverageFiles = [
            'coverage/lcov-report/index.html',
            'coverage/coverage-final.json',
            '.nyc_output/coverage.json'
        ];

        for (const file of coverageFiles) {
            const coveragePath = path.join(projectPath, file);
            if (await fileExists(coveragePath)) {
                const coverage = await fs.readFile(coveragePath, 'utf8');
                if (file.endsWith('.json')) {
                    const coverageData = JSON.parse(coverage);
                    return {
                        lines: coverageData.total.lines.pct,
                        statements: coverageData.total.statements.pct,
                        functions: coverageData.total.functions.pct,
                        branches: coverageData.total.branches.pct
                    };
                }
            }
        }
    } catch (error) {
        console.warn('⚠️  Could not analyze code coverage');
    }
    return null;
}

// Dependencies analysis
async function analyzeDependencies(projectPath) {
    try {
        const health = {
            outdated: [],
            vulnerable: [],
            deprecated: []
        };

        try {
            const { stdout } = await execPromise('npm outdated --json');
            if (stdout) {
                const outdated = JSON.parse(stdout);
                health.outdated = Object.keys(outdated);
            }
        } catch (e) {}

        try {
            const { stdout: auditOutput } = await execPromise('npm audit --json');
            if (auditOutput) {
                const audit = JSON.parse(auditOutput);
                health.vulnerable = Object.keys(audit.vulnerabilities || {});
            }
        } catch (e) {}

        return health;
    } catch (error) {
        console.warn('⚠️  Could not analyze dependencies');
        return null;
    }
}

// Build status analysis
async function analyzeBuildStatus(projectPath) {
    try {
        const indicators = {
            lastBuild: null,
            buildScript: null,
            ciStatus: null
        };

        const buildDirs = ['build', 'dist', 'out'];
        for (const dir of buildDirs) {
            const buildPath = path.join(projectPath, dir);
            if (await fileExists(buildPath)) {
                const stats = await fs.stat(buildPath);
                indicators.lastBuild = stats.mtime;
                break;
            }
        }

        const ciFiles = ['.github/workflows/main.yml', '.travis.yml', 'circle.yml'];
        for (const file of ciFiles) {
            if (await fileExists(path.join(projectPath, file))) {
                indicators.ciStatus = 'CI Configured';
                break;
            }
        }

        return indicators;
    } catch (error) {
        console.warn('⚠️  Could not analyze build status');
        return null;
    }
}

// Code metrics analysis
async function analyzeCodeMetrics(projectPath) {
    try {
        const metrics = {
            totalFiles: 0,
            totalLines: 0,
            sourceFiles: 0,
            testFiles: 0
        };

        async function countLines(filePath) {
            const content = await fs.readFile(filePath, 'utf8');
            return content.split('\n').length;
        }

        async function analyzeDirectory(dirPath) {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory() && !entry.name.match(/node_modules|\.git|dist/)) {
                    await analyzeDirectory(fullPath);
                } else if (entry.isFile() && entry.name.match(/\.(js|jsx|ts|tsx)$/)) {
                    metrics.totalFiles++;
                    metrics.totalLines += await countLines(fullPath);
                    
                    if (entry.name.includes('.test.') || entry.name.includes('.spec.')) {
                        metrics.testFiles++;
                    } else {
                        metrics.sourceFiles++;
                    }
                }
            }
        }

        await analyzeDirectory(projectPath);
        return metrics;

    } catch (error) {
        console.warn('⚠️  Could not analyze code metrics');
        return null;
    }
}

function displayAnalysis(analysis, structure) {
    console.log('\n📊 Project Analysis:');
    console.log('------------------');
    console.log(`Name: ${analysis.name || 'Unknown'}`);
    console.log(`Version: ${analysis.version || 'Unknown'}`);
    console.log(`Type: ${analysis.type}`);
    console.log(`Framework: ${analysis.framework}`);
    console.log(`Language: ${analysis.language}`);
    
    console.log('\n🎯 Detected Features:');
    if (Array.isArray(analysis.features)) {
        analysis.features.forEach(feature => {
            console.log(`- ${feature}`);
        });
    }

    // Fixed Core Dependencies display
    console.log('\n📦 Core Dependencies:');
    const coreDeps = ['commander', 'inquirer', 'simple-git', 'directory-tree'];
    if (Array.isArray(analysis.dependencies)) {
        const foundDeps = coreDeps.filter(dep => analysis.dependencies.includes(dep));
        if (foundDeps.length > 0) {
            foundDeps.forEach(dep => {
                console.log(`- ${dep} (Core feature)`);
            });
        } else {
            console.log('No core dependencies found');
        }
    } else {
        console.log('No dependencies information available');
    }

    console.log('\n📜 Available Scripts:');
    if (analysis.scripts && typeof analysis.scripts === 'object') {
        Object.entries(analysis.scripts).forEach(([name, script]) => {
            console.log(`- ${name}: ${script}`);
        });
    } else {
        console.log('No scripts found');
    }

    if (analysis.coverage) {
        console.log('\n📊 Code Coverage:');
        console.log(`- Lines: ${analysis.coverage.lines}%`);
        console.log(`- Statements: ${analysis.coverage.statements}%`);
        console.log(`- Functions: ${analysis.coverage.functions}%`);
        console.log(`- Branches: ${analysis.coverage.branches}%`);
    }

    if (analysis.dependencies) {
        console.log('\n🏥 Dependency Health:');
        console.log(`- Outdated: ${analysis.dependencies.outdated?.length || 0}`);
        console.log(`- Vulnerable: ${analysis.dependencies.vulnerable?.length || 0}`);
        console.log(`- Deprecated: ${analysis.dependencies.deprecated?.length || 0}`);
    }

    if (analysis.buildStatus) {
        console.log('\n🏗️  Build Status:');
        console.log(`- Last Build: ${analysis.buildStatus.lastBuild || 'Unknown'}`);
        console.log(`- CI Status: ${analysis.buildStatus.ciStatus || 'Not Configured'}`);
    }

    if (analysis.metrics) {
        console.log('\n📈 Code Metrics:');
        console.log(`- Total Files: ${analysis.metrics.totalFiles || 0}`);
        console.log(`- Source Files: ${analysis.metrics.sourceFiles || 0}`);
        console.log(`- Test Files: ${analysis.metrics.testFiles || 0}`);
        console.log(`- Total Lines: ${analysis.metrics.totalLines || 0}`);
    }

    console.log('\n📂 Project Structure:');
    if (structure && structure.children) {
        displayStructure(filterSensitiveFiles(structure.children), 0);
    } else {
        console.log('No structure information available');
    }
}

// Helper function to filter sensitive files
function filterSensitiveFiles(items) {
    if (!items) return [];
    return items.filter(item => {
        const sensitivePatterns = ['secret', 'password', 'private'];
        return !sensitivePatterns.some(pattern => 
            item.name.toLowerCase().includes(pattern)
        );
    });
}

// Helper function to display structure
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
// src/commands/setup.js
const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');
const { detectProject } = require('./detect');

async function setupCommand(options = {}) {
    console.log('\n🔧 Setting up Doclite configuration...\n');

    try {
        // 1. Run detection first to understand the project
        const projectAnalysis = await detectProject(options);

        // 2. Get user preferences through interactive prompts
        const config = await promptConfiguration(projectAnalysis);

        // 3. Create configuration file
        await createConfigFile(config);

        // 4. Set up documentation directory
        await setupDocDirectory(config);

        console.log('\n✅ Doclite setup completed successfully!');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    }
}

async function promptConfiguration(projectAnalysis) {
    const questions = [
        {
            type: 'input',
            name: 'outputDir',
            message: 'Where should documentation be generated?',
            default: 'docs'
        },
        {
            type: 'checkbox',
            name: 'sections',
            message: 'Select sections to include in documentation:',
            choices: [
                { name: 'Project Overview', checked: true },
                { name: 'Installation', checked: true },
                { name: 'Usage', checked: true },
                { name: 'API Reference', checked: projectAnalysis.type === 'API' },
                { name: 'Commands', checked: projectAnalysis.type === 'CLI Tool' },
                { name: 'Configuration', checked: true },
                { name: 'Contributing', checked: true },
                { name: 'License', checked: true }
            ]
        },
        {
            type: 'list',
            name: 'template',
            message: 'Choose a documentation template:',
            choices: [
                'Standard',
                'Minimal',
                'Detailed',
                'Custom'
            ],
            default: 'Standard'
        },
        {
            type: 'confirm',
            name: 'autoGenerate',
            message: 'Enable automatic documentation generation on commit?',
            default: false
        }
    ];

    return inquirer.default.prompt(questions);
}

async function createConfigFile(config) {
    const configContent = {
        ...config,
        version: '2.0.0',
        timestamp: new Date().toISOString()
    };

    const configPath = path.join(process.cwd(), 'doclite.config.json');
    await fs.writeFile(
        configPath,
        JSON.stringify(configContent, null, 2)
    );

    console.log('\n📝 Created configuration file:', configPath);
}

async function setupDocDirectory(config) {
    const docDir = path.join(process.cwd(), config.outputDir);
    
    try {
        await fs.mkdir(docDir, { recursive: true });
        
        // Create basic structure
        const directories = ['assets', 'templates', 'generated'];
        for (const dir of directories) {
            await fs.mkdir(path.join(docDir, dir), { recursive: true });
        }

        // Create placeholder README if it doesn't exist
        const readmePath = path.join(process.cwd(), 'README.md');
        if (!await fileExists(readmePath)) {
            const projectName = path.basename(process.cwd());
            await fs.writeFile(
                readmePath,
                `# ${projectName}\n\nDocumentation will be generated here.`
            );
        }

        console.log(`\n📁 Created documentation directory: ${config.outputDir}`);
    } catch (error) {
        throw new Error(`Failed to setup documentation directory: ${error.message}`);
    }
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

module.exports = { setupCommand };
// src/commands/generate.js
const fs = require('fs').promises;
const path = require('path');
const { detectProject } = require('./detect');
const handlebars = require('handlebars');
const simpleGit = require('simple-git');

async function generateCommand(options = {}) {
    console.log('\n📝 Generating Documentation...\n');

    try {
        // 1. Load configuration
        const config = await loadConfig();

        // 2. Get project analysis
        const projectInfo = await detectProject({ quiet: true });

        // 3. Get Git history
        const commitCount = options.commits || 5;
        const gitHistory = await getGitHistory(commitCount);
        projectInfo.gitHistory = gitHistory;
        projectInfo.commitCount = commitCount;

        // 4. Load appropriate template
        const template = await loadTemplate(config.template);

        // 5. Generate documentation
        const documentation = await generateDocs(template, {
            project: projectInfo,
            config: config,
            timestamp: new Date().toISOString(),
            gitHistory: gitHistory,
            commitCount: commitCount
        });

        // 6. Save documentation
        await saveDocs(documentation, config);

        console.log('\n✨ Documentation generated successfully!');

    } catch (error) {
        console.error('❌ Generation failed:', error.message);
    }
}

async function getGitHistory(requestedCount = 5) {
    try {
        const git = simpleGit();
        const isRepo = await git.checkIsRepo();
        
        if (!isRepo) {
            console.log('⚠️  Not a Git repository');
            return [];
        }

        const log = await git.log({ n: requestedCount });
        console.log(`📜 Found ${log.all.length} commits`);
        
        return log.all.map(commit => ({
            hash: commit.hash.substring(0, 7),
            date: new Date(commit.date).toLocaleDateString('en-CA'),
            message: commit.message,
            author: commit.author_name
        }));
    } catch (error) {
        console.warn('⚠️  Could not fetch Git history:', error.message);
        return [];
    }
}

async function loadConfig() {
    try {
        const configPath = path.join(process.cwd(), 'doclite.config.json');
        const configFile = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configFile);
        
        // Set default template if not specified
        if (!config.template) {
            config.template = 'standard';
        }
        
        return config;
    } catch (error) {
        console.log('⚠️  No configuration found. Running setup...');
        const { setupCommand } = require('./setup');
        return setupCommand({ yes: true });
    }
}

async function loadTemplate(templateName) {
    const templatesDir = path.join(__dirname, '../templates');
    const templatePath = path.join(templatesDir, `${templateName.toLowerCase()}.md`);

    try {
        return await fs.readFile(templatePath, 'utf8');
    } catch (error) {
        console.log(`⚠️  Template '${templateName}' not found, using standard template.`);
        return await fs.readFile(path.join(templatesDir, 'standard.md'), 'utf8');
    }
}

async function generateDocs(template, data) {
    // Register custom handlebars helpers
    handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    handlebars.registerHelper('formatList', function(items) {
        if (!items || !items.length) return '';
        return items.map(item => `- ${item}`).join('\n');
    });

    handlebars.registerHelper('formatGitHistory', function(commits) {
        if (!commits || !commits.length) return '*No Git history available*';
        return commits.map(commit => 
            `- ${commit.hash} (${commit.date}): ${commit.message} [${commit.author}]`
        ).join('\n');
    });

    // Compile and render template
    const compile = handlebars.compile(template);
    return compile(data);
}

async function saveDocs(documentation, config) {
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), config.outputDir);
    await fs.mkdir(outputDir, { recursive: true });

    // Save main README
    await fs.writeFile(
        path.join(process.cwd(), 'README.md'),
        documentation
    );

    // Save timestamped copy in docs directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
        path.join(outputDir, `README-${timestamp}.md`),
        documentation
    );

    // Generate additional documentation sections if configured
    if (config.sections.includes('API Reference')) {
        await generateApiDocs(config);
    }
    if (config.sections.includes('Commands')) {
        await generateCommandDocs(config);
    }
}

async function generateApiDocs(config) {
    // Placeholder for API documentation generation
    console.log('📚 Generating API documentation...');
}

async function generateCommandDocs(config) {
    // Placeholder for Command documentation generation
    console.log('🎮 Generating Command documentation...');
}

module.exports = { generateCommand };
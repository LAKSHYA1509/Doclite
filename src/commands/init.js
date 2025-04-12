const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');
const simpleGit = require('simple-git');

function toTitleCase(str) {
    return str
        .replace(/[-_]/g, ' ')
        .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

async function initializeReadme() {
    console.log('\n🚀 Running Doclite init command...\n');

    const readmePath = path.join(process.cwd(), 'README.md');
    const current = process.cwd();
    const rawProjectName = path.basename(current);
    const projectName = rawProjectName ? toTitleCase(rawProjectName) : 'My Project';

    let proceed = false;

    // Step 1: Check README existence
    try {
        await fs.access(readmePath);
        console.log(`✔️  README.md already exists at: ${readmePath}`);

        const answers = await inquirer.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'Do you want Doclite to manage/update this file? (Existing custom content might be affected in later versions)',
                default: false,
            },
        ]);
        proceed = answers.overwrite;
        if (!proceed) return console.log('❌ Operation cancelled by user.\n');
        console.log('👍 Okay, proceeding...');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('ℹ️  README.md does not exist.');
            const answers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'create',
                    message: 'Do you want to create a new README.md file?',
                    default: true,
                },
            ]);
            proceed = answers.create;
            if (!proceed) return console.log('❌ Okay, maybe later.\n');
            console.log('👍 Okay, preparing to create README.md...');
        } else {
            return console.error('❌ Error checking for README.md:', error.message);
        }
    }

    if (proceed) {
        console.log('\n📄 Generating README.md content...');
        let markdownContent = '';
        let hadError = false;

        // --- Project Name & Git Commit History --- //
        console.log('\n-----------------------------');
        console.log('📦 Project Metadata');
        console.log('-----------------------------');

        console.log(`   -> Project Name: ${projectName}`);

        let commitLines = ['*No commit history generated.*'];
        try {
            const git = simpleGit(current);
            const isRepo = await git.checkIsRepo();
            if (isRepo) {
                const log = await git.log({ n: 5 });
                if (log.all.length > 0) {
                    console.log(`   -> Found ${log.all.length} Git commits.`);
                    commitLines = log.all.map(commit => {
                        const shortHash = commit.hash.substring(0, 7);
                        const commitDate = new Date(commit.date).toLocaleDateString('en-CA');
                        return `- ${shortHash} (${commitDate}): ${commit.message} [${commit.author_name}]`;
                    });
                } else {
                    console.log('   -> No Git commits found.');
                    commitLines = ['*No commits found in repository.*'];
                }
            } else {
                console.log('   -> Not a Git repository. Skipping commit log.');
                commitLines = ['*Not a Git repository.*'];
            }
        } catch (gitError) {
            console.error('   -> Error fetching Git commits:', gitError.message);
            commitLines = ['*Error fetching commit history.*'];
            hadError = true;
        }

        // --- Project Structure --- //
        console.log('\n-----------------------------');
        console.log('🗂️  Project Structure');
        console.log('-----------------------------');

        let structureLines = ['*Could not read directory structure.*'];
        try {
            const topLevelEntries = await fs.readdir(current);
            const ignoreList = new Set(['.git', 'node_modules', '.gitignore', 'package.json', 'package-lock.json', 'README.md', '.vscode', '.idea']);
            const projectStructure = topLevelEntries.filter(entry => !ignoreList.has(entry));

            if (projectStructure.length > 0) {
                console.log('   -> Found top-level files/folders.');
                structureLines = projectStructure.map(item => `- ${item}`);
            } else {
                console.log('   -> No significant top-level files/folders found.');
                structureLines = ['*No significant top-level files found.*'];
            }
        } catch (fsError) {
            console.error('   -> Error reading directory structure:', fsError.message);
            hadError = true;
        }

        // --- Markdown Generation --- //
        console.log('\n🛠️  Assembling Markdown content...');
        const generatedOn = new Date().toLocaleString('en-CA');

        markdownContent = `
# ${projectName}

*TODO: Add a brief description of your project here.*

## Project Structure (Top-Level)

\`\`\`
${structureLines.join('\n')}
\`\`\`
*(Note: This is a basic view. You might want to refine this section manually or enhance Doclite later to show more detail.)*

## Recent Changes (Last ${commitLines[0].startsWith('*') ? 'N/A' : commitLines.length} Commits)

${commitLines.join('\n')}

## Setup

*TODO: Add instructions on how to install, configure, and run your project.*

---

*This README was partially generated by [Doclite](https://github.com/your-repo-url).*

_Generated on: ${generatedOn}_

<!-- TODO: Support .auto-readmerc for customizable templates -->
`.trim();

        // --- Write to File --- //
        if (!hadError) {
            console.log('\n💾 Writing content to README.md...');
            try {
                await fs.writeFile(readmePath, markdownContent, 'utf8');
                console.log(`✅ Successfully created/updated README.md!\n`);
            } catch (writeError) {
                console.error(`❌ Error writing file:`, writeError.message);
            }
        } else {
            console.log('\n⚠️  Skipped writing due to earlier errors. Showing generated content:\n');
            console.log(markdownContent);
        }

        // Final Log
        console.log('🎉 Doclite finished! Open `README.md` and polish the TODOs.\n');
    }
}

module.exports = { initializeReadme };

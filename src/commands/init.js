const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');
const simpleGit = require('simple-git');

async function initializeReadme() {
    console.log('Running Doclite init command...');

    const readmePath = path.join(process.cwd(), 'README.md');
    console.log(`Checking for README at: ${readmePath}`);

    let proceed = false;
    try {
        await fs.access(readmePath);
        console.log('✔️ README.md already exists.');

        const answers = await inquirer.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'Do you want Doclite to manage/update this file? (Existing custom content might be affected in later versions)',
                default: false,
            },
        ]);
        proceed = answers.overwrite;
        if (proceed) {
            console.log('👍 Okay, proceeding...');
        } else {
            console.log('❌ Operation cancelled by user.');
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('ℹ️ README.md does not exist.');
            const answers = await inquirer.default.prompt([
                {
                    type: 'confirm',
                    name: 'create',
                    message: 'Do you want to create a new README.md file?',
                    default: true,
                },
            ]);
            proceed = answers.create;
            if (proceed) {
                console.log('👍 Okay, preparing to create README.md...');
            } else {
                console.log('❌ Okay, maybe later.');
            }
        } else {
            console.error('❌ Error checking for README.md:', error);
        }
    }

    if (proceed) {
        console.log('\n🚧 Generating README.md content...');
        let markdownContent = '';
        let hadError = false;

        try {
            const current = process.cwd();
            const projectName = path.basename(current);
            console.log(`   -> Project Name: ${projectName}`);

            let commitLines = ['*No commit history generated.*'];
            try {
                const git = simpleGit(current);
                const isRepo = await git.checkIsRepo();
                if (isRepo) {
                    const log = await git.log({ n: 5 });
                    if (log.latest && log.all.length > 0) {
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

            // --- Step 4: Assemble Markdown Content --- //
            console.log('   -> Assembling Markdown content...');
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
*This README was partially generated by Doclite.*
`;
            console.log('   -> Markdown content assembled.');

            // --- Step 5: Write content to file --- //
            if (!hadError) {
                console.log(`\nWriting content to ${readmePath}...`);
                try {
                    await fs.writeFile(readmePath, markdownContent.trim(), 'utf8');
                    console.log(`✅ Successfully created/updated ${path.basename(readmePath)}!`);
                } catch (writeError) {
                    console.error(`❌ Error writing file ${path.basename(readmePath)}:`, writeError.message);
                }
            } else {
                console.log('\n⚠️ Skipped file writing due to errors during content generation.');
                console.log('\n--- Partially Generated README Content ---');
                console.log(markdownContent.trim());
                console.log('--- End of Content ---');
            }

        } catch (error) {
            console.error('❌ An unexpected error occurred during README generation:', error.message);
        }

    } else {
        console.log('\n🛑 No file generation action taken.');
    }
}

module.exports = { initializeReadme };

const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');
const simpleGit = require('simple-git');

function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

async function initializeReadme(options) {
  console.log('\n🚀 Running Doclite init command...\n');

  const readmePath = path.join(process.cwd(), 'README.md');
  const current = process.cwd();
  const rawProjectName = path.basename(current);
  const projectName = rawProjectName ? toTitleCase(rawProjectName) : 'My Project';

  let proceed = false;

  try {
    await fs.access(readmePath);
    console.log(`✔️  README.md already exists.`);
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
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('ℹ️  README.md does not exist.');
      const answers = await inquirer.default.prompt([
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
      console.error('❌ Error checking for README.md:', err.message);
      return;
    }
  }

  if (proceed) {
    console.log('\n📄 Generating README.md content...');
    let markdownContent = '';
    let hadError = false;
    let requestedCommitCount = 5;

    try {
      console.log('\n-----------------------------');
      console.log('📦 Project Metadata');
      console.log('-----------------------------');
      console.log(`   -> Project Name: ${projectName}`);

      // ----------- Git Commits -----------
      let commitLines = ['*No commit history generated.*'];
      try {
        const parsedCount = parseInt(options.commits, 10);
        if (!isNaN(parsedCount) && parsedCount > 0) {
          requestedCommitCount = parsedCount;
        } else if (options.commits !== '5') {
          console.warn(`   ⚠️ Invalid value "${options.commits}" for --commits. Using default: ${requestedCommitCount}.`);
        }

        const git = simpleGit(current);
        const isRepo = await git.checkIsRepo();
        if (isRepo) {
          const log = await git.log({ n: requestedCommitCount });
          if (log.all.length > 0) {
            console.log(`   -> Found ${log.all.length} Git commits (requested ${requestedCommitCount}).`);
            commitLines = log.all.map(commit => {
              const shortHash = commit.hash.substring(0, 7);
              const commitDate = new Date(commit.date).toLocaleDateString('en-CA');
              return `- ${shortHash} (${commitDate}): ${commit.message} [${commit.author_name}]`;
            });
          } else {
            commitLines = ['*No commits found in repository.*'];
          }
        } else {
          commitLines = ['*Not a Git repository.*'];
        }
      } catch (gitError) {
        console.error('   -> Error fetching Git commits:', gitError.message);
        commitLines = ['*Error fetching commit history.*'];
        hadError = true;
      }

      // ----------- Project Structure with .docliteignore -----------
      console.log('\n-----------------------------');
      console.log('🗂️  Project Structure');
      console.log('-----------------------------');
      let structureLines = ['*Could not read directory structure.*'];
      try {
        const topLevelEntries = await fs.readdir(current);

        const defaultIgnores = ['.git', 'node_modules', '.gitignore', 'package.json', 'package-lock.json', 'README.md', '.vscode', '.idea'];
        let customIgnores = [];

        const ignorePath = path.join(current, '.docliteignore');
        try {
          const ignoreContent = await fs.readFile(ignorePath, 'utf8');
          customIgnores = ignoreContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
          console.log(`   -> Loaded ${customIgnores.length} entries from .docliteignore`);
        } catch (ignoreErr) {
          if (ignoreErr.code !== 'ENOENT') {
            console.warn(`   ⚠️ Error reading .docliteignore: ${ignoreErr.message}`);
          }
        }

        const ignoreSet = new Set([...defaultIgnores, ...customIgnores]);
        const projectStructure = topLevelEntries.filter(entry => !ignoreSet.has(entry));
        structureLines = projectStructure.length > 0
          ? projectStructure.map(item => `- ${item}`)
          : ['*No significant top-level files found.*'];
      } catch (fsErr) {
        console.error('   -> Error reading directory structure:', fsErr.message);
        hadError = true;
      }

      // ----------- Assemble README Content -----------
      console.log('\n🛠️  Assembling Markdown content...');
      const generatedOn = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

      markdownContent = `
# ${projectName}

*TODO: Add a brief 1-2 sentence description of your project here.*

## Project Structure (Top-Level)

\`\`\`
${structureLines.join('\n')}
\`\`\`

## Recent Changes (Last ${requestedCommitCount} Requested Commits)

${commitLines.join('\n')}

## Setup

... (Your Setup Template Here) ...
*Note: Please update these setup instructions...*

---

*This README was partially generated by [Doclite](https://github.com/your-repo).*

_Generated on: ${generatedOn}_
`.trim();

      // ----------- Output / Write -----------
      if (!hadError) {
        if (options.dryRun) {
          console.log('\n✨ --dry-run enabled. Skipping file write.');
          console.log('\n--- Generated README Content (Preview) ---\n');
          console.log(markdownContent);
          console.log('\n--- End of Preview ---');
        } else {
          console.log('\n💾 Writing content to README.md...');
          try {
            await fs.writeFile(readmePath, markdownContent, 'utf8');
            console.log(`✅ Successfully created/updated README.md!\n`);
          } catch (writeError) {
            console.error(`❌ Error writing file:`, writeError.message);
          }
        }
      } else {
        console.log('\n⚠️  Skipped writing due to earlier errors. Showing generated content:\n');
        console.log(markdownContent);
      }

    } catch (error) {
      console.error('❌ An unexpected error occurred during README generation:', error.message);
    }

    console.log('🎉 Doclite finished! Open `README.md` and polish the TODOs.\n');
  }
}

module.exports = { initializeReadme };

#!/usr/bin/env node

const { Command } = require('commander');
const { initializeReadme } = require('./commands/init');
const { detectProject } = require('./commands/detect');
const { setupCommand } = require('./commands/setup');
const { generateCommand } = require('./commands/generate');

// const { updateReadme } = require('./commands/update'); 

const program = new Command();

program
  .name('doclite')
  .description('📘 Doclite: Instantly generate or update README.md files') 
  .version('1.1.0', '-v, --version', 'Display the current version'); 

program
  .command('init')
  .description('Initialize or completely regenerate the README.md')
  .option('-d, --dry-run', 'Preview the README.md content without writing the file')
  .option('-c, --commits <number>', 'Number of commits to include in the log') 
  .action((options) => {
      initializeReadme(options);
  });

  program
  .command('detect')
  .description('Detect project type and structure')
  .option('-e, --detect', 'Preview the detected project structure without writing the file')
  .option('-i, --include [paths]', 'Comma-separated list of files/folders to scan')
  .option('-a, --ai <provider>', 'AI provider to use (openai|ollama)', 'openai')
  .action((options) => {
    detectProject(options);
  });

program
  .command('setup')
  .description('Generate setup instructions')
  .option('-a, --ai <provider>', 'AI provider to use (openai|ollama)', 'openai')
  .action((options) => {
    setupCommand(options);
  });

// src/cli.js
program
    .command('generate')
    .description('Generate complete README using detected configuration')
    .option('-c, --commits <number>', 'Number of commits to include in the log', '5')
    .option('-a, --ai <provider>', 'AI provider to use (openai|ollama)', 'openai')
    .action((options) => {
        generateCommand(options);
    });

// program
//   .command('update')
//   .description('Update auto-generated sections within an existing README.md')

//   .option('-d', '--dry-run', 'Preview the updated README.md content without writing the file')
//   .action((options) => {
//       updateReadme(options); 
//   });

program
  .command('help')
  .description('Display help information')
  .action(() => {
      program.outputHelp();
  });

if (process.argv.length <= 2) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
#!/usr/bin/env node

const { Command } = require('commander');
const { initializeReadme } = require('./commands/init');

const program = new Command();

program
  .name('doclite')
  .description('📘 Doclite: Instantly generate a structured README.md file with project insights')
  .version('1.0.0', '-v, --version', 'Display the current version');

// Subcommand: init
program
  .command('init')
  .description('Initialize or update the README.md for your project using Doclite')
  .action(initializeReadme);

program
.command('help')
.description('Display help information')
.action(() => {
  program.outputHelp();
});

// Handle no arguments: show help
if (process.argv.length <= 2) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}

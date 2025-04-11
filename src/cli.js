#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

const { initializeReadme } = require('./commands/init'); 

program
  .version('0.0.1')
  .description('Doclite: A CLI tool to automatically generate README.md files');

program
  .command('init')
  .description('Initialize or update the README.md for the project using Doclite')

  .action(initializeReadme); 

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}


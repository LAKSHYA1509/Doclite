const { Command } = require('commander');

const program = new Command();

program
  .command('init')
  .description('Initialize or update the README.md for your project using Doclite')
  .option('--update', 'Update the README.md file if it already exists')
  .action((options) => {
    console.log(options);
  });

program.parse(process.argv);
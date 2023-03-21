const chalk = require('chalk');

module.exports = {
    name: "err",
    execute(client) {
        console.log(chalk.red(`An error occured with database connection:\n${err}`));
    }
}
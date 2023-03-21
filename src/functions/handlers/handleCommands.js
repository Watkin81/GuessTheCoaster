const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require("fs");

module.exports = (client) => {
    client.handleCommands = async() => {
        const commandFolders = fs.readdirSync(`./src/commands`);
        for (const folder of commandFolders) {
            const commandFiles = fs
      .readdirSync(`./src/commands/${folder}`)
      .filter((file) => file.endsWith(".js") && !file.endsWith("ping.js"));

            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push({...command.data, execute: command.execute})
                console.log(`Command: ${command.data.name} has passed through handler.`);
            }
        }
        const clientID = '1078900498054271047';
        //const guildID = '278698483794575360';
        const rest = new REST({ version: '10' }).setToken(process.env.token);
        try {
            console.log("Started refreshing application (/) commands.");

            await rest.put(Routes.applicationCommands(clientID, /*guildID*/), { // REMOVE GUILDID
                body: client.commandArray,
            });


            console.log("Successfully reloaded application (/) commands.");
        } catch (error) {
            console.error(error);
        }
    }
}
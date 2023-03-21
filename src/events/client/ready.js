const { ActivityType } = require("discord.js");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Ready!!! ${client.user.tag} is logged in and online!`);
        client.user.setActivity({name: "OpenRCT2", type: ActivityType.Playing});
    }
}
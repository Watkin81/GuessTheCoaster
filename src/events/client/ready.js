const { ActivityType } = require("discord.js");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Ready!!! ${client.user.tag} is logged in and online!`);
        console.log(`Currently in ${client.guilds.cache.size} servers!`);

        const games = ["Planet Coaster", "NoLimits 2", "OpenRCT2"];
        let counter = 0;

        client.user.setActivity({name: "OpenRCT2", type: ActivityType.Playing});
        setInterval(() => {
            client.user.setActivity({name: games[counter % games.length], type: ActivityType.Playing});
            counter++;
            if (counter === games.length) {
                counter = 0;
            };
        }, 1200000);
    }
}
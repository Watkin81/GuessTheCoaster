const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

bannerImages = ["https://watkin81.github.io/images/header/Banshee_KingsIsland.jpg",
"https://watkin81.github.io/images/header/Colossus_Lagoon.jpg",
"https://watkin81.github.io/images/header/Corkscrew_MA.jpg",
"https://watkin81.github.io/images/header/ElectricEel_SWSD.jpg",
"https://watkin81.github.io/images/header/Emperor_SWSD.jpg",
"https://watkin81.github.io/images/header/Outlaw_Adventureland.jpg",
"https://watkin81.github.io/images/header/Thunderhawk_MA.jpg",
"https://watkin81.github.io/images/header/Voyage_HolidayWorld.jpg"]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription(`Returns a list of the Bot's Commands.`),
    async execute(interaction, client) {
        randPath = Math.floor(Math.random() * 8); //here so that it randomized every time command is run.
        const embed = new EmbedBuilder()
            .setTitle(`:desktop: **GuessTheCoaster Commands** :keyboard:`)
            .setColor(0x9989F2)
            .setImage(url = bannerImages[randPath])
            .setTimestamp(Date.now())
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: client.user.tag
            })
            .setFooter({
                iconURL: interaction.user.displayAvatarURL(),
                text: interaction.user.tag
            })
            .setDescription(`/about - *brings up an about page, where you can see how the bot works and how to invite it.*\n
                    /badges - *shows a list of badges you can acquire.*\n
                    /commands - *brings up this help page.*\n
                    /guess - *play a round of GuessTheCoaster.*\n
                    /leaderboard - *view the browsable GuessTheCoaster leaderboards.*\n
                    /profile - *view the stats page of a player.*`);

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
    }
}
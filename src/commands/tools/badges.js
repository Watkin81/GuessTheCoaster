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
        .setName('badges')
        .setDescription('Returns a list of obtainable badges.'),
    async execute(interaction, client) {
        randPath = Math.floor(Math.random() * 8); //here so that it randomized every time command is run.
        const embed = new EmbedBuilder()
            .setTitle(`:medal: **Obtainable badges** :trophy:`)
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
            .setDescription(`<:contributer:1107101590759948338> - *Contributor: For those who have provided pictures.*\n
                    <:50PercentCompletion:1150904904383205386> - *50% Completion: Collect more than half the coasters. *\n
                    <:completionold:1107101587769401354> - *Old 100% Completion: Collect all coasters at any point in time.*\n
                    <:Streak10:1174742875045646377> - *Streak of 10: Obtain a streak of 10.*\n
                    <:Streak50:1174784490942496918> - *Streak of 50: Obtain a streak of 50.*\n
                    <:owner:1107101591837872129> - *Owner: Own the bot. (You can't have this haha L)*`);

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
    }
}
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
        .setName('about')
        .setDescription('Returns the About Page with Bot Information.'),
    async execute(interaction, client) {
        randPath = Math.floor(Math.random() * 8); //here so that it randomized every time command is run.
        const embed = new EmbedBuilder()
            .setTitle(`:roller_coaster: About GuessTheCoaster :roller_coaster:`)
            .setDescription(`GuessTheCoaster is a Discord Bot where Users have to Guess the Name of a Roller Coaster from a large selection of coaster images. Correct answers reward Credits and Completion which can be viewed on a User Profile or on Local/Global Leadboards.\n
            The Bot is coded in JavaScript with help from Nodejs, Discordjs, and Mongodb.\n
            Created by CreatorCreepy. All images are taken either by me or by users of the bot!`)
            .setColor(0x9989F2)
            .setImage(url = bannerImages[randPath])
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: client.user.tag
            })
            .setFooter({
                iconURL: interaction.user.displayAvatarURL(),
                text: interaction.user.tag
            })
            .addFields([
                {
                    name: `Add Images :camera:`,
                    value: `Send CreatorCreepy on discord any images you would like to see added to the bot. Please ensure they are pictures you have personally taken and are in a 1:1 aspect ratio!`,
                    inline: false
                },
                {
                    name: `Bot Support :man_technologist:`,
                    value: `Please contact CreatorCreepy on discord if you come across any errors with the bot.\n
                    The GitHub for the Bot can be found at [github.com/Watkin81/GuessTheCoaster](https://github.com/Watkin81/GuessTheCoaster).\n
		    The Website for the Bot can be found on [My Coaster Website](https://watkin81.github.io/guessthecoaster.html) (Contains Invite Link).\n
            If you like this bot, consider following my [Roller Coaster Instagram](https://www.instagram.com/roller.coaster.images/)!`,
                    inline: false
                }
            ]);

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
    }
}
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const mongoose = require('mongoose');
const scoreSchema = require('../../schemas/scoreschema.js');
const Score = mongoose.model('Score', scoreSchema);
const globalSchema = require('../../schemas/globalschema.js');
const GlobalModel = mongoose.model('GlobalModel', globalSchema);
//const guess = require('./guess.js');
//const coasterCount = guess.allCoastersLength;
//console.log(`AllCoastersLength in ProfileSetup: ${coasterCount}`);

notfoundEmbed = new EmbedBuilder()
                    .setTitle(`User Profile Not Found!`)
                    .setDescription(`This User has never played and therefore does not have a Profile!`)
                    .setColor(0xffffff);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription(`Returns a User's GuessTheCoaster Profile.`)
        .setDMPermission(false)
        .addUserOption(option =>
            option.setName('user')
                .setDescription(`The Tag of the User's Profile to D isplay.`)
                .setRequired(true)
        ),
        async execute(interaction) {
            const tag = interaction.options.getUser('user');
            const member = interaction.guild.members.cache.get(tag.id);
            const id = tag.id;
            console.log('1) Found member Tag:', member.user.tag);
            console.log('2) Found member ID:', tag.id);
    
            if (!member) {
                return interaction.reply({ 
                    embeds: [notfoundEmbed]
                });
            }

            let coasterCount = 0;
            const globalData = await GlobalModel.findOne({ globalCoaster: '1' });
            if (globalData) {
                coasterCount = globalData.coasterCount;
            } else {
                console.log(`Global Data Not Found!`);
                return interaction.reply({ 
                    embeds: [notfoundEmbed]
                });
            }

            const user = await Score.findOne({ userID: id });
            if (user) {
                usersScore = user.score;
                usersComp = user.comp;
                pfp = user.pfp;
                
                compText = `${usersComp}/${coasterCount}`
                let compPercent = (usersComp / coasterCount) * 100;
                compPercent = compPercent.toFixed(2);

                console.log('3) Found member Credits:', usersScore);
                console.log(`4) Found member Completion: ${usersComp} = ${compPercent}%`);

                profileEmbed = new EmbedBuilder()
                    .setTitle(`${member.user.tag}'s Profile`)
                    .setDescription(`Credits: **${usersScore}** :roller_coaster:\n
                    Completion: **${compPercent}%**  -  *(${compText})*`)
                    .setColor(0xffffff)
                    .setTimestamp(Date.now())
                    .setThumbnail(pfp);
            } else {
                console.log(`User with Discord Tag ${id} not found.`);
                return interaction.reply({ 
                    embeds: [notfoundEmbed]
                });
            }

            return interaction.reply({ 
                //content: `The user ID of ${tag} is ${member.user.id}.`, ephemeral: true 
                embeds: [profileEmbed]
            });
        },
    };
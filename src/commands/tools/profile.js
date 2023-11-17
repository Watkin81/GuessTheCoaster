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
                .setDescription(`The Tag of the User's Profile to Display.`)
                .setRequired(true)
        ),

        async execute(interaction) {
            const tag = interaction.options.getUser('user');
            const member = interaction.guild.members.cache.get(tag.id);
            const id = tag.id;
            //console.log('1) Found member Tag:', member.user.tag);
            //console.log('2) Found member ID:', tag.id);
    
            if (!member) {
                return interaction.reply({ 
                    embeds: [notfoundEmbed]
                });
            }

            let coasterCount = 0;
            let easyCount = 0;
            let mediumCount = 0;
            let hardCount = 0;
            let contributers = [];
            const globalData = await GlobalModel.findOne({ globalCoaster: '1' });
            if (globalData) {
                coasterCount = globalData.coasterCount;
                easyCount = globalData.easyCount;
                mediumCount = globalData.mediumCount;
                hardCount = globalData.hardCount;
                contributers = globalData.contributers;
            } else {
                console.log(`Global Data Not Found!`);
                return interaction.reply({ 
                    embeds: [notfoundEmbed],
                    ephemeral: true
                });
            }

            const user = await Score.findOne({ userID: id });
            if (user) {
                usersScore = user.score;
                usersID = user.userID;
                usersComp = user.comp;
                pfp = user.pfp;
                usersBadges = user.badges;
                topStreak = user.streak;
                let emoteArray = [];
                coasterArray = user.gc;
                easyArray = 0;
                mediumArray = 0;
                hardArray = 0;

                streakText = `${topStreak}`

                compText = `${usersComp}/${coasterCount}`
                let compPercent = (usersComp / coasterCount) * 100;
                compPercent = compPercent.toFixed(2);

                for (let i = 0; i < coasterArray.length; i++) {
                    const element = coasterArray[i].toLowerCase();
                    if (element.startsWith('e')) {
                        easyArray++;
                    } else if (element.startsWith('m')) {
                        mediumArray++;
                    } else if (element.startsWith('h')) {
                        hardArray++;
                    }
                }

                easyText = `${easyArray}/${easyCount}`
                mediumText = `${mediumArray}/${mediumCount}`
                hardText = `${hardArray}/${hardCount}`

                //console.log('3) Found member Credits:', usersScore);
                //console.log(`4) Found member Completion: ${usersComp} = ${compPercent}%`);
                //console.log(`5) Found member Badges: ${usersBadges}`);
                //console.log(`6) pfp lol: ${pfp}`);
                //console.log('Count of elements starting with "e":', easyArray);
                //console.log('Count of elements starting with "m":', mediumArray);
                //console.log('Count of elements starting with "h":', hardArray);
                
                if (!usersBadges || (typeof usersBadges === 'object' && !Array.isArray(usersBadges)) 
                || (typeof usersBadges === 'object' && Array.isArray(usersBadges) && usersBadges.length === 0)) {

                    //console.log("No badge data found D:");
                    usersBadges = [];
                    usersBadges.push("false");
                    usersBadges.push("false");
                    usersBadges.push("false");
                    usersBadges.push("false");
                    usersBadges.push("false");
                    usersBadges.push("false");
                }
                if (usersID == 207199551646466059) { // owns the bot
                    emoteArray.push("<:owner:1107101591837872129>");
                }
                if (contributers.includes(usersID)) { // has contributed pictures or other help
                    emoteArray.push("<:contributer:1107101590759948338>");
                }
                if (usersBadges[2] == "true" || usersBadges[2] == true) { // has acquired 100% previously
                    emoteArray.push("<:completionold:1107101587769401354>");
                }
                if (usersBadges[3] == "true" || usersBadges[3] == true) { // currently has 50% completion
                    emoteArray.push("<:50PercentCompletion:1150904904383205386>");
                }
                if (usersBadges[4] == "true" || usersBadges[4] == true) { // has obtained a streak of 10
                    emoteArray.push("<:Streak10:1174742875045646377>");
                }
                if (usersBadges[5] == "true" || usersBadges[5] == true) { // has obtained a streak of 50
                    emoteArray.push("<:Streak50:1174784490942496918>");
                }

                if (emoteArray.length == 0) {
                    emoteArray.push("*None! :sob:*");
                }

                badgeString = "";
                for (let f = 0; f < emoteArray.length; f++) {
                    badgeString += emoteArray[f];
                    badgeString += " ";
                }

                profileEmbed = new EmbedBuilder()
                    .setTitle(`${member.user.tag}'s Profile`)
                    .setDescription(`Credits: **${usersScore}** :roller_coaster:\nCompletion: **${compPercent}%**\nCollected: **${compText}**\nBest Streak: **${streakText}** :fire:`)
                    .addFields(
                        { name: 'Easy', value: `*${easyText}*`, inline: true },
                        { name: 'Medium', value: `*${mediumText}*`, inline: true },
                        { name: 'Hard', value: `*${hardText}*`, inline: true } )
                    .addFields({ name: 'Badges', value: `${badgeString}` })
                    .setColor(0xffffff)
                    .setTimestamp(Date.now())
                    .setThumbnail(pfp);

                    try {
                        const updatedUser = await Score.findOneAndUpdate(
                          { userID: id },
                          { $set: { badges: usersBadges } },
                          { new: false, upsert: false }
                        );
                        // Optionally, you can log the updatedUser if needed.
                        //console.log('Updated user:', updatedUser);
                      } catch (error) {
                        console.error('Error while updating badges:', error);
                      }
    
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
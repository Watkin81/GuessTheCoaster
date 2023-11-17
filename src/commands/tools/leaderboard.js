const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const mongoose = require('mongoose');
const scoreSchema = require('../../schemas/scoreschema.js');
const Score = mongoose.model('Score', scoreSchema);
const globalSchema = require('../../schemas/globalschema.js');
const GlobalModel = mongoose.model('GlobalModel', globalSchema);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Returns the browsable Leaderboards for GuessTheCoaster.'),

    async execute(interaction, client) {
        try {
            guildId = interaction.guildId; // get guildID for local lb
            console.log('GuildId: ', guildId);

            let coasterCount = 0;

            // GET TOTAL COASTER COUNT FROM GLOBAL DATA
            const globalData = await GlobalModel.findOne({ globalCoaster: '1' });
            if (globalData) {
                coasterCount = globalData.coasterCount;
            } else {
                console.log(`Global Data Not Found!`);
                return;
            }

            // GLOBAL USER LEADERBOARDS
            // GET USER INFO - TOP 10 CREDITS SORTED QUERY
            let topCompValues = [];
            let topUserTags = [];

            const scoreResults = await Score.aggregate([
                { $sort: { score: -1 } },
                { $limit: 10 },
                { $project: { userTag: 1, score: 1, _id: 0 } },
                { $group: { _id: null, scores: { $push: { userTag: '$userTag', score: '$score' } } } },
                { $project: { _id: 0, scores: { $slice: ['$scores', { $size: '$scores' }] } } }
            ]);

            let creditsString = "";
            
            const scores = scoreResults[0].scores;
            for (let i = 0; i < scores.length; i++) {
                //console.log('Scores Array: ', scores[i]);

                if (!scores[i]) {
                    continue;
                }

                creditsString += `**${i+1})** ${scores[i].userTag} | **${scores[i].score}** Credits\n`;
            }

            // GET USER INFO - TOP 10 COMPLETION SORTED QUERY
            const compResults = await Score.aggregate([
                { $project: { userTag: 1, comp: 1, compInt: { $toInt: "$comp" }}},
                { $sort: { compInt: -1}},
                { $limit: 10 }
            ]);
            
            topCompValues = compResults.map(result => result.compInt);
            topUserTags = compResults.map(result2 => result2.userTag);

            let compString = "";
            for (let i = 0; i < topCompValues.length; i++) {
                //console.log('Comp Array: ', topCompValues[i]);
                if (!topCompValues[i]) {
                    continue;
                }

                let compPercent = (topCompValues[i] / coasterCount) * 100;
                compPercent = compPercent.toFixed(2);

                compString += `**${i+1})** ${topUserTags[i]} | **${compPercent}%** Completion\n`;
            }

            // GET USER INFO - TOP 10 STREAK SORTED QUERY
            const streakResults = await Score.aggregate([
                { $sort: { streak: -1 } },
                { $limit: 10 },
                { $project: { userTag: 1, streak: 1, _id: 0 } },
                { $group: { _id: null, streaks: { $push: { userTag: '$userTag', streak: '$streak' } } } },
                { $project: { _id: 0, streaks: { $slice: ['$streaks', { $size: '$streaks' }] } } }
            ]);

            let streakString = "";
            
            const streaks = streakResults[0].streaks;
            for (let i = 0; i < streaks.length; i++) {
                //console.log('Streaks Array: ', streaks[i]);

                if (!streaks[i]) {
                    continue;
                }

                streakString += `**${i+1})** ${streaks[i].userTag} | **${streaks[i].streak}** Streak\n`;
            }

            // LOCAL LEADERBOARDS
            // GET USER INFO - TOP 10 CREDITS SORTED QUERY - LOCAL GUILDID
            let topCompValuesL = [];
            let topUserTagsL = [];

            const scoreResultsL = await Score.aggregate([
                { $match: { guildID: { $in: [guildId] } } }, // Filter by guildId
                { $sort: { score: -1 } },
                { $limit: 10 },
                { $project: { userTag: 1, score: 1, _id: 0 } },
                { $group: { _id: null, scoresL: { $push: { userTag: '$userTag', score: '$score' } } } },
                { $project: { _id: 0, scoresL: { $slice: ['$scoresL', { $size: '$scoresL' }] } } }
            ]);

            let creditsStringL = "";
            
            const scoresL = scoreResultsL[0].scoresL;
            for (let i = 0; i < scoresL.length; i++) {
                //console.log('ScoresL Array: ', scoresL[i]);

                if (!scoresL[i]) {
                    continue;
                }

                creditsStringL += `**${i+1})** ${scoresL[i].userTag} | **${scoresL[i].score}** Credits\n`;
            }

            // GET USER INFO - TOP 10 COMPLETION SORTED QUERY - LOCAL GUILDID
            const compResultsL = await Score.aggregate([
                { $match: { guildID: { $in: [guildId] } } }, // Filter by guildId
                { $project: { userTag: 1, comp: 1, compInt: { $toInt: "$comp" }}},
                { $sort: { compInt: -1}},
                { $limit: 10 }
            ]);
            
            topCompValuesL = compResultsL.map(result => result.compInt);
            topUserTagsL = compResultsL.map(result2 => result2.userTag);

            let compStringL = "";
            for (let i = 0; i < topCompValuesL.length; i++) {
                //console.log('CompL Array: ', topCompValuesL[i]);
                if (!topCompValuesL[i]) {
                    continue;
                }

                let compPercentL = (topCompValuesL[i] / coasterCount) * 100;
                compPercentL = compPercentL.toFixed(2);

                compStringL += `**${i+1})** ${topUserTagsL[i]} | **${compPercentL}%** Completion\n`;
            }

            // GET USER INFO - TOP 10 STREAK SORTED QUERY - LOCAL LEADERBOARDS GUILD ID
            const streakResultsL = await Score.aggregate([
                { $match: { guildID: { $in: [guildId] } } },
                { $sort: { streak: -1 } },
                { $limit: 10 },
                { $project: { userTag: 1, streak: 1, _id: 0 } },
                { $group: { _id: null, streaksL: { $push: { userTag: '$userTag', streak: '$streak' } } } },
                { $project: { _id: 0, streaksL: { $slice: ['$streaksL', { $size: '$streaksL' }] } } }
            ]);

            let streakStringL = "";
            
            const streaksL = streakResultsL[0].streaksL;
            for (let i = 0; i < streaksL.length; i++) {
                //console.log('StreaksL Array: ', streaksL[i]);

                if (!streaksL[i] || streaksL[i].streak === null || streaksL[i].streak === undefined) {
                    streaksL[i].streak = "0";
                }

                streakStringL += `**${i+1})** ${streaksL[i].userTag} | **${streaksL[i].streak}** Streak\n`;
            }


            // MAKE OUTPUTS
            const globalP1 = new EmbedBuilder()
                .setTitle(`:globe_with_meridians: Global Leaderboard :globe_with_meridians:`)
                .addFields([
                    {
                        name: `Top ${scores.length} Credits :roller_coaster:`,
                        value: creditsString,
                        inline: false
                    },{
                        name: `Top ${topCompValues.length} Completion :white_check_mark:`,
                        value: compString,
                        inline: false
                    }
                ])
                .setTimestamp(Date.now())
                .setColor(0xffffff)
                .setFooter({ text: 'Page 1/2  •  Buttons expire after 30 seconds'});

            const globalP2 = new EmbedBuilder()
                .setTitle(`:globe_with_meridians: Global Leaderboard :globe_with_meridians:`)
                .addFields([
                    {
                        name: `Top ${streaks.length} Streaks :fire:`,
                        value: streakString,
                        inline: false
                    },{
                        name: `Top Coming Soon! :clock1:`/*${topCompValues.length}*/,
                        value: `*gaming*`,
                        inline: false
                    }
                ])
                .setTimestamp(Date.now())
                .setColor(0xffffff)
                .setFooter({ text: 'Page 2/2  •  Buttons expire after 30 seconds'});

            const localP1 = new EmbedBuilder()
                .setTitle(`:house: Local Leaderboard :house:`)
                .addFields([
                    {
                        name: `Top ${scoresL.length} Credits :roller_coaster:`,
                        value: creditsStringL,
                        inline: false
                    },{
                        name: `Top ${topCompValuesL.length} Completion :white_check_mark:`,
                        value: compStringL,
                        inline: false
                    }
                ])
                .setTimestamp(Date.now())
                .setColor(0xffffff)
                .setFooter({ text: 'Page 2/2  •  Buttons expire after 30 seconds'});

            const localP2 = new EmbedBuilder()
                .setTitle(`:house: Local Leaderboard :house:`)
                .addFields([
                    {
                        name: `Top ${streaksL.length} Streaks :fire:`,
                        value: streakStringL,
                        inline: false
                    },{
                        name: `Top Coming Soon! :clock1:`/*${topCompValues.length}*/,
                        value: `*gaming*`,
                        inline: false
                    }
                ])
                .setTimestamp(Date.now())
                .setColor(0xffffff)
                .setFooter({ text: 'Page 2/2  •  Buttons expire after 30 seconds'});

            // BUTTONS
            const row1 = new ActionRowBuilder();
                row1.addComponents(
                    new ButtonBuilder()
                        .setCustomId('row1deco')
                        .setLabel('<-')
                        .setStyle('Primary')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('showLocal')
                        .setLabel('Show Local')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('showP2')
                        .setLabel('->')
                        .setStyle('Primary')
                );

            const row2 = new ActionRowBuilder()
                row2.addComponents(
                    new ButtonBuilder()
                        .setCustomId('showP1')
                        .setLabel('<-')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('showLocal')
                        .setLabel('Show Local')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('row2deco')
                        .setLabel('->')
                        .setStyle('Primary')
                        .setDisabled(true)
                );

            const row3 = new ActionRowBuilder()
                row3.addComponents(
                    new ButtonBuilder()
                        .setCustomId('row3deco')
                        .setLabel('<-')
                        .setStyle('Primary')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('showGlobal')
                        .setLabel('Show Global')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('showP2L')
                        .setLabel('->')
                        .setStyle('Primary')
                );
            
            const row4 = new ActionRowBuilder()
                row4.addComponents(
                    new ButtonBuilder()
                        .setCustomId('showP1L')
                        .setLabel('<-')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('showGlobal')
                        .setLabel('Show Global')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('row4deco')
                        .setLabel('->')
                        .setStyle('Primary')
                        .setDisabled(true)
                );

            const reply = await interaction.reply({ embeds: [globalP1], components: [row1] });

            const collectorFilter = (buttonInteraction) => {
                buttonInteraction.deferUpdate();
                return (
                    (buttonInteraction.customId === 'showP2' || buttonInteraction.customId === 'showP1' || 
                    buttonInteraction.customId === 'showP1L' || buttonInteraction.customId === 'showP2L' || 
                    buttonInteraction.customId === 'showLocal' || buttonInteraction.customId === 'showGlobal') &&
                    buttonInteraction.user.id === interaction.user.id
                );
            };
            
            const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter, time: 30000 });
            
            collector.on('collect', async (buttonInteraction) => {
                //console.log('Button Pressed:', buttonInteraction.customId);
                let newComponents;
                if (buttonInteraction.customId === 'showP2') {
                    await reply.edit({ embeds: [globalP2], components: [] }); // global page 2
                    newComponents = [row2];
                } else if ((buttonInteraction.customId === 'showP1') || (buttonInteraction.customId === 'showGlobal')) {
                    await reply.edit({ embeds: [globalP1], components: [] }); // global page 1
                    newComponents = [row1];
                } else if ((buttonInteraction.customId === 'showP1L') || (buttonInteraction.customId === 'showLocal')) {
                    await reply.edit({ embeds: [localP1], components: [] }); // local page 1
                    newComponents = [row3];
                } else if (buttonInteraction.customId === 'showP2L') {
                    await reply.edit({ embeds: [localP2], components: [] }); // local page 2
                    newComponents = [row4];
                }

                // Add the new components to the message
                await buttonInteraction.message.edit({ components: newComponents });
            });
            
            collector.on('end', () => {
                // Cleanup after the collector ends (optional)
                reply.edit({ components: [] });
            });
        } catch (error) {
           console.error(error);
        }
    }
}
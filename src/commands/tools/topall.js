const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const scoreSchema = require('../../schemas/scoreschema.js');
const Score = mongoose.model('Score', scoreSchema);
const globalSchema = require('../../schemas/globalschema.js');
const GlobalModel = mongoose.model('GlobalModel', globalSchema);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topall')
        .setDescription('Returns the Leaderboards Globally across All Servers the Bot is in.'),

    async execute(interaction, client) {
        try {
            let coasterCount = 0;

            // GET TOTAL COASTER COUNT FROM GLOBAL DATA
            const globalData = await GlobalModel.findOne({ globalCoaster: '1' });
            if (globalData) {
                coasterCount = globalData.coasterCount;
            } else {
                console.log(`Global Data Not Found!`);
                return;
            }

            // GET USER INFO - TOP 5 CREDITS SORTED QUERY
            let topCompValues = [];
            let topUserTags = [];

            const scoreResults = await Score.aggregate([
                { $sort: { score: -1 } },
                { $limit: 5 },
                { $project: { userTag: 1, score: 1, _id: 0 } },
                { $group: { _id: null, scores: { $push: { userTag: '$userTag', score: '$score' } } } },
                { $project: { _id: 0, scores: { $slice: ['$scores', { $size: '$scores' }] } } }
            ]);

            let creditsString = "";
            
            const scores = scoreResults[0].scores;
            for (let i = 0; i < scores.length; i++) {
                console.log('Scores Array: ', scores[i]);

                if (!scores[i]) {
                    continue;
                }

                creditsString += `**${i+1})** ${scores[i].userTag} | **${scores[i].score}** Credits\n`;
            }

            // GET USER INFO - TOP 5 COMPLETION SORTED QUERY
            const compResults = await Score.aggregate([
                { $project: { userTag: 1, comp: 1, compInt: { $toInt: "$comp" }}},
                { $sort: { compInt: -1}},
                { $limit: 5 }
            ]);
            
            topCompValues = compResults.map(result => result.compInt);
            topUserTags = compResults.map(result2 => result2.userTag);

            let outputString = "";
            for (let i = 0; i < topCompValues.length; i++) {
                if (!topCompValues[i]) {
                    continue;
                }

                let compPercent = (topCompValues[i] / coasterCount) * 100;
                compPercent = compPercent.toFixed(2);

                outputString += `**${i+1})** ${topUserTags[i]} | **${compPercent}%** Completion\n`;
            }

            // MAKE OUTPUTS
            const lbEmbed = new EmbedBuilder()
                .setTitle(`:roller_coaster: Global Leaderboard :roller_coaster:`)
                //.setDescription(`n/a atm`)
                .addFields([
                    {
                        name: `Top ${scores.length} Credits`,
                        value: creditsString,
                        inline: false
                    },{
                        name: `Top ${topCompValues.length} Completion`,
                        value: outputString,
                        inline: false
                    }
                ])
                .setTimestamp(Date.now())
                .setColor(0xffffff)

            await interaction.reply({ embeds: [lbEmbed] });
        } catch (error) {
           console.error(error);
        }
    }
}
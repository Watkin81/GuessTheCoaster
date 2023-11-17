const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const globalSchema = require('../../schemas/globalschema.js');
const GlobalModel = mongoose.model('GlobalModel', globalSchema);
const coasterSchema = require('../../schemas/coasterschema.js');
const CoasterModel = mongoose.model('CoasterModel', coasterSchema);

notApproved = new EmbedBuilder()
                    .setTitle(`No Permission!`)
                    .setDescription(`You do not have permission to run this command!`)
                    .setColor(0xD0312D);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoaster')
        .setDescription('Adds a Coaster to the Database, can only be run by approved and trusted individuals!')
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('pick "e", "m", or "h" (lowercase)'))
        .addStringOption(option =>
            option.setName('name1')
                .setDescription('Type the REAL Name of the Coaster.'))
        .addStringOption(option =>
            option.setName('name2')
                .setDescription('Type a second acceptable answer. leave as "x" if no second name.'))
        .setDMPermission(false),
    async execute(interaction, client) {
        userId = interaction.user.id;
        console.log(userId);
        if (!(userId === "207199551646466059")) {
            // checks if you are him
            return interaction.reply({ 
                embeds: [notApproved],
                ephemeral: true
            });
        }
        const dif = interaction.options.getString("difficulty");
        if (!["e", "m", "h"].includes(dif)) {
            return interaction.reply({
                embeds: [typoEmbed],
                ephemeral: true
            });
        }
        const name1 = interaction.options.getString("name1").toLowerCase();
        const name2 = interaction.options.getString("name2").toLowerCase();

        let coasterCount;
        let easyCount;
        let mediumCount;
        let hardCount;
        // GET DATABASE SIZE FROM GLOBAL DATA
        const globalData = await GlobalModel.findOne({ globalCoaster: '1' });
        if (globalData) {
            coasterCount = globalData.coasterCount;
            easyCount = globalData.easyCount;
            mediumCount = globalData.mediumCount;
            hardCount = globalData.hardCount;
        } else {
            console.log(`Global Data Not Found!`);
            return;
        }

        let num;
        if (dif === "e") {
            num = easyCount+1;
        }
        else if (dif === "m") {
            num = mediumCount+1;
        }
        else if (dif === "h") {
            num = hardCount+1;
        }
        updatedCoasterCount = coasterCount+1;

        // create the new coaster document
        const newCoaster = new CoasterModel({
            key: `${dif}${num}`,
            dif: `${dif}`,
            names: [name1, name2]
          });
        // save the new coaster document
        newCoaster.save((err) => {
            if (err) {
              console.error(err);
            } else {
              console.log("New coaster saved successfully!");
            }
          });

        // create ui for the end of the addition to double check all entered information
        doneEmbed = new EmbedBuilder()
                    .setTitle(`DATABASE UPDATED WITH INFORMATION:`)
                    .setDescription(`If **ANY** of the below is incorrect, contact CreatorCreepy **INSTANTLY**,
                    as the creation of this KEY cannot be undone. Do not add further coasters until the mistake is fixed!\n
                    --=--
                    key: **${dif}${num}**
                    dif: **${dif}**
                    names: **${name1}**, **${name2}** *(confirm spelling. If no second name, it should show as "x".)*
                    --=--\n
                    **IMPORTANT:**
                    You MUST send or upload an image of **${name1}** named **${dif}${num}.png** to the proper difficulty folder on github ASAP!
                    Preferably this is done before running this command. Note this MUST be done before the bot reloads (to avoid bugs)!`)
                    .setColor(0xffbf00)
                    .setTimestamp(Date.now());

        // update global stats count to include the info
        GlobalModel.findOne({}, function(err, globalData) {
            if (err) {
            console.error(err);
            
            } else {
            // update the fields
            globalData.coasterCount = updatedCoasterCount
            if (dif === "e") {
                globalData.easyCount = globalData.easyCount + 1;
            }
            else if (dif === "m") {
                globalData.mediumCount = globalData.mediumCount + 1;
            }
            else if (dif === "h") {
                globalData.hardCount = globalData.hardCount + 1;
            }

            // save the updated document
            globalData.save(function(err) {
                if (err) {
                console.error(err);
                } else {
                console.log('Data updated successfully!');
                }
            });
            }
        });

        await interaction.reply({ embeds: [doneEmbed] });
    }
}
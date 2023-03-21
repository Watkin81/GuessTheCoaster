const { SlashCommandBuilder, InteractionType, EmbedBuilder, MessageCollector, AttachmentBuilder } = require('discord.js');
//let running = false;
const runningMap = new Map();
var x = "~x~x~";

const mongoose = require('mongoose');
const scoreSchema = require('../../schemas/scoreschema.js');
const Score = mongoose.model('Score', scoreSchema);
const globalSchema = require('../../schemas/globalschema.js');
const GlobalModel = mongoose.model('GlobalModel', globalSchema);
const coasterSchema = require('../../schemas/coasterschema.js');
const CoasterModel = mongoose.model('CoasterModel', coasterSchema);
const guessSchema = require('../../schemas/guessschema.js');
const GuessModel = mongoose.model('GuessModel', guessSchema);

let coasterCount = 0;
let easyCount = 0;
let mediumCount = 0;
let hardCount = 0;

GlobalModel.findOne({}, (err, data) => {
    if (err) {
      console.error(err);
    } else if (!data) {
      console.error('No global data found!');
    } else {
      // get the values of all 4 fields
      coasterCount = data.coasterCount;
      easyCount = data.easyCount;
      mediumCount = data.mediumCount;
      hardCount = data.hardCount;
  
      console.log(`coasterCount: ${coasterCount}, easyCount: ${easyCount}, mediumCount: ${mediumCount}, hardCount: ${hardCount}`);
    }
});

let easyCoasters = [];
let mediumCoasters = [];
let hardCoasters = [];

CoasterModel.find({ dif: 'e' }, (err, easyCoastersAcq) => {
    if (err) {
      console.error(err);
    } else {
      console.log("easyCoasters:", easyCoastersAcq);
      easyCoasters = easyCoastersAcq;
    }
  });
CoasterModel.find({ dif: 'm' }, (err, mediumCoastersAcq) => {
    if (err) {
      console.error(err);
    } else {
      console.log("mediumCoasters: ", mediumCoastersAcq);
      mediumCoasters = mediumCoastersAcq;
    }
  });
CoasterModel.find({ dif: 'h' }, (err, hardCoastersAcq) => {
    if (err) {
      console.error(err);
    } else {
      console.log("hardCoasters: ", hardCoastersAcq);
      hardCoasters = hardCoastersAcq;
    }
  });

// more code thank god finally ----------------------
alreadyEmbed = new EmbedBuilder()
                    .setTitle(`There's already a round going on in this channel!`)
                    .setDescription(`Please wait for the previous round to end!`)
                    .setColor(0xffffff);
typoEmbed = new EmbedBuilder()
                    .setTitle(`Please select a valid Guess Difficulty!`)
                    .setDescription(`Options are: easy, medium, or hard.`)
                    .setColor(0xffffff);
permsEmbed = new EmbedBuilder()
                    .setTitle(`The Bot does not have Permission to be Used in this Channel!`)
                    .setDescription(`Ask a Server Manager to give Channel Permission!`)
                    .setColor(0xffffff);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Guess the Name of a Roller Coaster from an Image.')
        .setDMPermission(false)
        .addStringOption(option => 
            option
                .setName("difficulty")
                .setDescription("The Difficulty of the Image to Guess. (Medium and Hard Coming Soon!)")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    async autocomplete(interaction, client) {
        const focusedValue = interaction.options.getFocused();
		const choices = ["easy", "medium", "hard"];
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map((choice) => ({ name: choice, value: choice })),
        );
    },

    async execute(interaction, client) {
        /*const botRole = interaction.guild.roles.cache.find(role => role.name === 'GuessTheCoaster');
        //const botRole = guild.roles.cache.get(interaction.client.user.id);
        console.log(`botRole: ${botRole}`);
        // Get the channel where the interaction was executed
        const channel = "1079130253051572265";
        console.log(`channel: ${channel}`);
        // Return an error message if the channel is null
        if (!channel) {
          return interaction.reply('I cannot execute this command in a private message.');
        }
        const channelPermissions = channel.permissionsFor(botRole);
        if (channelPermissions.has('VIEW_CHANNEL')) {
          return interaction.reply({
            embeds: [permsEmbed],
            ephemeral: true,
          });
        }*/

        const dif = interaction.options.getString("difficulty");
        if (!["easy", "medium", "hard"].includes(dif)) {
            return interaction.reply({
                embeds: [typoEmbed],
                ephemeral: true,
            });
        }
        
        const channelId = interaction.channelId; //get channel id of interaction
        //console.log(`${channelId}`);

        if (!runningMap.has(channelId)) {
            runningMap.set(channelId, "x");
          }

        if (runningMap.get(channelId) === "t") {
            console.log(`Game is already running in channel: ${channelId}.`);
            interaction.reply({ 
                embeds: [alreadyEmbed],
                ephemeral: true
            });
        }
        else {
        console.log(`New Game started in channel: ${channelId}.`);

        runningMap.set(channelId, "t");

        let embed;
        let answer;
        let creditWorth;
        let randomNumber;
        let coasterKey;
        let coasterNames;
        let randomCoaster;
        let timer = 20000;
        let cycleTimes = 0;
        let oldNumber;
        let streakUser;
        let streakCount;
        let updatedStreak;
        let placeholder = "~x~x~" // WORKS AS ANSWER IF NO SECOND NAME

        GuessModel.findOne({}, (err, data) => {
            if (err) {
              console.error(err);
            } else if (!data) {
              console.error('No previous guess data found!');
            } else {
              // get the values from db
              oldNumber = data.lastNum;
              streakUser = data.streakUser;
              streakCount = data.streak;
          
              console.log(`1) oldNumber: ${oldNumber}, streakUser: ${streakUser}, streakCount: ${streakCount}`);
            }
        });

        if (dif === "easy") {
            timer = 20000;
            //random image key from the array of all keys
            randomNumber = Math.floor(Math.random() * easyCount);
            //dupe prot
            while ((randomNumber === oldNumber) && (cycleTimes <=10)) {
                randomNumber = Math.floor(Math.random() * easyCount);
                cycleTimes = cycleTimes + 1;
            }
            oldNumber = randomNumber;
            console.log(`randomNumber: ${randomNumber}`);
            randomCoaster = easyCoasters[randomNumber];
            console.log(`randomCoaster: ${randomCoaster}`);
            coasterKey = easyCoasters[randomNumber].key;
            console.log(`coasterKey: ${coasterKey}`);
            coasterNames = easyCoasters[randomNumber].names;
            for (let i = 0; i < coasterNames.length; i++) {
                if (coasterNames[i] === "x" || coasterNames[i] === "") {
                  coasterNames[i] = placeholder;
                }
            }
            console.log(`coasterNames: ${coasterNames}`);
            answer = coasterNames;
            creditWorth = Math.floor(Math.random() * 3) + 1;
                embed = new EmbedBuilder()
                    .setTitle(`Guess the Roller Coaster!`)
                    .setDescription(`Difficulty: Easy`)
                    .setColor(0x70d050)
                    .setImage(`https://raw.githubusercontent.com/Watkin81/watkin81.github.io/main/botimages/easy/${coasterKey}.png`)
            }
        else if (dif === "medium") {
            timer = 25000;
            randomNumber = Math.floor(Math.random() * mediumCount);
            //dupe prot
            while ((randomNumber === oldNumber) && (cycleTimes <=10)) {
                randomNumber = Math.floor(Math.random() * easyCount);
                cycleTimes = cycleTimes + 1;
            }
            oldNumber = randomNumber;
            console.log(`randomNumber: ${randomNumber}`);
            randomCoaster = mediumCoasters[randomNumber];
            console.log(`randomCoaster: ${randomCoaster}`);
            coasterKey = mediumCoasters[randomNumber].key;
            console.log(`coasterKey: ${coasterKey}`);
            coasterNames = mediumCoasters[randomNumber].names;
            for (let i = 0; i < coasterNames.length; i++) {
                if (coasterNames[i] === "x" || coasterNames[i] === "") {
                  coasterNames[i] = placeholder;
                }
            }
            console.log(`coasterNames: ${coasterNames}`);
            answer = coasterNames;
            creditWorth = Math.floor(Math.random() * 3) + 4;
            embed = new EmbedBuilder()
                .setTitle(`Guess the Roller Coaster!`)
                .setDescription(`Difficulty: Medium`)
                .setColor(0xdac644)
                .setImage(`https://raw.githubusercontent.com/Watkin81/watkin81.github.io/main/botimages/medium/${coasterKey}.png`)
        }
        else if (dif === "hard") {
            timer = 30000;
            randomNumber = Math.floor(Math.random() * hardCount);
            //dupe prot
            while ((randomNumber === oldNumber) && (cycleTimes <=10)) {
                randomNumber = Math.floor(Math.random() * easyCount);
                cycleTimes = cycleTimes + 1;
            }
            oldNumber = randomNumber;
            console.log(`randomNumber: ${randomNumber}`);
            randomCoaster = hardCoasters[randomNumber];
            console.log(`randomCoaster: ${randomCoaster}`);
            coasterKey = hardCoasters[randomNumber].key;
            console.log(`coasterKey: ${coasterKey}`);
            coasterNames = hardCoasters[randomNumber].names;
            for (let i = 0; i < coasterNames.length; i++) {
                if (coasterNames[i] === "x" || coasterNames[i] === "") {
                  coasterNames[i] = placeholder;
                }
            }
            console.log(`coasterNames: ${coasterNames}`);
            answer = coasterNames;
            creditWorth = Math.floor(Math.random() * 3) + 7;
            embed = new EmbedBuilder()
                .setTitle(`Guess the Roller Coaster!`)
                .setDescription(`Difficulty: Hard`)
                .setColor(0xb32323)
                .setImage(`https://raw.githubusercontent.com/Watkin81/watkin81.github.io/main/botimages/hard/${coasterKey}.png`)
        }
        // send game message and image
        interaction.reply({ 
            embeds: [embed]
        });
        console.log("embed sent");

        console.log(answer[0], answer[1]);


            // `m` is a message object that will be passed through the filter function
        const filter = response => {
            return answer.some(a => a.toLowerCase() === response.content.toLowerCase());
        };
        
        const collector = interaction.channel.createMessageCollector({ filter, time: timer }); //game time length he he he haw

        collector.on('collect', m => {
	        console.log(`Collected ${m.content}`);
            console.log(`Credit Value: ${creditWorth}`);
            collector.stop();

            var userID = m.author.id;
            var guildId = m.guildId;
            var avatarURL;

            const user = client.users.cache.get(userID);
            if (user) {
                console.log(user.tag);
                usersTag = user.tag;
                console.log(`1usersTag: ${usersTag}`);
            } else {
                console.log(`User with ID ${userID} not found`);
            }

            Score.findOne({ userID: userID })
            .then((userScore) => {
                let newScoreValue = userScore ? userScore.score + creditWorth : creditWorth;

                // Check if the user has guessed this coaster before
            let gc = userScore ? userScore.gc : [];
            //let coasterName = answer[0];
            console.log(`2usersTag: ${usersTag}`);
            if (!gc.includes(coasterKey)) {
                gc.push(coasterKey);
                console.log(`User ${userID} guessed ${coasterKey} for the first time!`);
            }
            let completion = gc.length;

            let guildIdArray = userScore?.guildID ?? ["x"];
            console.log(`2.5guildid: ${guildId}`);
            console.log(`userscore: ${userScore}`);
            //let guildIdArray = userScore ? userScore.guildId : ["x"];
            console.log(`2.5guildidArray: ${guildIdArray}`);
            if (!guildIdArray.includes(guildId)) {
                console.log(`2.5pushgid: ${guildId}`);
                guildIdArray.push(guildId);
              }
            avatarURL = user.avatarURL({ format: 'png', dynamic: true, size: 1024 });
            console.log(`5userPFP: ${avatarURL}`);
                
                return Score.findOneAndUpdate(
                    { userID: userID }, 
                    { $set: { score: newScoreValue, userTag: usersTag, gc: gc, comp: completion, guildID: guildIdArray, pfp: avatarURL } }, 
                    { new: true, upsert: true });
            
            })
            .then((finalScore) => {
                console.log('Updated score:', finalScore);
            })
            .catch((err) => {
                console.error('Error updating score:', err);
            });

            console.log(`3usersTag: ${usersTag}`);

            try {
                if (userID == streakUser) {
                    // same user as last round won
                    updatedStreak = streakCount + 1;
                }
                else {
                    updatedStreak = 1;
                }
                streakUser = userID;
    
                let streakText = "";
                if (updatedStreak > 1) {
                    streakText = `᲼᲼᲼᲼᲼᲼᲼᲼᲼*Streak of ${updatedStreak}.*`
                }

                wonEmbed = new EmbedBuilder()
                    .setTitle(`GG! ${usersTag} guessed "${answer[0]}" correctly!`)
                    .setColor(0x699857)
                    .setDescription(`They have been awarded **${creditWorth}** Credit(s)! ${streakText}`)
                m.reply({
                    embeds: [wonEmbed]
                })
            } catch (error) {
                console.error(error);
            }
            UpdateGuessModel();
            runningMap.set(channelId, "f");
        });

        collector.on('end', collected => {
	        console.log(`Collected ${collected.size} items`);
            if (collected.size === 0) {
                try {
                        lostEmbed = new EmbedBuilder()
                        .setTitle(`Time's Up!`)
                        .setDescription(`Nobody Guessed the Correct Roller Coaster!`)
                        .setColor(0xffffff);
                    interaction.followUp({
                        embeds: [lostEmbed]
                    })
                } catch (error) {
                    console.error(error);
                }
            streakUser = "userID";
            updatedStreak = 1;
            UpdateGuessModel();
            }
            runningMap.set(channelId, "f");
        });

        function UpdateGuessModel() {
            GuessModel.updateOne(
                {}, // filter object to match all documents
                {
                  $set: {
                    lastNum: randomNumber,
                    streakUser: streakUser,
                    streak: updatedStreak
                  }
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(res);
                    console.log(`2) oldNumber: ${randomNumber}, streakUser: ${streakUser}, streakCount: ${updatedStreak}`);
                  }
                }
              );
        }
        }
    }
}
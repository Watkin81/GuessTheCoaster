const { SlashCommandBuilder, InteractionType, EmbedBuilder, MessageCollector, AttachmentBuilder } = require('discord.js');
const runningMap = new Map(); // tracks currently running games in channels
const streakUserMap = new Map(); // tracks the user with the current streak in a guild
const streakNumMap = new Map(); // tracks the score of the current streak in a guild

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
let newText = "";

GlobalModel.findOne({}, (err, data) => {
    if (err) {
      console.error(err);
    } else if (!data) {
      console.error('No global data found!');
    } else {
      // get the values of all four arrays
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
      //console.log("easyCoasters:", easyCoastersAcq);
      easyCoasters = easyCoastersAcq;
    }
  });
CoasterModel.find({ dif: 'm' }, (err, mediumCoastersAcq) => {
    if (err) {
      console.error(err);
    } else {
      //console.log("mediumCoasters: ", mediumCoastersAcq);
      mediumCoasters = mediumCoastersAcq;
    }
  });
CoasterModel.find({ dif: 'h' }, (err, hardCoastersAcq) => {
    if (err) {
      console.error(err);
    } else {
      //console.log("hardCoasters: ", hardCoastersAcq);
      hardCoasters = hardCoastersAcq;
    }
  });

// error embeds
alreadyEmbed = new EmbedBuilder()
                    .setTitle(`There's already a round going on in this channel!`)
                    .setDescription(`Please wait for the previous round to end!`)
                    .setColor(0xffffff);
typoEmbed = new EmbedBuilder()
                    .setTitle(`Please select a valid Guess Difficulty!`)
                    .setDescription(`Options are: easy, medium, hard, or random.`)
                    .setColor(0xffffff);
permsEmbed = new EmbedBuilder()
                    .setTitle(`The Bot does not have Permission to be Used in this Channel!`)
                    .setDescription(`Ask a Server Manager to give this Channel Permission!`)
                    .setColor(0xffffff);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Guess the Name of a Roller Coaster from an Image.')
        .setDMPermission(false)
        .addStringOption(option => 
            option
                .setName("difficulty")
                .setDescription("The Difficulty of the Image to Guess.")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    async autocomplete(interaction, client) {
        const focusedValue = interaction.options.getFocused();
		const choices = ["easy", "medium", "hard", "random"];
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map((choice) => ({ name: choice, value: choice })),
        );
    },

    async execute(interaction, client) {

        let dif = interaction.options.getString("difficulty");
        if (!["easy", "medium", "hard", "random"].includes(dif)) {
            return interaction.reply({
                embeds: [typoEmbed],
                ephemeral: true
            });
        }
        
        const intGuildId = interaction.guildId; //get guild id of interaction
        const channelId = interaction.channelId; //get channel id of interaction
        //console.log(`${channelId}`);

        // check if a game is running in the current channel
        if (!runningMap.has(channelId)) {
            runningMap.set(channelId, "x");
          }
        if (runningMap.get(channelId) === "t") {
            //console.log(`Game is already running in channel: ${channelId}.`);
            interaction.reply({ 
                embeds: [alreadyEmbed],
                ephemeral: true
            });
        }
        else {
        // start a new round
        console.log(`New Round started in channel: ${channelId}.`);
        runningMap.set(channelId, "t");

        // initialize all the variables for a new round of the game
        let embed;
        let answer;
        let creditWorth;
        let randomNumber;
        let coasterKey;
        let coasterNames;
        let randomCoaster;
        let timer = 20000; // changes later anyways
        let cycleTimes = 0;
        let repeatPercent = 0.5; // must go through half of that difficulties coasters until coasters appear again
        let maxCycle = 100; // max times a random number can be rerolled until it just fucking gives up
        let oldNumbersE = [];
        let oldNumbersM = [];
        let oldNumbersH = [];
        let streakUser;
        let streakCount;
        let updatedStreak;
        let placeholder = Math.floor(Math.random() * 9e30) + 1e29;
        placeholder = placeholder.toString(); // WORKS AS ANSWER IF NO SECOND NAME - NOW NOT GUESSABLE L

        GuessModel.findOne({}, (err, data) => {
            if (err) {
              console.error(err);
            } else if (!data) {
              console.error('No previous guess data found!');
            } else {
              // get the values from db
              oldNumbersE = data.lastNumsE;
              oldNumbersM = data.lastNumsM;
              oldNumbersH = data.lastNumsH;
            }

        if (dif === "easy") {
            timer = 25000;
            do {
                randomNumber = Math.floor(Math.random() * easyCount);
                cycleTimes++;
                } while (oldNumbersE.includes(randomNumber) && cycleTimes <= maxCycle);
            if (oldNumbersE.length >= (easyCount * repeatPercent)) {
                oldNumbersE.shift();
            }
            oldNumbersE[oldNumbersE.length] = randomNumber;
            //console.log(`randomNumber: ${randomNumber}`);
            randomCoaster = easyCoasters[randomNumber];
            console.log(`randomCoaster: ${randomCoaster}`);
            coasterKey = easyCoasters[randomNumber].key;
            //console.log(`coasterKey: ${coasterKey}`);
            coasterNames = easyCoasters[randomNumber].names;
            for (let i = 0; i < coasterNames.length; i++) {
                if (coasterNames[i] === "x" || coasterNames[i] === "") {
                  coasterNames[i] = placeholder;
                }
            }
            console.log(`coasterNames: ${coasterNames}`);
            answer = coasterNames;
            creditWorth = 1;
                embed = new EmbedBuilder()
                    .setTitle(`Guess the Roller Coaster!`)
                    .setDescription(`Difficulty: Easy`)
                    .setColor(0x70d050)
                    .setImage(`https://raw.githubusercontent.com/Watkin81/watkin81.github.io/main/botimages/easy/${coasterKey}.png`)
            }
        else if (dif === "medium") {
            timer = 35000;
            do {
              randomNumber = Math.floor(Math.random() * mediumCount);
              cycleTimes++;
              } while (oldNumbersM.includes(randomNumber) && cycleTimes <= maxCycle);
            if (oldNumbersM.length >= (mediumCount * repeatPercent)) {
              oldNumbersM.shift();
            }
            oldNumbersM[oldNumbersM.length] = randomNumber;
            //console.log(`randomNumber: ${randomNumber}`);
            randomCoaster = mediumCoasters[randomNumber];
            console.log(`randomCoaster: ${randomCoaster}`);
            coasterKey = mediumCoasters[randomNumber].key;
            //console.log(`coasterKey: ${coasterKey}`);
            coasterNames = mediumCoasters[randomNumber].names;
            for (let i = 0; i < coasterNames.length; i++) {
                if (coasterNames[i] === "x" || coasterNames[i] === "") {
                  coasterNames[i] = placeholder;
                }
            }
            console.log(`coasterNames: ${coasterNames}`);
            answer = coasterNames;
            creditWorth = 2;
            embed = new EmbedBuilder()
                .setTitle(`Guess the Roller Coaster!`)
                .setDescription(`Difficulty: Medium`)
                .setColor(0xdac644)
                .setImage(`https://raw.githubusercontent.com/Watkin81/watkin81.github.io/main/botimages/medium/${coasterKey}.png`)
        }
        else if (dif === "hard") {
            timer = 60000;
            do {
              randomNumber = Math.floor(Math.random() * hardCount);
              cycleTimes++;
              } while (oldNumbersH.includes(randomNumber) && cycleTimes <= maxCycle);
            if (oldNumbersH.length >= (hardCount * repeatPercent)) {
              oldNumbersH.shift();
            }
            oldNumbersH[oldNumbersH.length] = randomNumber;
            //console.log(`randomNumber: ${randomNumber}`);
            randomCoaster = hardCoasters[randomNumber];
            console.log(`randomCoaster: ${randomCoaster}`);
            coasterKey = hardCoasters[randomNumber].key;
            //console.log(`coasterKey: ${coasterKey}`);
            coasterNames = hardCoasters[randomNumber].names;
            for (let i = 0; i < coasterNames.length; i++) {
                if (coasterNames[i] === "x" || coasterNames[i] === "") {
                  coasterNames[i] = placeholder;
                }
            }
            console.log(`coasterNames: ${coasterNames}`);
            answer = coasterNames;
            creditWorth = 3;
            embed = new EmbedBuilder()
                .setTitle(`Guess the Roller Coaster!`)
                .setDescription(`Difficulty: Hard`)
                .setColor(0xb32323)
                .setImage(`https://raw.githubusercontent.com/Watkin81/watkin81.github.io/main/botimages/hard/${coasterKey}.png`)
        }

        else if (dif === "random") {
          timer = 90000; // fold timer
          randomDif = Math.floor(Math.random() * coasterCount);
          if (randomDif <= easyCount) {
            dif = "easy";
            creditWorth = 3;
          }
          else if ((randomDif > easyCount) && (randomDif <= (easyCount + mediumCount))) {
            dif = "medium";
            creditWorth = 4;
          }
          else if (randomDif > (easyCount + mediumCount)) {
            dif = "hard";
            creditWorth = 5;
          }

          if (dif === "easy") {
            do {
              randomNumber = Math.floor(Math.random() * easyCount);
              cycleTimes++;
            } while (oldNumbersE.includes(randomNumber) && cycleTimes <= maxCycle);
            if (oldNumbersE.length >= (easyCount * repeatPercent)) {
              oldNumbersE.shift();
            }
            oldNumbersE[oldNumbersE.length] = randomNumber;
            randomCoaster = easyCoasters[randomNumber];
            coasterKey = easyCoasters[randomNumber].key;
            coasterNames = easyCoasters[randomNumber].names;
          }
          else if (dif === "medium") {
            do {
              randomNumber = Math.floor(Math.random() * mediumCount);
              cycleTimes++;
            } while (oldNumbersM.includes(randomNumber) && cycleTimes <= maxCycle);
            if (oldNumbersM.length >= (mediumCount * repeatPercent)) {
              oldNumbersM.shift();
            }
            oldNumbersM[oldNumbersM.length] = randomNumber;
            randomCoaster = mediumCoasters[randomNumber];
            coasterKey = mediumCoasters[randomNumber].key;
            coasterNames = mediumCoasters[randomNumber].names;
          }
          else if (dif === "hard") {
            do {
              randomNumber = Math.floor(Math.random() * hardCount);
              cycleTimes++;
            } while (oldNumbersH.includes(randomNumber) && cycleTimes <= maxCycle);
            if (oldNumbersH.length >= (hardCount * repeatPercent)) {
              oldNumbersH.shift();
            }
            oldNumbersH[oldNumbersH.length] = randomNumber;
            randomCoaster = hardCoasters[randomNumber];
            coasterKey = hardCoasters[randomNumber].key;
            coasterNames = hardCoasters[randomNumber].names;
          }

          console.log(`randomCoaster: ${randomCoaster}`);

          for (let i = 0; i < coasterNames.length; i++) {
              if (coasterNames[i] === "x" || coasterNames[i] === "") {
                coasterNames[i] = placeholder;
              }
          }
          console.log(`coasterNames: ${coasterNames}`);
          answer = coasterNames;
          embed = new EmbedBuilder()
              .setTitle(`Guess the Roller Coaster!`)
              .setDescription(`Difficulty: Random (90 Second Time Limit)`)
              .setColor(0x880ED4)
              .setImage(`https://raw.githubusercontent.com/Watkin81/watkin81.github.io/main/botimages/${dif}/${coasterKey}.png`)
      }

        // send game message and image
        interaction.reply({ 
            embeds: [embed]
        });
        console.log("game embed sent");
        //console.log(answer[0], answer[1]);

            // `m` is a message object that will be passed through the filter function
        const filter = response => {
            return answer.some(a => a.toLowerCase() === response.content.toLowerCase());
        };
        
        const collector = interaction.channel.createMessageCollector({ filter, time: timer }); //game time length he he he haw

        collector.on('collect', m => {
	        console.log(`Collected ${m.content}`);
            //console.log(`Credit Value: ${creditWorth}`);
            collector.stop();

            var userID = m.author.id;
            var guildId = m.guildId;
            var avatarURL;

            const user = client.users.cache.get(userID);
            if (user) {
                console.log(user.tag);
                usersTag = user.tag;
                //console.log(`1usersTag: ${usersTag}`);
            } else {
                console.log(`User with ID ${userID} not found`);
            }

            Score.findOne({ userID: userID })
            .then((userScore) => {
                let newScoreValue = userScore ? userScore.score + creditWorth : creditWorth;
                let bestStreak = userScore.streak;
                let gc = userScore ? userScore.gc : [];
                let userBadges = userScore ? userScore.badges : [];
                let completion = gc.length;
            
              // check if the coaster has been guessed before
              if (!gc.includes(coasterKey)) {
                  gc.push(coasterKey);
                  console.log(`User ${userID} guessed ${coasterKey} for the first time!`);
                  newText = `*This is their first time guessing this coaster!*`;
              }
              else {
                  newText = "";
              }

              if (!userBadges || (typeof userBadges === 'object' && Array.isArray(userBadges) && userBadges.length === 0)) {
                console.log("No badge data found D:");
                usersBadges = [];
                usersBadges.push("false");
                usersBadges.push("false");
                usersBadges.push("false");
                usersBadges.push("false");
                usersBadges.push("false");
                usersBadges.push("false");
              }
              else {
                usersBadges = [];
                usersBadges = userBadges;
              }

              let guildIdArray = userScore?.guildID ?? ["x"];
              //console.log(`2.5guildid: ${guildId}`);
              //console.log(`userscore: ${userScore}`);
              //let guildIdArray = userScore ? userScore.guildId : ["x"];
              //console.log(`2.5guildidArray: ${guildIdArray}`);
              if (!guildIdArray.includes(guildId)) {
                  //console.log(`2.5pushgid: ${guildId}`);
                  guildIdArray.push(guildId);
              }
              avatarURL = user.avatarURL({ format: 'png', dynamic: true, size: 1024 }); 
              //console.log(`5userPFP: ${avatarURL}`);

              if (completion == coasterCount) { // if 100% previously
                  if (usersBadges[2] = "false") {
                      completionTime = Math.floor(Date.now() / 1000); // unix time for comp (not used yet)
                  }
                  usersBadges[2] = "true";
              }

              if ((completion / coasterCount) >= 0.5) {
                  usersBadges[3] = "true";
              }
              else {
                  usersBadges[3] = false;
              }     
              //console.log(`badgesOUT: ${usersBadges}`);

              streakCount = streakNumMap.get(m.guildId);
              streakUser = streakUserMap.get(m.guildId);
            
              if (userID == streakUser) {
                  // same user as last round won
                  updatedStreak = streakCount + 1;
              }
              else {
                  updatedStreak = 1;
              }
              streakUserMap.set(m.guildId, userID);
              streakNumMap.set(m.guildId, updatedStreak);

              if (updatedStreak > bestStreak) {
                  bestStreak = updatedStreak;
              }

              // streak of 10 badge
              if ((updatedStreak >= 10 ) || (bestStreak >= 10)) {
                usersBadges[4] = "true";
              }
              else {
                usersBadges[4] = false;
              }     

              // streak of 50 badge
              if ((updatedStreak >= 50 ) || (bestStreak >= 50)) {
                usersBadges[5] = "true";
              }
              else {
                usersBadges[5] = false;
              }    

            return Score.findOneAndUpdate(
                { userID: userID }, 
                { $set: { score: newScoreValue, streak: bestStreak, userTag: usersTag, gc: gc, comp: completion, guildID: guildIdArray, pfp: avatarURL, badges: usersBadges } }, 
                { new: true, upsert: true });
            })
            .then((finalScore) => {
                //console.log('Updated score:', finalScore);

                let streakText = "";
                if (updatedStreak > 1) {
                    streakText = `:fire: *Streak of ${updatedStreak}.*`;
                } 

                try {
                  wonEmbed = new EmbedBuilder()
                      .setTitle(`GG! ${usersTag} guessed "${answer[0]}" correctly!`)
                      .setColor(0x699857)
                      .setDescription(`:roller_coaster: They have been awarded **${creditWorth}** Credit(s)! ${streakText} ${newText} `)
                  m.reply({
                      embeds: [wonEmbed]
                  })
                  } catch (error) {
                      console.error(error);
                  }
              UpdateGuessModel();
              runningMap.set(channelId, "f");
          });
        }) // collector end

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
                streakNumMap.set(intGuildId, 0);
            }
            runningMap.set(channelId, "f");
        });
      });

        function UpdateGuessModel() {
            GuessModel.updateOne(
                {}, // filter object to match all documents
                {
                  $set: {
                    lastNumsE: oldNumbersE,
                    lastNumsM: oldNumbersM,
                    lastNumsH: oldNumbersH
                  }
                },
                (err, res) => {
                  if (err) {
                    console.log(err);
                  } else {
                    //console.log(res);
                  }
                }
              );
            }
        }
    }
}
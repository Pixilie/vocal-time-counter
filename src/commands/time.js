import { SlashCommandBuilder } from "@discordjs/builders";
import { Embed, EmbedBuilder } from "discord.js";
import { Logtail } from "@logtail/node";
import { getUser } from "../database.js";
import { timeFormatting, dateFormatting } from "../helpers.js";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("time")
  .setDescription("Detailed user profile.");

/**
* Get the time spent in voice channels by a user
* @param {Interaction} - The interaction object
* @returns {Embed} - The embed object
*/
async function getTime(interaction) {
  try {
    const databaseUser = await getUser(interaction.guild.id, interaction.user.username);

    if (databaseUser === null) {
      return "You have not joined any voice channels yet!";
    }

    const lastJoined = new Date(databaseUser.lastjoined * 1000);
    let joinedDate = interaction.guild.joinedTimestamp

    let formattedInfos = timeFormatting(databaseUser.time, joinedDate)

    const timeCommand = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${interaction.user.username}'s stats`)
      .setTimestamp()
      .setThumbnail(interaction.user.avatarURL())
      .addFields(
        {
          name: "Time spent in voice channels",
          value: `${formattedInfos.formattedTime} since the ${dateFormatting(joinedDate).formattedDate} - ${dateFormatting(joinedDate).difference} day(s) ago`,
        },
        {
          name: `Last time ${interaction.user.username} was in a voice channel`,
          value: `On ${lastJoined.getDate()}/${String(parseInt(lastJoined.getMonth()) + 1)}/${lastJoined.getFullYear()} at ${lastJoined.getHours()}:${lastJoined.getMinutes()}`,
        },
        {
          name: "Average time spent in voice channels",
          value: `${formattedInfos.avgTime}/day`
        },
      )
      .setFooter({
        text: "You need to quit the voice channel to update the time!",
        iconURL: interaction.guild.iconURL(),
      });
    return { state: 200, embeds: [timeCommand] };
  } catch (error) {
    return { state: 400, response: `There was an error while executing the command, please contact @pixilie with this code: ${Date.now()}`, error: error, code: Date.now() }
  }
}

/**
* Run the time command
* @param {Interaction} - The interaction object
* @returns {Interaction.reply} - Reply to the user's request
*/
async function run(interaction) {
  try {
    const response = await getTime(interaction);
    if (response.state === 200) {
      await interaction.reply(response);
    } else {
      await interaction.reply({ content: response.response, ephemeral: true, });
      logtail.error({ code: response.code, error: response.error })
    }
  } catch (error) {
    logtail.error({ code: Date.now(), error: error })
  }
}

export { COMMAND_DEFINITION, run };

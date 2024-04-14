import { SlashCommandBuilder } from '@discordjs/builders';
import { getUser } from '../database.mjs';
import { EmbedBuilder } from 'discord.js';

function roundDecimal(int, precision){
    var precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return Math.round( int*tmp )/tmp;
}

let COMMAND_DEFINITION = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Replies with the leaderboard of the time spent in voice channels!');

async function getLeaderboard(interaction) {
    const users = await getUser();

    const date = new Date();
    const startDate = 1713086240054;
    let difference = Math.round((date.getTime() - startDate)/(1000*3600*24))
    if (difference === 0) {
        difference = 1;
    }

    const leaderboardEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Leaderboard of time spent in voice channels')
    .setThumbnail(interaction.guild.iconURL())
    .setTimestamp()
    .addFields(
        users.map((user, index) => {
            return {
                name: `${index+1}. ${user.discordname}`,
                value: `${roundDecimal(parseInt(user.time)/3600, 2)} hours - Average: ${roundDecimal(parseInt(user.time)/3600, 2)/difference} hour(s)/day`
            }
        })
    )
    .setFooter({ text: 'You need to quit the voice channel to update the time!', iconURL: interaction.guild.iconURL() });
    return { embeds: [leaderboardEmbed] }
}

async function run(interaction) {
    const response = await getLeaderboard(interaction);
    await interaction.reply(response);
}

export { COMMAND_DEFINITION, run }
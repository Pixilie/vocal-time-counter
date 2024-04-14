import { SlashCommandBuilder } from '@discordjs/builders';
import { getUser } from '../database.mjs';
import { EmbedBuilder } from 'discord.js';

function roundDecimal(int, precision){
    var precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return Math.round( int*tmp )/tmp;
}

let COMMAND_DEFINITION = new SlashCommandBuilder()
    .setName('time')
    .setDescription('Replies with the time you have spent in voice channels!');

async function getTime(interaction) {
    const startDate = 1713086240054;
    const discordUser = interaction.user.username;
    const databaseUser = await getUser(discordUser);

    if (databaseUser === null) {
        return 'You have not joined any voice channels yet!';
    }

    const lastJoined = new Date(parseInt(databaseUser.lastjoined));
    const date = new Date();
    let difference = Math.round((date.getTime() - startDate)/(1000*3600*24))
    
    if (difference === 0) {
        difference = 1;
    }

    const timeCommand = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Time spent in voice channels')
    .setTimestamp()
    .setThumbnail(interaction.user.avatarURL())
    .addFields(
        {
            name: 'Time spent in voice channels',
            value: roundDecimal(parseInt(databaseUser.time)/3600, 2) + ' hours'
        },
        {
            name: `Last time ${discordUser} joined a voice channel`,
            value: lastJoined.getDate() + '/' + lastJoined.getMonth() + '/' + lastJoined.getFullYear() + ' ' + lastJoined.getHours() + ':' + lastJoined.getMinutes()
        },
        {
            name: 'Average time spent in voice channels',
            value: roundDecimal(parseInt(databaseUser.time)/3600, 2)/difference + ' hour(s)/day'
        }
    )
    .setFooter({ text: 'You need to quit the voice channel to update the time!', iconURL: interaction.guild.iconURL() });
    return { embeds: [timeCommand]}
}

async function run(interaction) {
    const response = await getTime(interaction);
    await interaction.reply(response);
}

export { COMMAND_DEFINITION, run }
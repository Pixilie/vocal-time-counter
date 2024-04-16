import { SlashCommandBuilder } from '@discordjs/builders';
import { getUser } from '../database.mjs';
import { EmbedBuilder } from 'discord.js';
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
    .setName('time')
    .setDescription('Replies with the time you have spent in voice channels!');

async function getTime(interaction) {
    try {
        const startDate = parseInt(process.env.START_DATE)*1000;
        const discordUser = interaction.user.username;
        const databaseUser = await getUser(discordUser);

        if (databaseUser === null) {
            return 'You have not joined any voice channels yet!';
        }

        const lastJoined = new Date(parseInt(databaseUser.lastjoined));
        const date = new Date();
        let difference = Math.round((date.getTime() - startDate)/(1000*3600*24))

        const hours = Math.floor(parseInt(databaseUser.time)/3600);
        const minutes = Math.floor((parseInt(databaseUser.time)%3600)/60);
        const seconds = parseInt(databaseUser.time)%60;
        let time = "";

        if (hours === 0) {
            time = minutes + 'min ' + seconds + 'sec';
        } else {
            time = hours + 'h ' + minutes + 'min ' + seconds + 'sec';
        }
        
        if (difference === 0) {
            difference = 1;
        }

        const avgHours = Math.floor(parseInt(databaseUser.time)/3600/difference);
        const avgMinutes = Math.floor((parseInt(databaseUser.time)%3600/difference)/60);
        const avgSeconds = (parseInt(databaseUser.time)/difference)%60;
        let avgTime = "";

        if (avgHours === 0) {
            avgTime = avgMinutes + 'min ' + avgSeconds + 'sec';
        } else {
            avgTime = avgHours + 'h ' + avgMinutes + 'min ' + avgSeconds + 'sec';
        }

        const timeCommand = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${discordUser}'s stats`)
        .setTimestamp()
        .setThumbnail(interaction.user.avatarURL())
        .addFields(
            {
                name: 'Time spent in voice channels',
                value: time
            },
            {
                name: `Last time ${discordUser} joined a voice channel`,
                value: 'On ' + lastJoined.getDate() + '/' + lastJoined.getMonth() + '/' + lastJoined.getFullYear() + ' at ' + lastJoined.getHours() + ':' + lastJoined.getMinutes()
            },
            {
                name: 'Average time spent in voice channels',
                value: avgTime + '/day'
            }
        )
        .setFooter({ text: 'You need to quit the voice channel to update the time!', iconURL: interaction.guild.iconURL() });
        return { embeds: [timeCommand]}
    } catch (error) {
        logtail.error(error);
    }
}

async function run(interaction) {
    const response = await getTime(interaction);
    if (response === null) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        return;
    } else {
        await interaction.reply(response);
    }
}

export { COMMAND_DEFINITION, run }
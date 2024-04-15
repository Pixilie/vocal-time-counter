import { SlashCommandBuilder } from '@discordjs/builders';
import { getUser } from '../database.mjs';
import { EmbedBuilder } from 'discord.js';
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

function roundDecimal(int, precision){
    var precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return Math.round( int*tmp )/tmp;
}

let COMMAND_DEFINITION = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Replies with the leaderboard of the time spent in voice channels!');

async function getLeaderboard(interaction) {
    try {
        const users = await getUser();

        const date = new Date();
        const startDate = parseInt(process.env.START_DATE)*1000;
        let difference = Math.round((date.getTime() - startDate)/(1000*3600*24))
        if (difference === 0) {
            difference = 1;
        }

        const leaderboardEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${interaction.guild.name}'s leaderboard`)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .addFields(
            users.map((user, index) => {

                const hours = Math.floor(parseInt(user.time)/3600);
                const minutes = Math.floor((parseInt(user.time)%3600)/60);
                const seconds = parseInt(user.time)%60;
                let time = "";

                if (hours === 0) {
                    time = minutes + 'min ' + seconds + 'sec';
                } else {
                    time = hours + 'h ' + minutes + 'min ' + seconds + 'sec';
                }

                const avgHours = Math.floor(parseInt(user.time)/3600/difference);
                const avgMinutes = Math.floor((parseInt(user.time)%3600/difference)/60);
                const avgSeconds = (parseInt(user.time)/difference)%60;
                let avgTime = "";

                if (avgHours === 0) {
                    avgTime = avgMinutes + 'min ' + avgSeconds + 'sec';
                } else {
                    avgTime = avgHours + 'h ' + avgMinutes + 'min ' + avgSeconds + 'sec';
                }

                return {
                    name: `${index+1}. ${user.discordname}`,
                    value: time + ' (' + avgTime + '/day)'
                }
            })
        )
        .setFooter({ text: 'You need to quit the voice channel to update the time!', iconURL: interaction.guild.iconURL() });
        return { embeds: [leaderboardEmbed] }
    } catch (error) {
        logtail.error(error);
    }
}

async function run(interaction) {
    const response = await getLeaderboard(interaction);
    if (response == null) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        return;
    }
    await interaction.reply(response);
}

export { COMMAND_DEFINITION, run }
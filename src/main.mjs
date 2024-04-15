import "dotenv/config"
import { REST, Routes, time } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';
import { newUser, getUser,  updateUser } from './database.mjs';
import * as pingCommand from './commands/ping.mjs';
import * as timeCommand from './commands/time.mjs';
import * as leaderboardCommand from './commands/leaderboard.mjs';
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const commands = [
    pingCommand.COMMAND_DEFINITION,
    timeCommand.COMMAND_DEFINITION,
    leaderboardCommand.COMMAND_DEFINITION
].map((command) => command.toJSON());
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  logtail.error(error);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	switch (interaction.commandName) {
		case 'ping':
			pingCommand.run(interaction);
			break;
        case 'time':
            timeCommand.run(interaction);
            break;
        case 'leaderboard':
            leaderboardCommand.run(interaction);
            break;
		default:
			break;
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {

    if (newState.channelId === null) {
        try {
            const discordUser = oldState.member.user.username;
            const lastLeft = new Date().getTime() / 1000;

            Promise.all([getUser(discordUser)]) .then((values) => {
                updateUser(discordUser, lastLeft, parseInt(values[0].time) + parseInt((lastLeft - parseInt(values[0].lastjoined)/1000)));   
            });
        } catch (error) {
            logtail.error(error);
        }

    } else if (oldState.channelId === null){
        try {
            const discordUser = newState.member.user.username;
            const lastJoined = new Date().getTime();

            Promise.all([getUser(discordUser)]).then((values) => {
                if (values[0] === null) {
                    newUser(discordUser, lastJoined);
                } else {
                    updateUser(discordUser, lastJoined, 0);
                }
            });
        } catch (error) {
            logtail.error(error);
        }
    } else {
        logtail.warn("Untracked voice state change detected.");
    }

});


client.login(process.env.TOKEN);

export { client };
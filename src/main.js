import "dotenv/config"
import { REST, Routes } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';
import  * as ping from './commands/ping.js';
import * as vocalCheck from './vocalCheck.js';
import { newUser, getUser,  updateUser } from './database.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

const commands = [
    ping.COMMAND_DEFINITION
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    vocalCheck.fetchVoiceChannels();
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	switch (interaction.commandName) {
		case 'ping':
			ping.run(interaction);
			break;
		default:
			break;
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {

    if (newState.channelId === null) {

        const discordUser = oldState.member.user.username;
        const lastLeft = new Date().getTime() / 1000;

        Promise.all([getUser(discordUser).lastjoined, getUser(discordUser).time]) .then((values) => {
            updateUser(discordUser, values[0], values[1] + (lastLeft - values[0]));   
        });

    } else {

        const discordUser = newState.member.user.username;
        const lastJoined = new Date().getTime() / 1000;

        Promise.all([getUser(discordUser)]).then((values) => {
            if (values[0] === null) {
                newUser(discordUser, lastJoined);
            } else {
                updateUser(discordUser, lastJoined, null);
            }
        });
    }
});


client.login(process.env.TOKEN);

export { client };
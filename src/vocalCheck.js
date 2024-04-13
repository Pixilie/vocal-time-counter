import { REST, Routes } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';
import { client } from './main.js';

const voiceChannelsID = ["992821770451165234", "981529250500845568", "1043668740002304040"]
let channelsInfo = [];

function fetchVoiceChannels() {
    for (let id of voiceChannelsID) {
        let channel = client.channels.cache.get(id);
        if (channel) {
            channelsInfo.push(channel);
        }
    }
}

export { fetchVoiceChannels, channelsInfo };
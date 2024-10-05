import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import { newServer, getServer } from "../database.js";
import { Logging } from "../helpers.js";

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("register")
  .setDescription(
    "BE CAREFUL! - Administrator reserved command to register a new server on the database.",
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * Execute the /ping command
 * @param {Interaction} interaction - The interaction object
 * @returns {InteractionResponse} - Reply to the user's request
 */
async function run(interaction) {
  try {
    let server = await getServer(interaction.guild.id);
    if (server === null) {
      await newServer(interaction.guild.id, new Date().getTime());

      await interaction.reply({
        content: `Server successfuly registered`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `This server is already in the database.`,
        ephemeral: true,
      });
    }
  } catch (error) {
    Logging.error({ code: Date.now(), error: error });
    await interaction.reply({
      content: `There was an error while executing the command, please contact an administrator with this code: ${Date.now()}`,
      ephemeral: true,
    });
  }
}

export { COMMAND_DEFINITION, run };

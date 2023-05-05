import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import util from "util";
import { exec } from "child_process";
const execPromise = util.promisify(exec);
import { logger } from "../utils/LoggingHelper.js";

async function gitPull() {
    try {
        const { stdout, stderr } = await execPromise('git pull');

        stderr ? logger.error(stderr) : logger.info(stdout)

        return true;
    } catch (e) {
        logger.error(e);

        return false;
    }
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Pull latest code and then restart'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await gitPull()
            .then(success => {
                if (success) {
                    interaction.reply('Successfully pulled, restarting...');

                    setTimeout(() => process.exit(), 3000);
                } else {
                    interaction.reply('Unable to perform git pull operation.');
                }
            });
    },
};

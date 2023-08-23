import { client } from "../index.js";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, User } from "discord.js";
import { v4 as uuid } from 'uuid';
import { FileBasePaths } from "../constants/FileBasepaths.js";
import { getFilePath, exists, join } from '../repository/FileRepo.js';
import { create } from '../repository/MiMaMuRepo.js';
import { MiMaMuPromptModal, customIds } from "../components/mimamu/index.js";
import { MidjourneyStyles } from '../constants/MidjourneyStyles.js';
import { logger } from "../utils/LoggingHelper.js";

type UpscalePick = '1' | '2' | '3' | '4';
export type MidjourneyOptions = {
    style: string;
    chaos?: number
    weird?: number
};
const INTERACTION_TIMEOUT = 900_000;
const MIMAMU_BASE_PATH = getFilePath(FileBasePaths.MiMaMu);
const BASE_URL = 'http://localhost:3001';
const headers = new Headers({ 'Content-Type': 'application/json' });

export async function imagine({ answer, user, options }: { answer: string, user: User, options: MidjourneyOptions }) {
    const params = buildParameters(options);

    const data = { id: uuid(), prompt: `${answer} ${params}` };

    await fetch(`${BASE_URL}/imagine`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    })
        .then(async res => {
            if (!res.ok) {
                await client.users.send(user.id, 'Your request could not be processed');
                return;
            }

            let resolved = false;
            while (!resolved) {
                const response = await fetch(`${BASE_URL}/status/${data.id}`);

                if (!response.ok) {
                    resolved = true;
                    return;
                }

                const status = await response.text();

                if (status === 'completed' || status === 'failed')
                    resolved = true;

                const timer = (ms: number) => new Promise(res => setTimeout(res, ms));
                await timer(3_000);
            }

            const path = join(MIMAMU_BASE_PATH, data.id, 'imagine.png');
            if (!exists(path)) {
                await client.users.send(user.id, 'The image you requested could not be generated');
                return;
            }

            const file = new AttachmentBuilder(path);

            const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();
            const row2: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('upscale-1')
                    .setLabel('U1')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('↖️'),
                new ButtonBuilder()
                    .setCustomId('upscale-2')
                    .setLabel('U2')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('↗️'),
                new ButtonBuilder()
                    .setCustomId('upscale-3')
                    .setLabel('U3')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('↙️'),
                new ButtonBuilder()
                    .setCustomId('upscale-4')
                    .setLabel('U4')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('↘️'),
            );

            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId('delete')
                    .setLabel('Delete prompt')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⚠'),
            );

            const message = await client.users.send(user.id, {
                content: 'Choose an image to upscale',
                files: [file],
                components: [row, row2]
            });

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: INTERACTION_TIMEOUT });

            collector.on('collect', async btnInteraction => {
                if (btnInteraction.customId === 'delete') {
                    await message.delete();
                    return;
                }

                const pick = getPickedUpscale(btnInteraction.customId);
                const modal = MiMaMuPromptModal(answer);
                btnInteraction.showModal(modal);

                const filter = (cld) => cld.customId === customIds.promptModalId;
                btnInteraction.awaitModalSubmit({ filter, time: INTERACTION_TIMEOUT })
                    .then(async submitInteraction => {
                        const fields = submitInteraction.fields;
                        const prompt = fields.getTextInputValue(customIds.promptCreateId);

                        const result = await handlePromptModalSubmit({ id: data.id, answer, prompt, author: user.username });

                        if (result.success) {
                            collector.stop();

                            await upscale({ id: data.id, pick: pick });
                        }
                        await submitInteraction.reply(result.msg);
                    })
                    .catch(err => logger.error(err));
            });

            collector.on('end', async btnInteraction => {
                message.edit({
                    content: 'Choose an image to upscale',
                    files: [file],
                    components: []
                });
            });
        })
        .catch(err => logger.error(err));
}

export async function upscale({ id, pick }: { id: string, pick: UpscalePick }) {
    const data = { id, pick };

    await fetch(`${BASE_URL}/upscale`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    }).catch(err => logger.error(err));
}

async function handlePromptModalSubmit({ id, answer, prompt, author }:
    { id: string, answer: string, prompt: string, author: string }):
    Promise<{ success: boolean, msg: string }> {
    const splitPrompt = prompt.split(' ').filter(x => x !== '');
    const splitAnswer = answer.split(' ').filter(x => x !== '');
    const errors: string[] = [];

    if (splitAnswer.length !== splitPrompt.length) {
        errors.push('Entered prompt must have the same number of words as original prompt');
    }

    if (!prompt.includes('*')) {
        errors.push('Entered prompt must include at least one hidden word.');
    }

    let isWordMismatch = false;
    for (let i = 0; i < splitAnswer.length; i++) {
        if (splitPrompt[i] === undefined) continue;
        if (splitPrompt[i] !== splitAnswer[i] && !splitPrompt[i].includes('*')) {
            isWordMismatch = true;
        }
    }

    if (isWordMismatch) {
        errors.push('Entered prompt does not match original answer. Make sure to only replace words with an * and leave all other words exactly as they are.');
    }

    const isValidPrompt = errors.length === 0;

    if (!isValidPrompt) {
        errors.unshift('**Errors found:**');
        return {
            success: false,
            msg: errors.join('\n- ')
        };
    }
    else {
        const isCreateSuccess = await create({ id, answer, prompt, author });

        if (!isCreateSuccess) {
            return {
                success: false,
                msg: 'Prompt creation failed. Prompt limit may have been reached.'
            };
        }

        return {
            success: true,
            msg: 'Your submission was received successfully!'
        };
    }
}

function getPickedUpscale(customId: string): UpscalePick {
    switch (customId.slice(-1)) {
        case '1':
            return '1';
        case '2':
            return '2';
        case '3':
            return '3';
        case '4':
            return '4';
    }
}

function buildParameters(options: MidjourneyOptions): string {
    let style = '';
    let chaos = '';
    let weird = '';

    switch (options.style) {
        case MidjourneyStyles.MJ_RAW:
            style = '--style raw';
            break;
        case MidjourneyStyles.NIJI_DEFAULT:
            style = '--niji 5';
            break;
        case MidjourneyStyles.NIJI_CUTE:
            style = '--niji 5 --style cute';
            break;
        case MidjourneyStyles.NIJI_SCENIC:
            style = '--niji 5 --style scenic';
            break;
        case MidjourneyStyles.NIJI_EXPRESSIVE:
            style = '--niji 5 --style expressive';
            break;
        case MidjourneyStyles.MJ_DEFAULT:
        default:
            break;
    }

    if (options.chaos)
        chaos = `--c ${options.chaos}`;
    if (options.weird)
        weird = `--w ${options.weird}`;

    return (`${style} ${chaos} ${weird}`).trim();
}

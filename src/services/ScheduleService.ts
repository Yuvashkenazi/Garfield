import { client } from "../index.js";
import moment from "moment-timezone";
import schedule from 'node-schedule';
import { WordRate } from "../constants/WordRate.js";
import { YoutubeLinks } from "../constants/YoutubeLinks.js";
import { MorningSongs } from "../constants/MorningSongs.js";
import { MondayQuotes } from "../constants/MondayQuotes.js";
import { sendComicVote } from "./VoteService.js";
import { birthdayCheck } from "./BirthdayService.js";
import { sendWord } from "./RandomWordService.js";
import { checkTemp } from "./TemperatureService.js";
import { playMiMaMu, resetMiMaMu, deleteDeactivatedImages } from "./MiMaMuService.js";

type RecurringOptions = {
    name: string,
    second?: number | undefined,
    minute?: number | undefined,
    hour?: number | undefined,
    date?: number | undefined,
    month?: number | undefined,
    year?: number | undefined,
    dayOfWeek?: number | undefined,
}


export function startScheduledJobs() {
    scheduleJob({ name: 'minute-start', second: 0 }, () => {
        const localized = moment().tz('America/Chicago');

        console.log(`minute-start: Ran at ${localized.format('h:mm:ss a')}`);

        sendWord(client.theChannel, WordRate[client.wordRate]);
    });
    scheduleJob({ name: 'comic-vote', hour: client.voteStartTime, minute: 0, second: 0 }, async () => {
        if (client.isVoteOn) {
            await sendComicVote();
        }
    });
    scheduleJob({ name: 'mimamu', hour: client.MiMaMuStartTime, minute: 0, second: 0 }, async () => {
        if (client.isMiMaMuOn) {
            await resetMiMaMu();

            await playMiMaMu();
        }
    });
    scheduleJob({ name: 'day-start', hour: 0, minute: 0, second: 0 }, async () => {
        const localized = moment().tz('America/Chicago');

        console.log(`day-start: Ran at ${localized.format('h:mm:ss a')}`);

        await deleteDeactivatedImages();

        birthdayCheck(client.theChannel, localized);
    });
    scheduleJob({ name: 'early-morning', hour: 5, minute: 0, second: 0 }, () => {
        if (client.isMorningSongsOn) {
            const chosenSong = MorningSongs[Math.floor((MorningSongs.length - 1) * Math.random())];
            client.theChannel.send(chosenSong);
        }
    });
    scheduleJob({ name: 'morning', hour: 8, minute: 0, second: 0 }, async () => {
        const temp = await checkTemp();

        client.theSpamChannel.send(`My temp: ${temp.main.toFixed(2)}°C`);
    });
    scheduleJob({ name: 'monday-morning', dayOfWeek: 1, hour: 6, minute: 0, second: 0 }, () => {
        const chosenQuote = MondayQuotes[Math.floor((MondayQuotes.length - 1) * Math.random())];
        client.theChannel.send(chosenQuote);
    });
    scheduleJob({ name: 'five-five-five', date: 5, hour: 17, minute: 55, second: 0 }, () => {
        client.musicalChannel.send(YoutubeLinks.galoSengen);
    });
}

function scheduleJob({
    name,
    second = undefined,    // (0-59)
    minute = undefined,    // (0-59)
    hour = undefined,      // (0-23)
    date = undefined,      // (1-31)
    month = undefined,     // (0-11)
    year = undefined,      // 
    dayOfWeek = undefined, // (0-6) Starting with Sunday
}: RecurringOptions, cb: schedule.JobCallback): schedule.Job {
    const rule = new schedule.RecurrenceRule();
    if (typeof second !== 'undefined') rule.second = second;
    if (typeof minute !== 'undefined') rule.minute = minute;
    if (typeof hour !== 'undefined') rule.hour = hour;
    if (typeof date !== 'undefined') rule.date = date;
    if (typeof month !== 'undefined') rule.month = month;
    if (typeof year !== 'undefined') rule.year = year;
    if (typeof dayOfWeek !== 'undefined') rule.dayOfWeek = dayOfWeek;
    rule.tz = 'US/Central'

    return schedule.scheduleJob(name, rule, cb);
}

import { client } from "../index.js";
import moment from "moment-timezone";
import { WordRate } from "../constants/WordRate.js";
import { YoutubeLinks } from "../constants/YoutubeLinks.js";
import { MorningSongs } from "../constants/MorningSongs.js";
import { MondayQuotes } from "../constants/MondayQuotes.js";
import { sendComicVote } from "../services/VoteService.js";
import { birthdayCheck } from "../services/BirthdayService.js";
import { sendWord } from "../services/RandomWordService.js";
import { nextManga } from "../services/MangaService.js";
import { checkTemp } from "../services/TemperatureService.js";
import { playMiMaMu, resetMiMaMu, deleteDeactivatedImages } from "./MiMaMuService.js";

let intervalID = null;
const intervalPeriod = 60000;

export function restartInterval() {
    stopInterval();

    startInterval();
}

function stopInterval() {
    clearInterval(intervalID);
}

function startInterval() {
    intervalID = setInterval(
        onInterval,
        intervalPeriod
    );
}

async function onInterval() {
    const localized = moment().tz('America/Chicago');
    const currentTime = localized.format('dddd, h:mm a');
    const currentHrMin = localized.format('h:mm a');
    const currentHr = localized.format('h');
    const currentMin = localized.format('mm');
    const currentDayOfMonth = localized.date();

    const hrNumber = parseInt(currentHr);

    sendWord(client.theChannel, WordRate[client.wordRate]);

    if (currentHrMin === '12:01 am') {
        if (currentDayOfMonth === 1) await deleteDeactivatedImages();

        birthdayCheck(client.theChannel, localized);
    }

    if (currentTime === 'Monday, 6:00 am') {
        const chosenQuote = MondayQuotes[Math.floor((MondayQuotes.length - 1) * Math.random())];
        client.theChannel.send(chosenQuote);
    }

    if (client.isMorningSongsOn && currentHrMin === '5:00 am') {
        const chosenSong = MorningSongs[Math.floor((MorningSongs.length - 1) * Math.random())];
        client.theChannel.send(chosenSong);
    }

    if (currentDayOfMonth === 5 && currentHrMin === '5:55 pm') {
        client.musicalChannel.send(YoutubeLinks.galoSengen);
    }

    if (currentHrMin === '8:00 am') {
        const temp = await checkTemp();

        client.theSpamChannel.send(`My temp: ${temp.main.toFixed(2)}°C`);
    }

    if (client.isMangaOn
        && hrNumber % 2 === 0
        && currentMin === '00') {
        nextManga(client.mangaChannel);
    }

    if (client.isVoteOn && currentHrMin === client.voteStartTime) {
        await sendComicVote();
    }

    if (client.isMiMaMuOn && currentHrMin === client.MiMaMuStartTime) {
        await resetMiMaMu();

        await playMiMaMu();
    }
}

import { TextChannel } from 'discord.js';
import { Moment } from 'moment-timezone';
import { BirthdayData, birthdays } from "../constants/Birthdays.js";

export function birthdayCheck(ch: TextChannel, moment: Moment) {
    for (const user of birthdays) {
        if (isUserBirthday(user, moment)) {
            const age = moment.year() - user.birthday.getFullYear();

            sendBirthdayMessage(ch, user.id, age, user.birthdayGif)
        }
    }
}

function sendBirthdayMessage(ch: TextChannel, userId: string, age: number, gif: string) {
    ch.send(`
    Happy birthday <@${userId}>!
    
    You are now ${age} years old.

    ${gif}
    `);
}

function isUserBirthday(user: BirthdayData, moment: Moment) {
    const birthday = user.birthday;

    return birthday.getMonth() === moment.month() &&
        birthday.getDate() === moment.date();
}

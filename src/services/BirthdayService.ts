import { TextChannel, User } from 'discord.js';
import { Moment } from 'moment-timezone';
import { getAll } from '../services/UserService.js';
import { searchGif } from '../services/giphyService.js';
import { UserModel } from '../models/UserModel.js';

export async function birthdayCheck(ch: TextChannel, moment: Moment) {
    const users = await getAll();
    for (const user of users) {
        const birthday = new Date(user.birthday);
        if (isUserBirthday(user, moment)) {
            const age = moment.year() - birthday.getFullYear();

            const gif = await searchGif(`happy birthday ${user.username}`);

            sendBirthdayMessage(ch, user.id, age, gif)
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

function isUserBirthday(user: UserModel, moment: Moment) {
    const birthday = new Date(user.birthday);

    return birthday.getMonth() === moment.month() &&
        birthday.getDate() === moment.date();
}

import { Sequelize } from 'sequelize';
import { User as DiscordUser } from 'discord.js';
import { User } from "./DatabaseRepo.js";
import { UserModel } from '../models/index.js';
import { logger } from "../utils/LoggingHelper.js";

export async function newUsersCheck(users: DiscordUser[]): Promise<void> {
  const currentUsers = await User.findAll()
    .then(data => data.map(x => x.toJSON()))
    .catch(err => {
      logger.error(err);
      return [];
    });

  const newUsers = users.filter(user => currentUsers.every(currentUser => currentUser.id !== user.id));

  if (newUsers.length === 0) return;

  newUsers.map(async x =>
    await User.create({
      id: x.id,
      username: x.username,
      gameStarted: false,
      answer: '',
      attempts: 0,
      dailyMiMaMuGuess: '',
      dailyMiMaMuGuessCount: 0
    })
      .catch(err => logger.error(err))
  );
}

export async function findAll({ orderBy }: { orderBy?: keyof UserModel }): Promise<UserModel[]> {
  return await User.findAll({
    where: {},
    order: [Sequelize.fn('lower', Sequelize.col(orderBy))]
  })
    .then(data => data.map(x => x.toJSON()))
    .catch(err => {
      logger.error(err);
      return [];
    });
}

export async function find(id: string): Promise<UserModel | void> {
  return await User.findOne({
    where: { id }
  })
    .then(data => data.toJSON())
    .catch(err => {
      logger.error(err);
    });
}

export async function updateMastermindData({ id, gameStarted, answer, attempts }:
  { id: string, gameStarted: boolean, answer: string, attempts: number }): Promise<number | void> {
  return await User.update({
    gameStarted,
    answer,
    attempts
  }, {
    where: { id }
  })
    .then(data => data[0])
    .catch(err => {
      logger.error(err);
    });
}

export async function resetDailyMiMaMuGuesses() {
  await User.update({
    dailyMiMaMuGuess: ''
  }, { where: {} })
    .catch(err => logger.error(err));
}

export async function updateLatestMiMaMuGuess({ id, guess }: { id: string, guess: string }): Promise<void> {
  await User.update({ dailyMiMaMuGuess: guess }, { where: { id } })
}

export async function resetDailyMiMaMuGuessCount() {
  await User.update({
    dailyMiMaMuGuessCount: 0
  }, { where: {} })
    .catch(err => logger.error(err));
}

export async function incrementDailyMiMaMuGuessCount({ id }: { id: string }): Promise<void> {
  await User.increment('dailyMiMaMuGuessCount', { where: { id } })
    .catch(err => logger.error(err));
}

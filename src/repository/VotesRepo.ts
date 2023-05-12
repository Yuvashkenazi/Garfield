import { Vote } from './DatabaseRepo.js';
import { VoteModel } from '../models/index.js';
import { logger } from '../utils/LoggingHelper.js';

export async function getVotes(): Promise<VoteModel | void> {
  return await Vote.findOrCreate({
    where: {},
    defaults: {
      comic1Name: '',
      comic2Name: '',
      comic1Score: 0,
      comic2Score: 0,
      ties: 0
    }
  })
    .then(data => data[0].toJSON())
    .catch(err => {
      logger.error(err);
    });
}

export async function updateNames({ comic1, comic2 }): Promise<number | void> {
  return await Vote.update({
    comic1Name: comic1,
    comic2Name: comic2
  }, {
    where: {}
  })
    .then(data => data[0])
    .catch(err => {
      logger.error(err);
    });
}

export async function updateScore({ comic1, comic2, ties }): Promise<number | void> {
  return await Vote.update({
    comic1Score: comic1,
    comic2Score: comic2,
    ties
  }, {
    where: {}
  })
    .then(data => data[0])
    .catch(err => {
      logger.error(err);
    });
}

export async function resetVotes(): Promise<number | void> {
  return await Vote.update({
    comic1Score: 0,
    comic2Score: 0,
    ties: 0
  }, {
    where: {}
  })
    .then(data => data[0])
    .catch(err => {
      logger.error(err);
    });
}

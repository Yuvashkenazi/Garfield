import { Sequelize } from 'sequelize';
import { MiMaMu } from './DatabaseRepo.js';
import { MiMaMuModel } from '../models/index.js';
import { logger } from '../utils/LoggingHelper.js';

export async function findAll({ orderBy }: { orderBy?: keyof MiMaMuModel }): Promise<MiMaMuModel[]> {
  return await MiMaMu.findAll({
    where: { isActive: true },
    order: [Sequelize.fn('lower', Sequelize.col(orderBy))]
  })
    .then(data => data.map(x => x.toJSON()))
    .catch(err => {
      logger.error(err);
      return [];
    });
}

export async function find({ id }: { id: string }): Promise<MiMaMuModel | void> {
  return await MiMaMu.findOne({ where: { id } })
    .then(data => data.toJSON())
    .catch(err => {
      logger.error(err);
    });
}

export async function getRandom(): Promise<MiMaMuModel | void> {
  return await MiMaMu.findOne({
    order: Sequelize.fn('RANDOM'),
    where: { isActive: true }
  })
    .then(data => data.toJSON())
    .catch(err => {
      logger.error(err);
    });
}

export async function getDeactivated(): Promise<MiMaMuModel[]> {
  return await MiMaMu.findAll({ where: { isActive: false } })
    .then(data => data.map(x => x.toJSON()))
    .catch(err => {
      logger.error(err);
      return [];
    });
}

export async function create({ answer, prompt, author }: { answer: string, prompt: string, author: string }): Promise<MiMaMuModel> {
  const allowed = await isCreationAllowed();

  const errObj: MiMaMuModel = { id: undefined, answer: '', prompt: '', author: '', creationDate: 0, isActive: false };

  if (!allowed) return errObj;

  return await MiMaMu.create({
    answer,
    prompt,
    author,
    creationDate: Date.now()
  })
    .then(data => data.toJSON())
    .catch(err => {
      logger.error(err)
      return errObj;
    });
}

export async function getActiveCount(): Promise<number> {
  return await MiMaMu.count({ where: { isActive: true } })
    .catch(err => {
      logger.error(err);
      return undefined;
    });
}

export async function isCreationAllowed(): Promise<boolean> {
  const SERVER_PROMPT_LIMIT = 30;

  const count = await getActiveCount()

  if (count === undefined) return false;

  return count < SERVER_PROMPT_LIMIT;
}

export async function deactivate({ id }: { id: string }): Promise<number | void> {
  return await MiMaMu.update({ isActive: false }, { where: { id } })
    .then(data => data[0])
    .catch(err => {
      logger.error(err);
    });
}

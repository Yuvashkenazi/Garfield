import { Nickname } from "./DatabaseRepo.js";
import { NicknameModel } from '../models/index.js';
import { logger } from "../utils/LoggingHelper.js";

export async function addNickname({ userId, nickname }: { userId: string, nickname: string }): Promise<NicknameModel | void> {
  return await Nickname.create({ userId, nickname, dateSet: Date.now() })
    .then(data => data && data.toJSON())
    .catch(err => {
      logger.error(err);
    });
}

export async function getNicknames({ userId }: { userId: string }): Promise<NicknameModel[]> {
  return await Nickname.findAll({ where: { userId }, order: ['dateSet'] })
    .then(data => data.map(x => x.toJSON()))
    .catch(err => {
      logger.error(err);
      return [];
    });
}

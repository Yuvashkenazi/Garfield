import { Settings } from "./DatabaseRepo.js";
import { SettingsModel } from '../models/index.js';
import { WordRate } from "../constants/WordRate.js";
import { ReactionRate } from "../constants/ReactionRate.js";
import { logger } from "../utils/LoggingHelper.js";

enum BoolSettings {
  isVoteOn,
  isMiMaMuOn,
  isMangaOn,
  isMorningSongsOn
}

export async function getSettings(): Promise<SettingsModel | void> {
  return await Settings.findOrCreate({
    where: {},
    defaults: {
      wordRate: WordRate.SLOW,
      reactionRate: ReactionRate.SLOW,
      isVoteOn: true,
      voteStartTime: '7:00 pm',
      isMiMaMuOn: true,
      MiMaMuStartTime: '7:00 pm',
      isMangaOn: false,
      isMorningSongsOn: false,
      MiMaMuNumber: 1,
      ChatTheme: ''
    }
  })
    .then(data => data[0].toJSON())
    .catch(err => {
      logger.error(err);
    });
}

export async function setWordRate(rate: WordRate): Promise<number> {
  return await Settings.update({
    wordRate: rate
  }, {
    where: {}
  })
    .then(data => data[0])
    .catch(err => {
      logger.error(err)
      return undefined;
    });
}

export async function setReactionRate(rate: ReactionRate): Promise<number> {
  return await Settings.update({
    reactionRate: rate
  }, {
    where: {}
  })
    .then(data => data[0])
    .catch(err => {
      logger.error(err)
      return undefined;
    });
}

async function toggleSetting(field: BoolSettings): Promise<boolean> {
  const settings = await getSettings();

  if (!settings) return false;

  let toggled = false;
  const updateObj: Partial<SettingsModel> = {};
  switch (field) {
    case BoolSettings.isVoteOn:
      toggled = !settings.isVoteOn;
      updateObj.isVoteOn = toggled;
      break;
    case BoolSettings.isMangaOn:
      toggled = !settings.isMangaOn;
      updateObj.isMangaOn = toggled;
      break;
    case BoolSettings.isMiMaMuOn:
      toggled = !settings.isMiMaMuOn;
      updateObj.isMiMaMuOn = toggled;
      break;
    case BoolSettings.isMorningSongsOn:
      toggled = !settings.isMorningSongsOn;
      updateObj.isMorningSongsOn = toggled;
      break;
    default:
      toggled = false;
  }

  await Settings.update(updateObj, {
    where: {}
  })
    .catch(err => logger.error(err));

  return toggled;
}

export async function toggleManga(): Promise<boolean> {
  return await toggleSetting(BoolSettings.isMangaOn);
}

export async function toggleVote() {
  return await toggleSetting(BoolSettings.isVoteOn);
}

export async function toggleMiMaMu() {
  return await toggleSetting(BoolSettings.isMiMaMuOn);
}

export async function toggleMorningSongs() {
  return await toggleSetting(BoolSettings.isMorningSongsOn);
}

export async function incrementMiMaMuNumber() {
  await Settings.increment('MiMaMuNumber', { where: {} })
    .catch(err => logger.error(err));
}

export async function setDailyMiMaMuId({ id }) {
  await Settings.update({
    dailyMiMaMuId: id
  }, { where: {} })
    .catch(err => logger.error(err));
}

export async function setChatTheme({ theme }: { theme: string }) {
  await Settings.update({
    ChatTheme: theme
  }, { where: {} })
    .catch(err => logger.error(err));
}

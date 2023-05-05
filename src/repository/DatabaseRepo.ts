import { Sequelize, Options, DataTypes, Model } from 'sequelize';
import { getFilePath } from '../repository/FileRepo.js';
import { FileBasePaths } from '../constants/FileBasepaths.js';
import { WordRate } from '../constants/WordRate.js';
import { ReactionRate } from '../constants/ReactionRate.js';
import {
    MangaChapterModel,
    MangaModel,
    MiMaMuModel,
    SettingsModel,
    UserModel,
    NicknameModel,
    VoteModel
} from '../models/index.js';
import { logger } from '../utils/LoggingHelper.js';

const dbPath = getFilePath(FileBasePaths.Data, 'sqlite.db');

const options: Options = {
    logging: false,
    dialect: 'sqlite',
    storage: dbPath
};

const sequelize = new Sequelize(options);

export class Settings extends Model<SettingsModel> { }
export class User extends Model<UserModel> { }
export class Nickname extends Model<NicknameModel> { }
export class Vote extends Model<VoteModel> { }
export class Manga extends Model<MangaModel> { }
export class MangaChapter extends Model<MangaChapterModel> { }
export class MiMaMu extends Model<MiMaMuModel> { }

Settings.init({
    wordRate: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: WordRate.SLOW
    },
    reactionRate: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ReactionRate.SLOW
    },
    isVoteOn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    voteStartTime: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '7:00 pm'
    },
    isMiMaMuOn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    MiMaMuStartTime: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '7:00 pm'
    },
    dailyMiMaMuId: {
        type: DataTypes.UUID,
    },
    isMangaOn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isMorningSongsOn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    MiMaMuNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, { sequelize });

User.init({
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gameStarted: {
        type: DataTypes.BOOLEAN
    },
    answer: {
        type: DataTypes.STRING
    },
    attempts: {
        type: DataTypes.INTEGER
    },
    dailyMiMaMuCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    dailyMiMaMuGuess: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    dailyMiMaMuGuessCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, { sequelize });

Nickname.init({
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateSet: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, { sequelize });

Vote.init({
    comic1Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    comic2Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    comic1Score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comic2Score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ties: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { sequelize });

Manga.init({
    name: {
        type: DataTypes.STRING
    },
    chapter: {
        type: DataTypes.INTEGER
    },
    page: {
        type: DataTypes.INTEGER
    }
}, { sequelize });

MangaChapter.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize });

MiMaMu.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prompt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creationDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    }
}, { sequelize });

export async function initDB() {
    try {
        await sequelize.authenticate();
        logger.info('Connection has been established successfully.');

        await sequelize.sync({ alter: true });
        logger.info('Tables have been synced');
    } catch (error) {
        logger.error(`Unable to connect to the database: ${error}`);
    }
}

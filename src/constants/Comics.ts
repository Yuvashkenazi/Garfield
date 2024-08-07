import { findComic } from "../services/ComicService";
import { randomFalseKnees } from "../services/FalseKneesService";
import { randomPoorlyDrawn } from "../services/PoorlyDrawnService";

const date = new Date();

export type ComicDate = {
    year: number;
    month: number;
    day: number;
}

export type ComicInfo = {
    displayName: string,
    urlName: string,
    start?: ComicDate;
    end?: ComicDate;
    getRandom: () => Promise<string>;
}

const current: ComicDate = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
};

export const Garfield: ComicInfo = {
    displayName: 'Garfield',
    urlName: 'garfield',
    start: {
        year: 1978,
        month: 6,
        day: 19
    },
    end: current,
    getRandom: async () => await findComic(Garfield.urlName)
}

export const Calvin: ComicInfo = {
    displayName: 'Calvin and Hobbes',
    urlName: 'calvinandhobbes',
    start: {
        year: 1985,
        month: 11,
        day: 18
    },
    end: current,
    getRandom: async () => await findComic(Calvin.urlName)
};

export const Fuzzy: ComicInfo = {
    displayName: 'Get Fuzzy',
    urlName: 'getfuzzy',
    start: {
        year: 1999,
        month: 9,
        day: 6
    },
    end: current,
    getRandom: async () => await findComic(Fuzzy.urlName)
};

export const BloomCounty: ComicInfo = {
    displayName: 'Bloom County',
    urlName: 'bloomcounty',
    start: {
        year: 1980,
        month: 12,
        day: 8
    },
    end: current,
    getRandom: async () => await findComic(BloomCounty.urlName)
};

export const Pearls: ComicInfo = {
    displayName: 'Pearls Before Swine',
    urlName: 'pearlsbeforeswine',
    start: {
        year: 2002,
        month: 1,
        day: 7
    },
    end: current,
    getRandom: async () => await findComic(Pearls.urlName)
};

export const Nancy: ComicInfo = {
    displayName: 'Nancy',
    urlName: 'nancy',
    start: {
        year: 1948,
        month: 1,
        day: 5
    },
    end: current,
    getRandom: async () => await findComic(Nancy.urlName)
};

export const Peanuts: ComicInfo = {
    displayName: 'Peanuts',
    urlName: 'peanuts',
    start: {
        year: 1950,
        month: 10,
        day: 2
    },
    end: current,
    getRandom: async () => await findComic(Peanuts.urlName)
};

export const Marmaduke: ComicInfo = {
    displayName: 'Marmaduke',
    urlName: 'marmaduke',
    start: {
        year: 1996,
        month: 12,
        day: 30
    },
    end: current,
    getRandom: async () => await findComic(Marmaduke.urlName)
};

export const FalseKnees: ComicInfo = {
    displayName: 'False Knees',
    urlName: 'false-knees',
    getRandom: randomFalseKnees
};

export const PoorlyDrawnLines: ComicInfo = {
    displayName: 'Poorly Drawn Lines',
    urlName: 'poorly-drawn-lines',
    getRandom: randomPoorlyDrawn
};

export const Comics = {
    Garfield,
    Calvin,
    Fuzzy,
    BloomCounty,
    Pearls,
    Nancy,
    Peanuts,
    Marmaduke,
    FalseKnees,
    PoorlyDrawnLines
}

export const getComicDisplayName = (urlName: string): string => {
    if (!urlName) return '';

    const comicList = Object.values(Comics).map(x => {
        return { name: x.displayName, value: x.urlName };
    });

    return comicList.find(x => x.value === urlName).name;
}

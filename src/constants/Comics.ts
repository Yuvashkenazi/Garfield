const date = new Date();

export type ComicDate = {
    year: number;
    month: number;
    day: number;
}

export type ComicInfo = {
    displayName: string,
    urlName: string,
    start: ComicDate;
    end: ComicDate;
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
    end: current
}

export const Dilbert: ComicInfo = {
    displayName: 'Dilbert Classics',
    urlName: 'dilbert-classics',
    start: {
        year: 2012,
        month: 6,
        day: 13
    },
    end: current
};

export const Calvin: ComicInfo = {
    displayName: 'Calvin and Hobbes',
    urlName: 'calvinandhobbes',
    start: {
        year: 1985,
        month: 11,
        day: 18
    },
    end: current
};

export const Fuzzy: ComicInfo = {
    displayName: 'Get Fuzzy',
    urlName: 'getfuzzy',
    start: {
        year: 1999,
        month: 9,
        day: 6
    },
    end: current
};

export const BloomCounty: ComicInfo = {
    displayName: 'Bloom County',
    urlName: 'bloomcounty',
    start: {
        year: 1980,
        month: 12,
        day: 8
    },
    end: current
};

export const Pearls: ComicInfo = {
    displayName: 'Pearls Before Swine',
    urlName: 'pearlsbeforeswine',
    start: {
        year: 2002,
        month: 1,
        day: 7
    },
    end: current
};

export const Nancy: ComicInfo = {
    displayName: 'Nancy',
    urlName: 'nancy',
    start: {
        year: 1948,
        month: 1,
        day: 5
    },
    end: current
};

export const Peanuts: ComicInfo = {
    displayName: 'Peanuts',
    urlName: 'peanuts',
    start: {
        year: 1950,
        month: 10,
        day: 2
    },
    end: current
};

export const Marmaduke: ComicInfo = {
    displayName: 'Marmaduke',
    urlName: 'marmaduke',
    start: {
        year: 1996,
        month: 12,
        day: 30
    },
    end: current
};

export const Comics = {
    Garfield,
    Dilbert,
    Calvin,
    Fuzzy,
    BloomCounty,
    Pearls,
    Nancy,
    Peanuts,
    Marmaduke
}
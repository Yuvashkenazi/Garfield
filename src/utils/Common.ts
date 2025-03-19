const PAGINATION_BREAKPOING = 1_950;

export function isDevEnv(): boolean {
    return process.env.NODE_ENV === "DEV";
}

export function getRandomInteger({ min = 0, max }: { min?: number, max: number }): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function groupBy(xs: Object[], key: string) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}

export function removePunctuation(s: string) {
    return s.replace(/[.,\/#!$%\^&;:{}=\-_`"~()]/g, "");
}

export type TextFormatting = {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    strikethrough?: boolean
};

export function format(s: string, { italics = false, bold = false, underline = false, strikethrough = false }: TextFormatting): string {
    switch (true) {
        case underline && bold && italics:
            s = `__***${s}***__`;
            break;
        case underline && bold:
            s = `__**${s}**__`;
            break;
        case underline && italics:
            s = `__*${s}*__`;
            break;
        case underline:
            s = `__${s}__`;
            break;
        case bold && italics:
            s = `***${s}***`;
            break;
        case bold:
            s = `**${s}**`;
            break;
        case italics:
            s = `*${s}*`;
            break;
        default:
            break;
    }

    if (strikethrough)
        s = `~~${s}~~`;

    return s;
}

export function at(id: string, role?: boolean): string {
    return `<@${role ? '&' : ''}${id}>`;
}

export function header(s: string, size: 1 | 2 | 3): string {
    return `<${'#'.repeat(size)} ${s}`;
}

export function link(link: string, url: string): string {
    return `[${link}](${url})`;
}

export function list(arr: string[]): string {
    return arr.reduce((acc, curr) => acc += `- ${curr}\n`, '');
}

export function paginate(str: string, delimiter?: string): string[] {
    if (str.length <= PAGINATION_BREAKPOING) return [str];

    const pageSize = Math.ceil(str.length / (PAGINATION_BREAKPOING));

    const addPageNumber: (current: number, max: number) => string =
        (current, max) => `\n**${current}/${max}**`;

    const parts = chunkString(str, PAGINATION_BREAKPOING, delimiter)
        .map((x, i) => x.concat(addPageNumber(i + 1, pageSize)));

    return parts;
}

function chunkString(str: string, chunkSize: number, delimiter?: string): string[] {
    const chunks = [];
    while (str) {
        if (str.length < chunkSize) {
            chunks.push(str);
            break;
        } else {
            const rawChunk = str.substring(0, chunkSize);
            const lastSpace = rawChunk.lastIndexOf(' ');
            const lastNewline = rawChunk.lastIndexOf('\n');
            const lastDelimiter = delimiter ? rawChunk.lastIndexOf(delimiter) : -1;

            const lastSpaceOrNewline = Math.max(lastSpace, lastNewline);
            const chunkEnd = lastDelimiter !== -1 ? lastDelimiter :
                (lastSpaceOrNewline === -1 ? chunkSize : lastSpaceOrNewline);

            chunks.push(str.substring(0, chunkEnd));
            str = str.substring(chunkEnd);
        }
    }

    return chunks;
}
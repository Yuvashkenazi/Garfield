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

export function bold(s: string): string {
    return `**${s}**`;
}

export function italic(s: string): string {
    return `_${s}_`;
}

export function at(id: string): string {
    return `<@${id}>`;
}

export function list(arr: string[]): string {
    return arr.reduce((acc, curr) => acc += `- ${curr}\n`, '');
}

import { writeFile } from "fs";
import { promisify } from "util";
const writeFilePromise = promisify(writeFile);

export async function saveWebFile({ url, path }: { url: string, path: string }): Promise<void> {
    return fetch(url)
        .then(x => x.arrayBuffer())
        .then(x => writeFilePromise(path, Buffer.from(x)));
}

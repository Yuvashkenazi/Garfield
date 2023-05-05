import { launch, Browser, Page } from 'puppeteer';

export async function launchNewBrowser(): Promise<Browser> {
    return await launch({
        executablePath: 'chromium-browser',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    });
}

export async function goToNewPage(browser: Browser, url: string): Promise<Page> {
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(0);
    page.setDefaultTimeout(0);

    await page.goto(url);

    return page;
}

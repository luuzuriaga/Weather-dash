const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 375, height: 812});
    await page.goto('http://localhost:8080', {waitUntil: 'networkidle0'});
    
    // Check bounding rects
    const centerHtml = await page.evaluate(() => document.querySelector('.weather-card-center').outerHTML);
    const centerRect = await page.evaluate(() => JSON.stringify(document.querySelector('.weather-card-center').getBoundingClientRect()));
    const bottomRect = await page.evaluate(() => JSON.stringify(document.querySelector('.weather-card-bottom').getBoundingClientRect()));
    const bottomHtml = await page.evaluate(() => document.querySelector('.weather-card-bottom').outerHTML);
    const bodyClass = await page.evaluate(() => document.body.className);
    
    console.log("BODY_CLASS:", bodyClass);
    console.log("CENTER_RECT:", centerRect);
    console.log("BOTTOM_RECT:", bottomRect);
    console.log("CENTER_HTML:");
    console.log(centerHtml);
    console.log("----");
    console.log("BOTTOM_HTML:");
    console.log(bottomHtml);
    
    await browser.close();
})();

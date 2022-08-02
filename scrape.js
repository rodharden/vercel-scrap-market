const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const cheerio = require('cheerio');
const oURLConfig = require('./urlconfig');
const fetch = require('node-fetch');

puppeteer.use(StealthPlugin())
const urls = new oURLConfig();
const page = null;

const scrapeMarket = async (page, market, searchTerm, maxItens) => {
    var results = [];

    //PINGO DOCE EXTENSION
    if (market.indexOf("PD;") > -1) {
        const fullURL = urls.PD.replace('{0}', searchTerm).replace('{1}', 0);
        await page.goto(fullURL, { waitUntil: "networkidle2" });
        const pageItemsNumber = 12;
        const maxPages = Math.floor(maxItens / pageItemsNumber);
        let settings = { method: "Get" };
        let totalCounter = 0;
        const urlPageIndex = urls.PDSEARCH.replace("{0}", searchTerm).replace("{1}", 0);
        await fetch(urlPageIndex, settings)
            .then(res => res.json())
            .then((json) => {
                totalCounter = json.data.maxPages;
            });
        const lastPageNumber = totalCounter > maxPages ? maxPages : totalCounter;


        for (let index = 1; index <= lastPageNumber; index++) {
            const urlPage = urls.PDSEARCH.replace("{0}", searchTerm).replace("{1}", index);
            await fetch(urlPage, settings)
                .then(res => res.json())
                .then((json) => {
                    page.setContent(json.data.html);
                });
            results = results.concat(await getDataPD(page));
        }

    }

    //CONTINENTE EXTENSION
    if (market.indexOf("CO;") > -1) { 

        const fullURL = urls.CO.replace('{0}', searchTerm).replace('{1}', 0);
        await page.goto(fullURL, { waitUntil: "networkidle2" });
        const searchCounter = await page.evaluate(() => document.querySelector('.search-results-products-counter').innerText);
        const counter = parseInt(searchCounter.split(" ")[2]);
        const totalCounter = (counter > maxItens) ? maxItens : counter;
        const finalURL = urls.COSEARCH.replace('{0}', searchTerm).replace('{1}', totalCounter);
        await page.goto(finalURL);
        results = results.concat(await getDataCO(page));
    }

    //AUCHAN EXTENSION
    if (market.indexOf("AU;") > -1) {
        const fullURL = urls.AU.replace('{0}', searchTerm).replace('{1}', 0);
        await page.goto(fullURL, { waitUntil: "networkidle2" });
        const searchCounter = await page.evaluate(() => document.querySelector('.search-result-count').innerText);
        const counter = parseInt(searchCounter.split(" ")[0].replace(",", "").replace(".", ""));
        const totalCounter = (counter > maxItens) ? maxItens : counter;
        const finalURL = urls.AUSEARCH.replace('{0}', searchTerm).replace('{1}', totalCounter);
        await page.goto(finalURL);
        results = results.concat(await getDataAU(page));
    }

    //EL CORTE INGLES EXTENSION
    if (market.indexOf("EL;") > -1) {
        const fullURL = urls.EL.replace('{0}', searchTerm).replace('{1}', 0);
        await page.goto(fullURL);
        const totalCounter = await page.evaluate(() => document.querySelector('#pagination-current').innerText);
        const pageItemsNumber = 24;
        const maxPages = Math.floor(maxItens / pageItemsNumber);
        let lastPageNumber = totalCounter.split(" ")[3];
        lastPageNumber = (lastPageNumber > maxPages) ? maxPages : lastPageNumber;
        for (let index = 1; index <= lastPageNumber; index++) {
            const finalURL = urls.ELSEARCH.replace('{0}', searchTerm).replace('{1}', index);
            await page.goto(finalURL);
            results = results.concat(await getDataEL(page));
        }

    }


    return results;
}

module.exports.runStealth = async (market, searchTerm, maxItens) => {
    return await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
        ]
    }).then(async browser => {
        const page = await browser.newPage();
        const results = await scrapeMarket(page, market, searchTerm, maxItens);
        await browser.close();
        return results;
    })
}

async function getDataCO(page) {
    const value = await page.evaluate(() => {
        const cards = ".product";
        const tds = Array.from(document.querySelectorAll(cards))
        return tds.map(td => td.innerHTML)
    });

    list = [];
    value.forEach((el) => {

        const $ = cheerio.load(el);
        const productJSON = JSON.parse($(".product-tile").attr("data-product-tile-impression"));
        const imageJSON = JSON.parse($(".product-tile .ct-image-container").attr("data-confirmation-image"));

        list.push({
            id: productJSON.id,
            title: imageJSON.title,
            url: $(".product-tile .ct-image-container a").attr("href"),
            description: $('.product-tile .ct-tile--description').text(),
            image: imageJSON.url,
            price: productJSON.price,
            fullprice: $('.product-tile .ct-price-value').text(),
            quantity: $('.product-tile .ct-tile--quantity').text(),
            brand: productJSON.brand,
            category: productJSON.category,
            promo: $('.product-tile .ct-discount-amount').text(),
            engine: 'CO'
        })

    });
    return list;

}

async function getDataPD(page) {
    const value = await page.evaluate(() => {
        const cards = ".product-cards";
        const tds = Array.from(document.querySelectorAll(cards))
        return tds.map(td => td.innerHTML)
    });

    list = [];
    value.forEach((el) => {

        const $ = cheerio.load(el);
        list.push({
            id: $('.product-cards__title').text(),
            title: $('.product-cards__title').text(),
            description: $('.product-cards__title').text(),
            image: $('.product-cards__link').attr("href"),
            price: $('.product-cards_price').text(),
            fullprice: $('.product-cards_price').text(),
            quantity: $('.ct-tile--quantity').text(),
            brand: $('.product-cards__brand').text(),
            engine: 'PD'
        })

    });
    return list;

}

async function getDataAU(page) {
    const value = await page.evaluate(() => {
        const cards = ".product";
        const tds = Array.from(document.querySelectorAll(cards))
        return tds.map(td => td.innerHTML)
    });

    list = [];
    value.forEach((el) => {

        const $ = cheerio.load(el);
        const auchan_site = 'https://www.auchan.pt';
        const dataURL = JSON.parse($('.product-tile').attr('data-urls'));
        const dataGTM = JSON.parse($('.product-tile').attr('data-gtm'));
        const image = $('.product-tile link').attr("href");
        const promo = $('.product-tile .auc-price__promotion--pdp').text().trim();
        const fullprice = $('.product-tile .auc-price__stricked .strike-through').attr('content');
        list.push({
            id: dataGTM.id,
            title: dataGTM.name,
            url: auchan_site + dataURL.productUrl,
            description: dataGTM.id,
            image: image,
            price: dataGTM.price,
            fullprice: fullprice == undefined ? dataGTM.price : fullprice,
            quantity: dataGTM.id,
            brand: dataGTM.brand,
            category: '',
            promo: promo == undefined ? "" : promo,
            engine: 'AU'
        })

    });
    return list;

}

async function getDataEL(page) {

    const value = await page.evaluate(() => {
        const cards = ".product_tile";
        const tds = Array.from(document.querySelectorAll(cards))
        return tds.map(td => td.outerHTML)
    });

    list = [];
    value.forEach((el) => {

        const $ = cheerio.load(el);
        const productJSON = JSON.parse($(".product_tile").attr("data-json"));

        list.push({
            id: productJSON.id,
            title: productJSON.name,
            description: $('.event img').attr("title"),
            image: $('.event img').attr("src"),
            price: productJSON.price.final,
            fullprice: productJSON.price.final,
            quantity: productJSON.quantity,
            brand: productJSON.brand,
            engine: 'EL'
        })

    });
    return list;

}
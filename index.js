const express = require('express');
const cheerio = require('cheerio');
const app = express();
const fs = require("fs");
const request = require('request-promise');

app.listen('3000', () => {
    console.log("Server running on port 3000");
});

app.get("/downloadedPage/:id", async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    await fs.readFile("./data/page" + req.params.id + ".json", "utf8", (err, jsonString) => {
        if (err) {
            res.json({
                status: "OK",
                data: null,
                message: "This file can't be found",
            });
            return;
        }
        res.json({
            status: "OK",
            data: JSON.parse(jsonString),
            message: "success",
        });
    });
});

app.get("/dynamicPage/:id", async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    await request('https://nmac.to/blog/page/' + req.params.id + '/', (error, response, html) => {
        const $ = cheerio.load(html);

        let result = $('.panel-wrapper').map((i, el) => {
            let link = $(el).find('a').attr('href');
            let img = $(el).find('img').attr('src');
            let baslik = $(el).find('h2').text();
            let icerik = $(el).find('div.excerpt').text();
            if (link) {
                return {
                    link: link,
                    image: img,
                    title: baslik,
                    content: icerik,
                };
            }
        }).get();

        res.json({
            status: "OK",
            data: result,
            message: "success",
        });
    });
});

app.get("/getMaxPageNumber", async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let pageNumber = 0;

    let result = {
        status: "OK",
        data: {"maxPageNumber": pageNumber},
        message: "success",
    };

    try {
        await request('https://nmac.to/', (error, response, html) => {
            const $ = cheerio.load(html);
            let element = [];
            $('.sort-buttons').children().map((i, el) => {
                let link = $(el).attr('href');
                element.push(link);
            }).get();

            let sonuc = element[element.length - 1].split('/');
            pageNumber =  sonuc[sonuc.length - 2];
        });

        result.data.maxPageNumber = pageNumber;

    }catch (e) {

    }

    res.json(result);
});

app.get("/downloadAllPage", async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let pageNumber = 0;
    await request('https://nmac.to/', (error, response, html) => {
        const $ = cheerio.load(html);
        let element = [];
        $('.sort-buttons').children().map((i, el) => {
            let link = $(el).attr('href');
            element.push(link);
        }).get();

        let sonuc = element[element.length - 1].split('/');
        pageNumber =  sonuc[sonuc.length - 2];
    });

    let result = {
        status: "OK",
        data: [],
        message: "success",
    };

    for (let i = 1; i <= pageNumber; i++) {
        await request('https://nmac.to/blog/page/' + i, async (error, response, html) => {
            const $ = cheerio.load(html);
            let result = $('.panel-wrapper').map((i, el) => {
                let link = $(el).find('a').attr('href');
                let img = $(el).find('img').attr('src');
                let baslik = $(el).find('h2').text();
                let icerik = $(el).find('div.excerpt').text();
                if (link) {
                    return {
                        link: link,
                        image: img,
                        title: baslik,
                        content: icerik,
                    };
                }
            }).get()

            await fs.writeFile("data/page" + i + ".json", JSON.stringify(result), 'utf8', function () {});
        });
        let page = "Data Successfully Saved Page: " + i;
        console.log(page);
        result.data.push(page);
    }

    res.json(result);
});
const express = require('express');
const cheerio  = require('cheerio');
const app = express();
const fs = require("fs");
const request = require('request-promise');
const https = require('https');  

app.listen('3000', () => {
    console.log("Server running on port 3000");
});

app.get("/page/:id", (req, res, next) => {
    fs.readFile("./data/page" + req.params.id + ".json", "utf8", (err, jsonString) => {
        if(err) {
            res.json({
                status: "OK",
                data: null,
                message: err,
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

app.get("/dynamicpage/:id", (req, res, next) => {
    request('https://nmac.to/blog/page/'+req.params.id+'/', (error, response, html) => {
        const $ = cheerio.load(html);
    
        var result = $('.panel-wrapper').map((i,el) => {
            var link = $(el).find('a').attr('href');
            var img = $(el).find('img').attr('src');
            var baslik = $(el).find('h2').text();
            var icerik = $(el).find('div.excerpt').text();
            if(link) {
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

app.get('/test', (req, res, next) => {

    for (i=1; i<=722; i++) {
        getData(i);
    }
    
    res.json({
        status: "OK",
        data: "All Data Successfully Saved",
        message: "success",
    });
});

var getData = async (pageNumber) => {
    try {
        request('https://nmac.to/blog/page/'+pageNumber+'/', (error, response, html) => {
            const $ = cheerio.load(html);
        
            var result = $('.panel-wrapper').map((i,el) => {
                var link = $(el).find('a').attr('href');
                var img = $(el).find('img').attr('src');
                var baslik = $(el).find('h2').text();
                var icerik = $(el).find('div.excerpt').text();
                if(link) {
                    return {
                        link: link,
                        image: img,
                        title: baslik,
                        content: icerik,
                    };
                }
            }).get()
        
            fs.writeFile("data/page"+pageNumber+".json", JSON.stringify(result), 'utf8', function (err) {
                console.log("JSON file " + pageNumber + ". page saved");
            });
        });
        await new Promise(resolve => setTimeout(resolve, pageNumber*200));
    }catch(e) {
        console.log(e);
    }
}
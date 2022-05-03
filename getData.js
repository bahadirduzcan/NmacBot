const request = require('request');
const cheerio  = require('cheerio');
const fs = require('fs');

var start=720;
var end=start+19;

for(i=start; i<=end; i++) {
    getData(i);
}

async function getData(pageNumber) {
    await request('https://nmac.to/blog/page/'+pageNumber+'/', (error, response, html) => {
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
}
"use strict";
// console.log("Start of get-articles.js file");

const request = require("request");
const cheerio = require("cheerio");

exports.allLinks = [];
exports.get = (url, pageCount, stem) => {
  console.log(
`============================================================
Getting links for query ${url}
============================================================`);
  let fullUrl = "";
  const links = [];
  let crawledCounter = 0;
  for (let i = 1; i <= pageCount; ++i) {
    console.log(`Loading page ${i}/${pageCount}...`);
    fullUrl = i===1 ? url : url+"&page="+i;
    request(fullUrl,function(error, response, body) {
      if (error) {
        console.log("Error occurred: ", error);
      } else {
        console.log(`Loaded page ${i}/${pageCount} successfully.`);
        let $ = cheerio.load(body);

        const linkElems = $("td[height='75'] a.typonoirbold12");
        // console.log(linkElems);
        linkElems.each(function(i) {
          let temp = stem + this.attribs.href;
          links.push(temp);
          console.log(`${i+1}. Found  ${temp}`);
        });
        console.log(`${linkElems.length} added to list of links (n=${links.length} now)`);
        ++crawledCounter;
        if (crawledCounter === pageCount) {
          allLinks = allLinks.concat(links);
          console.log(`Total of ${allLinks.length} links crawled!`);
        }
      }

    });
  }

};

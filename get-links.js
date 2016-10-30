"use strict";
// console.log("Start of get-articles.js file");

const request = require("request");
const cheerio = require("cheerio");

let toDo = 0; // counts how many jobs have to be done
let successCounter = 0; // counts how many jobs have successfully completed
let failureCounter = 0; // counts failures
let failures = []; // lists the failed URLs
let linkWriteStream; // stream to file in which the links are saved
let redoCounter = 0;
const REDO_PERCENTAGE = 0.3;

exports.init = (ws, numUrls) => {
  // console.log("In get-links.init now");
  linkWriteStream = ws;
  linkWriteStream.on("finish", () => console.log("Closed links output file."));

  toDo = numUrls;
};

// main function
exports.get = (url, pageCount, stem) => {
  console.log(
`============================================================
Getting links for query ${url}
============================================================`);
  let fullUrl = "";
  let linksLoaded = 0; // crawled links with current search query
  let crawledCounter = 0; // # crawled search result pages
  let successfulSublinks = 0;

  for (let i = 1; i <= pageCount; ++i) { // for every page of search results
    // console.log(`Requesting page ${i}/${pageCount}...`);
    fullUrl = i===1 ? url : url+"&page="+i;
    request(fullUrl,function(error, response, body) {
      if (error) {
        console.log(`Page ${i}/${pageCount} - error occurred: `, error);
        ++failureCounter;
        failures.push(fullUrl);
      } else {
        let $ = cheerio.load(body);

        const linkElems = $("td[height='75'] a.typonoirbold12");
        // console.log(linkElems);
        if (linkElems.length === 0) {
          console.log(`Page ${i}/${pageCount} - error occurred: 0 links found on URL ${fullUrl}`);
          ++failureCounter;
          failures.push(fullUrl);
        } else {
          let linkList = [];
          linkElems.each(function(i) {
            let temp = stem + this.attribs.href;
            linkList.push(temp);
            // console.log(`${i+1}. Found  ${temp}`);
          });
          linksLoaded += linkList.length;
          console.log(`Loaded page ${i}/${pageCount} successfully. ${linkList.length} -> list (n=${linksLoaded} now)`);
          ++successCounter;
          ++successfulSublinks;
          linkWriteStream.write(linkList.join("\n")+"\n");
          // console.log("Written to file: ", linkList);
        }
      }
      ++crawledCounter;
      if (crawledCounter === pageCount) {
        console.log(`Query completed. Total of ${linksLoaded} links crawled in this query - ${successfulSublinks}/${crawledCounter} successful`);
      }
      if (successCounter + failureCounter === toDo) {
        console.log(`All search URLs crawled. Successes: ${successCounter}, failures: ${failureCounter}`);
        if (failureCounter > 0 && redoCounter < toDo * REDO_PERCENTAGE) {
          --failureCounter;
          ++redoCounter;
          setTimeout(() => {
            let temp = failures.pop();
            console.log(`Retring query page ${temp}...`);
            exports.get(temp, 1, stem);
          }, 250);
        } else {
          console.log("Finished. Failed URLs: ", failures);
          linkWriteStream.end();
        }
      }
    });
  }

};

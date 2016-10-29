"use strict";
// console.log("Start of get-articles.js file");

const request = require("request");
const cheerio = require("cheerio");

exports.allLinks = [];
let toDo = 0; // counts how many jobs have to be done
let successCounter = 0; // counts how many jobs have successfully completed
let failureCounter = 0; // counts failures
let failures = []; // lists the failed URLs
let saveLinks, saveDest; // saveLinks = callback for saving, saveDest = full URI that marks the file in which the links will be saved
let redoCounter = 0;
const REDO_PERCENTAGE = 0.05;

exports.init = (saveLinksFunc, dest, numUrls) => {
  saveLinks = saveLinksFunc;
  saveDest = dest;
  toDo = numUrls;
};

// main function
exports.get = (url, pageCount, stem) => {
  console.log(
`============================================================
Getting links for query ${url}
============================================================`);
  let fullUrl = "";
  let links = []; // crawled links with current search query
  let crawledCounter = 0; // # crawled search result pages

  for (let i = 1; i <= pageCount; ++i) { // for every page of search results
    // console.log(`Requesting page ${i}/${pageCount}...`);
    fullUrl = i===1 ? url : url+"&page="+i;
    request(fullUrl,function(error, response, body) {
      if (error) {
        console.log("Error occurred: ", error);
        ++failureCounter;
        failures.push(fullUrl);
      } else {
        let $ = cheerio.load(body);

        const linkElems = $("td[height='75'] a.typonoirbold12");
        // console.log(linkElems);
        if (linkElems.length === 0) {
          console.log("Error occurred: 0 links found on URL", fullUrl);
          ++failureCounter;
          failures.push(fullUrl);
        } else {
          linkElems.each(function(i) {
            let temp = stem + this.attribs.href;
            links.push(temp);
            // console.log(`${i+1}. Found  ${temp}`);
          });
          console.log(`Loaded page ${i}/${pageCount} successfully. ${linkElems.length} -> list (n=${links.length} now)`);
          ++successCounter;
        }
        ++crawledCounter;
        if (crawledCounter === pageCount) {
          exports.allLinks = exports.allLinks.concat(links);
          console.log(`Total of ${exports.allLinks.length} links crawled so far`);
        }
      }
      if (successCounter + failureCounter === toDo) {
        console.log(`All search URLs crawled. Successes: ${successCounter}, failures: ${failureCounter}`);
        console.log("Failed URLs: ", failures);
        if (failureCounter > 0 && redoCounter < toDo * REDO_PERCENTAGE) { // NEW
          --failureCounter;
          ++redoCounter;
          setTimeout(() => {
            exports.get(failures.pop(), 1, stem);
          }, 200);
        } else {
          saveLinks(exports.allLinks, saveDest);
        }
      }
    });
  }

};

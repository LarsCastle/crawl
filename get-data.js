"use strict";
// console.log("Start of get-articles.js file");

const request = require("request");
const cheerio = require("cheerio");

exports.allData = [];
let toDo = 0; // counts how many jobs have to be done
let successCounter = 0; // counts how many jobs have successfully completed
let failureCounter = 0; // counts failures
let failures = []; // lists the failed URLs
let saveLinks, saveDest; // saveLinks = callback for saving, saveDest = full URI that marks the file in which the links will be saved
let counter = 0;

exports.init = (saveDataFunc, dest, numUrls) => {
  saveLinks = saveDataFunc;
  saveDest = dest;
  toDo = numUrls;
};

// main function
exports.get = (url) => {
  ++counter;
  let counterFormatted = "" + (6 - counter.toString().length) * "0" + counter.toString();
  console.log(
`============================================================
${counterFormatted}. Getting data from link ${url}
============================================================`);
  let links = []; // crawled links with current search query

  request(url, (error, response, body) => {
    if (error) {
      console.log("Error occurred: ", error);
      ++failureCounter;
      failures.push(fullUrl);
    } else {
      console.log(`Loaded page #${counterFormatted} successfully`);
      let $ = cheerio.load(body);
      let temp = [];
      // TO DO
      


      ++successCounter;
      exports.allData = exports.allData.push(temp);
      console.log(`${counterFormatted}: Found the following data:\n`, temp);
      if (successCounter + failureCounter === toDo) {
        console.log(`All URLs crawled. Successes: ${successCounter}, failures: ${failureCounter}`);
        console.log("Failed URLs: ", failures);
        saveLinks(exports.allData, saveDest);
      }
    }

  });

};

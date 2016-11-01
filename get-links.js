"use strict";
// console.log("Start of get-articles.js file");

const request = require("request");
const cheerio = require("cheerio");

let toDo = 0; // counts how many jobs have to be done
let successCounter = 0; // counts how many jobs have successfully completed
let failureCounter = 0; // counts failures
let overallLinkCounter = 0;
let failures = []; // lists the failed URLs
let linkWriteStream; // stream to file in which the links are saved
let redoCounter = 0;
let queryNo = 0;
const REDO_PERCENTAGE = 0.3;

exports.init = (ws, numUrls) => {
  // console.log("In get-links.init now");
  linkWriteStream = ws;
  linkWriteStream.on("finish", () => console.log("Closed links output file."));

  toDo = numUrls;
};

// main function
exports.get = (qid, url, pageCount, stem, retry=false) => {
  let thisQ = 0;
  if (retry) {
    console.log(`Retry of ${qid}`);
  } else {
    ++queryNo;
    thisQ = queryNo;
    console.log(
`============================================================
${qid}: Getting ${pageCount} link(s) for query ${url}
============================================================`);
  }
  let linksLoaded = 0; // crawled links with current search query
  let crawledCounter = 0; // # crawled search result pages
  let successfulSublinks = 0;

  for (let i = 1; i <= pageCount; ++i) { // for every page of search results
    // console.log(`Requesting page ${i}/${pageCount}...`);
    let qpid = qid;
    let fullUrl = i===1 ? url : url+"&page="+i;
    if (!retry) {     // if this is not a retry, append the # of pages to the end of the query ID
      qpid += `P${i===10?"10":"0"+i}`;
    }
    request(fullUrl,(error, response, body) => {
      if (error) {
        console.log(`${qpid} - error occurred: `, error);
        ++failureCounter;
        failures.push([qpid,fullUrl]);
      } else {
        let $ = cheerio.load(body);

        const linkElems = $("td[height='75'] a.typonoirbold12");
        // console.log(linkElems);
        if (linkElems.length === 0) {
          console.log(`${qpid} - error occurred: 0 links found.`);
          ++failureCounter;
          failures.push([qpid,fullUrl]);
        } else {
          let linkList = [];
          linkElems.each((j) => {
            let t = `${qpid}R${j+1===100?"100":(j+1>9?"0"+(j+1):"00"+(j+1))},${stem + linkElems[j].attribs.href}`;
            linkList.push(t);
            // console.log(`${i+1}. Found  ${t}`);
          });
          linksLoaded += linkList.length;
          console.log(`Loaded ${qpid} successfully. ${linkList.length} -> list (n=${linksLoaded} now)`);
          ++successCounter;
          ++successfulSublinks;
          linkWriteStream.write(linkList.join("\n")+"\n");
          // console.log("Written to file: ", linkList);
        }
      }
      ++crawledCounter;
      if (crawledCounter === pageCount) {
        console.log(`${qid} completed. Total of ${linksLoaded} links crawled in this query - ${successfulSublinks}/${crawledCounter} successful`);
        overallLinkCounter += linksLoaded;
      }
      if (successCounter + failureCounter === toDo) {
        if (retry) {
          console.log(`Retry update - successes: ${successCounter}, failures: ${failureCounter}, total ${overallLinkCounter}`);
        } else {
          console.log(`All search queries crawled. Successes: ${successCounter}, failures: ${failureCounter}. Total of ${overallLinkCounter} links obtained.`);
          let fTemp = [];
          for (let f of failures) {
            fTemp.push(f[0]);
          }
          console.log("Failures so far: ", fTemp);
        }
        if (failureCounter > 0 && redoCounter < toDo * REDO_PERCENTAGE) {
          --failureCounter;
          ++redoCounter;
          setTimeout(() => {
            let temp = failures.pop();
            // console.log(`Retry ${temp[0]}...`);
            exports.get(temp[0],temp[1], 1, stem, true);
          }, 250);
        } else {
          console.log("Finished. Failed URLs: ", failures);
          linkWriteStream.end();
        }
      }
    });
  }

};

"use strict";
console.log("main.js start");

// ------------------------------------------------------
// ------------------- requires -------------------------
const linkGetter = require("./get-links.js");
const fs = require("fs");
const parse = require("csv-parse");

// ------------------------------------------------------
// // temporary test data until I build a link import module

const dummyLinkData = [
  `http://www.artvalue.com/auctionresult--villa-edoardo-eduardo-1920-sou-standing-figure-i-4370365.htm`,
  `http://www.artvalue.com/auctionresult--legae-ezrom-kgobokanyo-sebata-loneliness-4370360.htm`,
  `http://www.artvalue.com/auctionresult--villa-edoardo-eduardo-1920-sou-maquette-for-reclining-figure-4370349.htm`,
  `http://www.artvalue.com/auctionresult--kumalo-sidney-alex-1935-1988-s-cock-4370342.htm`,
  `http://www.artvalue.com/auctionresult--goldblatt-david-1930-south-afr-railway-shunter-from-the-some-4370339.htm`,
  `http://www.artvalue.com/auctionresult--goldblatt-david-1930-south-afr-nyasa-miners-from-the-on-the-m-4370333.htm`,
  `http://www.artvalue.com/auctionresult--goldblatt-david-1930-south-afr-in-the-kitchen-at-1510-emdeni-4370317.htm`,
  `http://www.artvalue.com/auctionresult--goldblatt-david-1930-south-afr-troyeville-hillbrow-johannesbu-4370309.htm`,
  `http://www.artvalue.com/auctionresult--goldblatt-david-1930-south-afr-on-the-bus-4370324.htm`,
  `http://www.artvalue.com/auctionresult--goldblatt-david-1930-south-afr-greaser-no-2-north-steam-winde-4370304.htm`
];

// ------------------------------------------------------

// ------------------------------------------------------
// ----------- global settings --------------------------
const targetArtLinkStem = `http://www.artvalue.com/`;
const filesDir = `C:/crawling/`;
const queryLinksUri = filesDir + "test.csv";
const artLinksUri = filesDir + "artLinks.csv";
const outputDataUri = filesDir + "outputData.csv";
const MODE = {
  "findArtLinks": true,
  "extractArtData": false
}; // activates subfunctions

// ------------------------------------------------------

// 1. If MODE.findArtLinks:
if (MODE.findArtLinks) {
  let queries = []; // nested array for queries
  /// format of queries:
  /// [[url1, resultPageCount1],[url2, resultPageCount2],...]
  const linkSavingFunc = (payload, dest) => {
    fs.open(dest, "w+", (err, fd) => {
      if (err) {
        console.log("Error when creating / opening file: ", err);
      } else {
        console.log("Successfully opened file ", dest);
        fs.write(fd, payload.join("\n"), (err, written, str) => {
          if (err) {
            console.log("Error occurred when writing to file: ", err);
          } else {
            console.log("Successfully written data to file ", dest);
          }
        });
      }
    });
  };
  const callGetter = (qs, i) => {
    console.log("Getting data - URL ", i+1);
    linkGetter.get(qs[i][0], qs[i][1], targetArtLinkStem);
    if (i < qs.length - 1) {
      setTimeout(() => {
        ++i;
        callGetter(qs, i);
      }, (25  + Math.random()*10) * 1000);
    }
  }; // helper function to call linkGetter.get

//    a) load queries from queryLinksUri
  fs.readFile(queryLinksUri, (err, data) => {
    if (err) {
      console.log(`Error occurred when reading ${queryLinksUri}: `, err);
    } else {
      console.log("Successfully read file ", queryLinksUri);
      parse(data, {auto_parse: true}, (error, out) => {
        if (error) {
          console.log("Error occurred when parsing: ", error);
        } else {
          queries = out;
          console.log(queries);

//    b) Execute linkGetter.get
          let numUrls = queries.reduce((prev, curr, i, arr) => prev + curr[1], 0);
          linkGetter.init(linkSavingFunc, artLinksUri, numUrls);
          // set up linkGetter to save links after completion
          callGetter(queries, 0);
        }
      });
    }
  });
//    c) Append new links to artLinksUri
  // done in callback within linkGetter. Callback is defined as "linkSavingFunc" above
}

// 2. If MODE.extractArtData:
if (MODE.extractArtData) {
  let artLinks = []; // for all links in artLinksUri file
  /// format of data:
  /// [url1, url2, ...]
  let data = []; // array of objects for data collection
  /// format of data:
  /// [
  ///  {
  ///   TO DO
  ///
  ///  }, {
  ///
  ///  }, ...
  /// ]
//    a) load artLinks from artLinksUri
  // TO DO
//    b) Execute artDataGetter.get
  // TO DO
//    c) Append new data to outputDataUri
  // TO DO
}

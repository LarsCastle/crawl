"use strict";
console.log("main.js start");

// ------------------------------------------------------
// ------------------- requires -------------------------
const linkGetter = require("./get-links.js");
const dataGetter = require("./get-data.js");
const config = require("./config.js");
const fs = require("fs");
const parse = require("csv-parse");

// ------------------------------------------------------
// ---- transferring global settings from config.js -----
const target = config.target;
const dir = config.dir;
const profiles = config.profiles;
const MODE = config.mode;

const queryUri = dir.root + dir.queryFile;
const linksUri = dir.root + dir.linksFile;
const outputDataUri = dir.root + dir.outputFile;
// ------------------------------------------------------

// 1. If MODE.findLinks:
if (MODE.findLinks) {
  let queries = []; // nested array for queries
  /// format of queries:
  /// [[url1, resultPageCount1],[url2, resultPageCount2],...]

  const callLinkGetter = (qs, i) => {
    console.log("Getting data - query ", qs[i][0]);
    linkGetter.get(qs[i][0], qs[i][1], qs[i][2], target.stem);
    if (i < qs.length - 1) {
      setTimeout(() => {
        ++i;
        callLinkGetter(qs, i);
      }, (25  + Math.random()*10) * 1000);
    }
  }; // helper function to call linkGetter.get

  //    a) load queries from queryUri
  fs.readFile(queryUri, (err, data) => {
    if (err) {
      console.log(`Error occurred when reading ${queryUri}: `, err);
    } else {
      console.log("Successfully read file ", queryUri);
      parse(data, {auto_parse: true}, (error, out) => {
        if (error) {
          console.log("Error occurred when parsing: ", error);
        } else {
          queries = out;
          console.log(`Loaded ${queries.length} queries successfully.`);

          //    b) Execute linkGetter.get
          let numUrls = queries.reduce((prev, curr, i, arr) => prev + curr[2], 0);
          linkGetter.init(fs.createWriteStream(linksUri), numUrls);
          // set up linkGetter to save links after completion
          callLinkGetter(queries, 0);
        }
      });
    }
  });
}

// 2. If MODE.extractData:
if (MODE.extractData) {
  let links = []; // for all links in linksUri file
  /// format of data:
  /// [url1, url2, ...]

  const callDataGetter = (qs, i) => {
    console.log(`Querying URL ${i+1}: ${qs[i][0]}`);
    dataGetter.get(qs[i]);
    if (i < qs.length - 1) {
      setTimeout(() => {
        ++i;
        callDataGetter(qs, i);
      }, (1  + Math.random()*1) * 250);
    }
  }; // helper function to call linkGetter.get

//    a) load Links from linksUri
  fs.readFile(linksUri, (err, data) => {
    if (err) {
      console.log(`Error occurred when reading ${linksUri}: `, err);
    } else {
      console.log("Successfully read file ", linksUri);
      parse(data, {auto_parse: false}, (error, out) => {
        if (error) {
          console.log("Error occurred when parsing: ", error);
        } else {
          links = out;
          // for (let row of out) {
          //   links.push(row);
          // }
          console.log(`Loaded ${links.length} links successfully.`);

          //    b) Execute dataGetter.get
          let numUrls = links.length;

          console.log(`Calling dataGetter.init with ${outputDataUri}, ${numUrls}, ${target}, ${profiles[Math.floor(Math.random() * profiles.length)]}`);
          dataGetter.init(fs.createWriteStream(outputDataUri), numUrls, target, profiles[Math.floor(Math.random() * profiles.length)], () => {
            callDataGetter(links, 0);
          });
          // set up dataGetter to save links after completion
        }
      });
    }
  });
}

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

  const callLinkGetter = (qs, i) => {
    console.log("Getting data - URL ", i+1);
    linkGetter.get(qs[i][0], qs[i][1], target.stem);
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
          let numUrls = queries.reduce((prev, curr, i, arr) => prev + curr[1], 0);
          linkGetter.init(linkSavingFunc, linksUri, numUrls);
          // set up linkGetter to save links after completion
          callLinkGetter(queries, 0);
        }
      });
    }
  });
  //    c) Append new links to linksUri
  // done in callback within linkGetter. Callback is defined as "linkSavingFunc" above
}

// 2. If MODE.extractData:
if (MODE.extractData) {
  let links = []; // for all links in linksUri file
  /// format of data:
  /// [url1, url2, ...]
  let dataHeader =
    ["0-3_Header",
    "4_Auction House",
    "5_Lot Number",
    "6-9_Artist line",
    // "7_Artist's Birth",
    // "8_Artist's Death",
    // "9_Artist Country of Origin",
    "10_Title",
    "11_Year of Creation",
    "12_Signature",
    "13_Category",
    "14_Medium",
    "15-17_Dimensions",
    // "15_Height (in cm)",
    // "16_Breadth (in cm)",
    // "17_Depth (in cm)",
    "18-19 Estimated Price",
    // "18_Estimated Price Low",
    // "19_Estimated Price High",
    "20_Sales Price",
    "21_Picture of Artwork",
    "22_Publication"]; // first line of csv file containing column headers

  const dataSavingFunc = (payload, dest) => {
    payload.unshift(dataHeader.join("\t"));
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
    // console.log(payload);
  };
  const callDataGetter = (qs, i) => {
    console.log("Querying URL ", i+1);
    dataGetter.get(qs[i]);
    if (i < qs.length - 1) {
      setTimeout(() => {
        ++i;
        callDataGetter(qs, i);
      }, (1  + Math.random()*1) * 1000);
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
          for (let row of out) {
            links.push(row[0]);
          }
          console.log(`Loaded ${links.length} links successfully.`);

          //    b) Execute dataGetter.get
          let numUrls = links.length;
          console.log(`Calling dataGetter.init with ${outputDataUri}, ${numUrls}, ${target}, ${profiles[0]}`);
          dataGetter.init(dataSavingFunc, outputDataUri, numUrls, target, profiles[0], () => {
            callDataGetter(links, 0);
          });
          // set up dataGetter to save links after completion
        }
      });
    }
  });

//    c) Save new data in outputDataUri
// done in callback within dataGetter. Callback is defined as "dataSavingFunc" above
}

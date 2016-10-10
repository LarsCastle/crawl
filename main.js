"use strict";
console.log("main.js start");

// ------------------------------------------------------
// ------------------- requires -------------------------
const linkGetter = require("./get-links.js");


// ------------------------------------------------------
// temporary test data until I build a link import module
const dummyQueries = [
  [`http://www.artvalue.com/default.aspx?ID=23&maisons_pays=29&C_19=O&C_21=O&NB_COL=3&cp_checked=0
  `, 9]
];

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
const queryLinksUri = filesDir + "queries.csv";
const artLinksUri = filesDir + "artLinks.csv";
const outputDataUri = filesDir + "outputData.csv";
const MODE = {
  "findArtLinks": true,
  "extractArtData": false
}; // activates subfunctions

// ------------------------------------------------------

// 1. If MODE.findArtLinks:
if (MODE.findArtLinks) {
  let queries = dummyQueries; /* TEMPORARY FOR TESTING */ //[]; // nested array for queries
  /// format of queries:
  /// [[url1, resultPageCount1],[url2, resultPageCount2],...]
  let newArtLinks = dummyLinkData; /* TEMPORARY FOR TESTING */ //[]; // for new links
  /// format of data:
  /// [url1, url2, ...]
//    a) load queries from queryLinksUri
  // TO DO
//    b) Execute linkGetter.get
  // linkGetter.get(firstUrl, firstPageCount, targetArtLinkStem);
  // TEMPORARILY DEACTIVATED
  // TO DO: Build loop for all links, add lag
//    c) Append new links to artLinksUri
  // TO DO
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

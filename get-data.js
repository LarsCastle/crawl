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
  let counterFormatted = "";
  let numZeroes = 6 - counter.toString().length;
  for (let k = 0; k < numZeroes; ++k) {
    counterFormatted +=  "0";
  }
  counterFormatted += counter.toString();
  console.log(`${counterFormatted}. Getting data from link ${url}`);

  request(url, (error, response, body) => {
    if (error) {
      console.log("Error occurred: ", error);
      ++failureCounter;
      failures.push(fullUrl);
    } else {
      console.log(`Loaded page #${counterFormatted} successfully`);
      let $ = cheerio.load(body);
      let temp = [];
      let tempObj = {};
      // 0-3 Header
      tempObj.header = $("#_ctl0_ContentPlaceHolder1_lblSaleTitle").text();
      temp.push(tempObj.header);

      // 4 Auction house / image URL of auction house
      tempObj.auctionImgUrl = $("#_ctl0_ContentPlaceHolder1_imgHouseSaleLogo").attr("src");
      temp.push(tempObj.auctionImgUrl);

      // 5 Lot number
      tempObj.lot = $("#_ctl0_ContentPlaceHolder1_lblNumLot").text();
      temp.push(tempObj.lot);

      // 6-9 Artist line
      tempObj.artist = $("#_ctl0_ContentPlaceHolder1_lnkArtist").text();
      temp.push(tempObj.artist);

      // 10 Title
      tempObj.title = $("#_ctl0_ContentPlaceHolder1_lblTitle").text();
      temp.push(tempObj.title);

      // 11 Year of Creation
      tempObj.creationYear = $("#_ctl0_ContentPlaceHolder1_lblYear").text();
      temp.push(tempObj.creationYear);

      // 12 Signature
      tempObj.signature = $("#_ctl0_ContentPlaceHolder1_lblSignature").text();
      temp.push(tempObj.signature);

      // 13 Category
      tempObj.category = $("#_ctl0_ContentPlaceHolder1_lblOtherCategory").text();
      temp.push(tempObj.category);

      // 14 Medium
      tempObj.medium = $("#_ctl0_ContentPlaceHolder1_lblTechniqueGB").text();
      temp.push(tempObj.medium);

      // 15-17 Dimensions
      tempObj.dimensions = $("#_ctl0_ContentPlaceHolder1_lblDimCm").text();
      temp.push(tempObj.dimensions);

      // 18-19 Estimate of price
      tempObj.priceEstimate = $("#_ctl0_ContentPlaceHolder1_lblEstimate").text();
      temp.push(tempObj.priceEstimate);

      // 20 Selling price
      tempObj.price = $("#_ctl0_ContentPlaceHolder1_lblPrice").text();
      temp.push(tempObj.price);

      // 21 Image URL
      tempObj.image = $("#_ctl0_ContentPlaceHolder1_imgResult").attr("src");
      temp.push(tempObj.image);

      // 22 Publication
      tempObj.publication = $("#_ctl0_ContentPlaceHolder1_lblPublication").text();
      temp.push(tempObj.publication);


      // console.log(tempObj);

      ++successCounter;
      exports.allData.push(temp);
      console.log(`${counterFormatted}: Found the following data:\n`, temp);
      if (successCounter + failureCounter === toDo) {
        console.log(`All URLs crawled. Successes: ${successCounter}, failures: ${failureCounter}`);
        console.log("Failed URLs: ", failures);
        saveLinks(exports.allData, saveDest);
      }
    }

  });

};

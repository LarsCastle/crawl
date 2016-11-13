"use strict";
// console.log("Start of get-articles.js file");

const request = require("request");
const cheerio = require("cheerio");

let cookieJars = {};
let toDo = 0; // counts how many jobs have to be done
let successCounter = 0; // counts how many jobs have successfully completed
let failureCounter = 0; // counts failures
let failures = []; // lists the failed URLs
let dataWriteStream; // stream to file in which the data is saved
let cookieJar;
let counter = 0;
let redoCounter = 0;
const REDO_PERCENTAGE = 0.3;

const dataHeader =
  ["linkID",
  "0-3_Header",
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

exports.init = (ws, numUrls, target, profile, callb) => {
  // console.log("In get-data.init now");
  dataWriteStream = ws;
  dataWriteStream.on("open", () => {
    dataWriteStream.write(dataHeader.join("\t")+"\n");
    console.log("Started writing to file: header");
  });
  dataWriteStream.on("finish", () => console.log("Closed output file."));

  toDo = numUrls;

  cookieJar = request.jar();
  const options = {
    url: target.stem + target.loginPath,
    method: "POST",
    form: {
      id: 0,
      login: profile.user,
      password: profile.pw
    },
    jar: cookieJar
  };

  request(options, (err, r, b) => {
    if (err) {
      console.log("Error upon login attempt: ", err);
      throw err;
    } else {
      console.log(`User ${profile.user} logged in successfully. Cookies: ${cookieJar.getCookieString(target.stem)}`);
      callb();
    }
  });
};

// main function
exports.get = (row) => {
  // console.log("In get-data.get now");
  ++counter;
  let counterFormatted = "";
  let numZeroes = 6 - counter.toString().length;
  for (let k = 0; k < numZeroes; ++k) {
    counterFormatted +=  "0";
  }
  counterFormatted += counter.toString();
  let opt = {
    url: row[1],
    method: "GET",
    jar: cookieJar
  };
  // console.log(`${counterFormatted}. Getting data from link ${row}, options: ${opt.url}, ${opt.jar}`);

  request(opt, (error, response, body) => {
    if (error) {
      console.log("Error occurred: ", error);
      ++failureCounter;
      failures.push(row);
    } else {
      console.log(`Loaded page ${row[0]} (#${counterFormatted}) successfully`);
      const r = /<</g;
      const myBody = body.replace(r,"&lt;");
      let $ = cheerio.load(myBody);
      let temp = [];
      let tempObj = {};

      // link ID
      temp.push(row[0]);

      // 0-3 Header
      tempObj.header = clean($("#_ctl0_ContentPlaceHolder1_lblSaleTitle").text());
      temp.push(tempObj.header);

      // 4 Auction house / image URL of auction house
      tempObj.auctionImgUrl = $("#_ctl0_ContentPlaceHolder1_imgHouseSaleLogo").attr("src");
      temp.push(tempObj.auctionImgUrl);

      // 5 Lot number
      tempObj.lot = $("#_ctl0_ContentPlaceHolder1_lblNumLot").text();
      temp.push(tempObj.lot);

      // 6-9 Artist line
      tempObj.artist = clean($("#_ctl0_ContentPlaceHolder1_lnkArtist").text());
      temp.push(tempObj.artist);

      // 10 Title
      tempObj.title = clean($("#_ctl0_ContentPlaceHolder1_lblTitle").text());
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
      tempObj.medium = clean($("#_ctl0_ContentPlaceHolder1_lblTechniqueGB").text());
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


      // console.log(temp);

      ++successCounter;
      dataWriteStream.write(temp.join("\t")+"\n");
      // console.log("Written to file: ", temp);
    }
    console.log(`Successes: ${successCounter} + Failures: ${failureCounter} ?= To Do: ${toDo}`);
    if (successCounter + failureCounter === toDo) {
      if (failureCounter > 0 && redoCounter < toDo * REDO_PERCENTAGE) { // NEW
        --failureCounter;
        ++redoCounter;
        setTimeout(() => {
          let temp = failures.pop();
          console.log(`Retring URL ${temp[0]}...`);
          exports.get(temp);
        }, 250);
      } else {
        console.log("Finished. Failed URLs: ", failures);
        dataWriteStream.end();
      }
    }
  });

};

const clean = (str) => {
  let out;

  // reg exp to replace:
  // "  -> [nothing]
  // U+000A -> [nothing]
  const weirdCharsRegEx = /[\u{000A}\u{000D}"]/gu;

  out = str.replace(weirdCharsRegEx," ");
  return out;
};

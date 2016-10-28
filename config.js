// target URLs
exports.target = {
  stem: `http://www.example.org/`,
  loginPath: "login.php"
};

// internal directories
exports.dir = {
  root: `C:/crawling/`,
  queryFile: "test.csv",
  linksFile: "links.csv",
  outputFile: "outputData.csv"
};

// user login data for target website
exports.profiles = [
  {
    user: "my@user.com",
    pw: "Cre4t1veP4ssWord"
  }
];

// activates subfunctions
exports.mode = {
  "findLinks": false,
  "extractData": true
};

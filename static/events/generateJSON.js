var args = process.argv.slice(2);
var fs = require("fs");
var { parse } = require("csv-parse");
var filePath = args[0];
var path = require("path");

// let csvTable = [];
let json = {},
  column = [],
  duration = {},
  api = {};
banner = {};
fs.createReadStream(filePath)
  .pipe(parse({ delimiter: ",", from_line: 1 }))
  .on("data", (data) => {
    const obj = data.reduceRight((prev, item) => {
      if (item !== "") {
        if (typeof prev === "undefined") {
          // return {key: prev}
          return item;
        } else if (item === "duration") {
          duration = { ...duration, ...prev };
          return { duration };
        } else if (item === "banner") {
          banner = { ...banner, ...prev };
          return { banner };
        } else if (item === "api") {
          api = { ...api, ...prev };
          return { api };
        } else if (item === "column") {
          const item = prev.split(":");
          column = [...column, { key: item[0], label: item[1] }];
          return { column };
        } else {
          return { [item]: prev };
        }
      }
      return undefined;
    }, undefined);
    json = {
      ...json,
      ...obj,
    };
  })
  .on("end", () => {
    console.log(json);
    console.log("-----------");
    console.log(`\"${path.basename(filePath).replace(/\..*/, "")}\":`);
    console.log(JSON.stringify(json));
    // csvTable.reduce((prev, item) => {
    //   Object.keys(item)[0];
    // }, json);
  })
  .on("error", function (error) {
    console.log(error.message);
  });

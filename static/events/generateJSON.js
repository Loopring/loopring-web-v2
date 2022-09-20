var args = process.argv.slice(2);
var fs = require("fs");
var { parse } = require("csv-parse");
var filePath = args[0];
var path = require("path");
const { investJson } = require("./invest");

//TODO lng

// let csvTable = [];
let json = {},
  column = [],
  duration = {},
  api = {};
oldJson = {};
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
  .on("end", async () => {
    console.log(json);
    console.log("-----------");
    // console.log(`\"${path.basename(filePath).replace(/\..*/, "")}\":`);
    console.log(`\"${json.name}\":`);
    console.log(JSON.stringify(json));
    writePath = path.resolve(filePath, "..", "activities.en.json");
    try {
      if (fs.exists(writePath)) {
        oldJson = JSON.parse(fs.readFileSync(writePath));
      }
      await fs.unlink(writePath);
      console.log(`Deleted ${totalNotifyPath}`);
    } catch (error) {
      // console.error(`Got an error trying to delete the file: ${error.message}`);
    }
    oldJson[json.name] = {
      ...json,
    };
    fs.writeFileSync(
      writePath,
      JSON.stringify({
        ...oldJson,
        // ...jsonNotify,
        // invest: { ...investJson },
        // campaignTagConfig: json.campaignTagConfig,
        // prev: json.prev,
      })
    );
    // csvTable.reduce((prev, item) => {
    //   Object.keys(item)[0];
    // }, json);
  })
  .on("error", function (error) {
    console.log(error.message);
  });

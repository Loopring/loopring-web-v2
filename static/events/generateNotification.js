var JSONStream = require("JSONStream");
var args = process.argv.slice(2);
var fs = require("fs");
var { parse } = require("csv-parse");
var path = require("path");
var moment = require("moment");
const lngs = ["en"];
const _moment = moment(new Date());
const notifyPath = args[0] ? args[0] : _moment.format("YYYY/MM");

async function getNotification() {
  const monthArray = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  const date = new Date();
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  let totalNotify = {};

  async function buildNotification(monthIndex, notification, year, lng) {
    try {
      const filePath = path.resolve(
        __dirname,
        year.toString(),
        monthArray[monthIndex],
        `notification.${lng}.json`
      );
      const myNotification = await new Promise((resolve, reject) => {
        fs.createReadStream(filePath, { flags: "r", encoding: "utf-8" })
          // .pipe(JSON.parse("*"))
          .on("data", (data) => {
            resolve(JSON.parse(data));
            // json;
          })
          .on("error", function (error) {
            reject(error);
          });
      });
      console.log(myNotification);
      if (myNotification !== undefined) {
        notification.activities = [
          ...(notification.activities ?? []),
          ...(myNotification.activities ?? []),
        ];
        notification.notifications = [
          ...(notification.notifications ?? []),
          ...(myNotification.notifications ?? []),
        ];
        notification.invest = [
          ...(notification.invest ?? []),
          ...(myNotification.invest ?? []),
        ];
      }
      if (
        myNotification !== undefined &&
        myNotification.prev &&
        myNotification.prev.endDate > date.getTime()
      ) {
        await buildNotification(
          monthIndex === 0 ? 11 : monthIndex - 1,
          notification,
          monthIndex === 0 ? year - 1 : year,
          lng
        );
      }
    } catch (_e) {
      console.log(_e.message);
    }
  }
  for (const lng of lngs) {
    const notification = {
      activities: [],
      notifications: [],
    };
    await buildNotification(monthIndex, notification, year, lng);
    notification.notifications = notification.notifications.reduce(
      (prev, item) => {
        if (item.endShow > date.getTime()) {
          prev.push(item);
        }
        return prev;
      },
      []
    );
    notification.activities = notification.activities.reduce((prev, item) => {
      if (item.endShow > date.getTime()) {
        prev.push(item);
      }
      return prev;
    }, []);
    notification.invest = notification.invest.reduce((prev, item) => {
      if (item.endShow > date.getTime()) {
        prev.push(item);
      }
      return prev;
    }, []);
    totalNotify = {
      ...totalNotify,
      [lng]: notification,
      prev: notification.prev,
    };
  }
  return { ...totalNotify };
}
let json = {
  activities: [],
  notifications: [],
  invest: [],
  prev: {
    endDate: Date.now(),
  },
};
let TYPE = {
  ACTIVITY: "ACTIVITY",
  NOTIFICATION: "NOTIFICATION",
};
/*
var notifyPath = args[0];
*/
const _router = path.resolve(__dirname);
async function createNotifyJSON(lng) {
  const notificationPath = `${_router}/${notifyPath}/notification.${lng}.csv`;
  const investPath = `${_router}/${notifyPath}/invest.${lng}.csv`;
  /****create notification json****/
  if (fs.existsSync(notificationPath)) {
    await new Promise((resolve, reject) => {
      const list = [];
      fs.createReadStream(notificationPath)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", (data) => {
          list.push(data);
        })
        .on("end", () => {
          list.map((item) => {
            const startShow = moment
              .utc(item[7], "MM/DD/YYYY HH:mm:ss")
              .valueOf();
            const endShow = moment
              .utc(item[8], "MM/DD/YYYY HH:mm:ss")
              .valueOf();
            const _item = {
              type: item[0],
              version: item[1], //localStore for visited should be unique
              title: item[2],
              name: item[3],
              description1: item[4],
              description2: item[5],
              link: item[6],
              startShow,
              endShow,
              color: item[9],
              banner: item[10],
            };
            if (item[0] === TYPE.ACTIVITY) {
              json.activities = json.activities.concat(_item);
            }
            if (item[0] === TYPE.NOTIFICATION) {
              json.notifications = json.notifications.concat(_item);
            }
            if (json.prev.endDate <= endShow) {
              json.prev.endDate = endShow;
            }
          }, undefined);
          resolve(json);
        })
        .on("error", function (error) {
          console.log(error.message);
          reject(error);
        });
    });
  }

  /****create invest json****/
  if (fs.existsSync(investPath)) {
    await new Promise((resolve, reject) => {
      const list = [];
      fs.createReadStream(investPath)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", (data) => {
          list.push(data);
        })
        .on("end", () => {
          list.map((item) => {
            const startShow = moment
              .utc(item[6], "MM/DD/YYYY HH:mm:ss")
              .valueOf();
            const endShow = moment
              .utc(item[7], "MM/DD/YYYY HH:mm:ss")
              .valueOf();

            const _item = {
              name: item[0],
              version: item[1], //localStore for visited should be unique
              type: item[2],
              bannerMobile: item[3],
              bannerLaptop: item[4],
              linkRule: item[5],
              startShow: startShow,
              endShow: endShow,
              link: item[8],
            };
            json.invest = json.invest.concat(_item);
            if (json.prev.endDate <= endShow) {
              json.prev.endDate = endShow;
            }
          }, undefined);
          resolve(json);
        })
        .on("error", function (error) {
          console.log(error.message);
          reject(error);
        });
    });
  }
  const storeFilePath = `${_router}/${notifyPath}/notification.${lng}.json`;
  try {
    await fs.unlink(storeFilePath);
    console.log(`Deleted ${storeFilePath}`);
  } catch (error) {
    // console.error(`Got an error trying to delete the file: ${error.message}`);
  }
  console.log(json);
  console.log("-----------");
  console.log(`\"${path.basename(storeFilePath).replace(/\..*/, "")}\":`);
  console.log(JSON.stringify(json));
  fs.writeFileSync(storeFilePath, JSON.stringify(json));
}

async function start() {
  const notifyHistory = await new Promise((resolve, reject) => {
    fs.createReadStream("./notification.json")
      .pipe(JSONStream.parse("*"))
      .on("data", (data) => {
        resolve(data);
      });
  });
  json = {
    ...json,
    prev: {
      endDate:
        notifyHistory?.prev?.endDate && Date.now() < notifyHistory?.prev.endDate
          ? notifyHistory?.prev?.endDate
          : Date.now(),
    },
  };

  for (const lng of lngs) {
    await createNotifyJSON(lng);
  }
  const jsonNotify = await getNotification();
  const totalNotifyPath = _router + `/notification.json`;
  try {
    await fs.unlink(totalNotifyPath);
    console.log(`Deleted ${totalNotifyPath}`);
  } catch (error) {
    // console.error(`Got an error trying to delete the file: ${error.message}`);
  }
  fs.writeFileSync(
    totalNotifyPath,
    JSON.stringify({ ...jsonNotify, prev: json.prev })
  );
  // const storeFilePath = `${path.basename(filePath).replace(".csv", ".json")}`;
}
start();
// cd js file
// node generateNotification.js 2022/06

var JSONStream = require("JSONStream");
var args = process.argv.slice(2);
var fs = require("fs");
var { parse } = require("csv-parse");
var path = require("path");
var { investJson } = require("./invest");
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
          ...(myNotification.activities ?? []),
          ...(notification.activities ?? []),
        ];
        notification.activitiesHome = [
          ...(myNotification.activitiesHome ?? []),
          ...(notification.activitiesHome ?? []),
        ];
        notification.activitiesInvest = [
          ...(myNotification.activitiesInvest ?? []),
          ...(notification.activitiesInvest ?? []),
        ];
        notification.notifications = [
          ...(myNotification.notifications ?? []),
          ...(notification.notifications ?? []),
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
          prev = [item, ...prev];
        }
        return prev;
      },
      []
    );
    notification.activities = notification.activities.reduce((prev, item) => {
      if (item.endShow > date.getTime()) {
        // prev.push(item);
        prev = [item, ...prev];
      }
      return prev;
    }, []);

    notification.activitiesHome = notification.activitiesHome.reduce(
      (prev, item) => {
        if (item.endShow > date.getTime()) {
          prev = [item, ...prev];
        }
        return prev;
      },
      []
    );
    notification.activitiesInvest = notification.activitiesInvest.reduce(
      (prev, item) => {
        if (item.endShow > date.getTime()) {
          prev = [item, ...prev];
        }
        return prev;
      },
      []
    );
    notification.invest = notification.invest.reduce((prev, item) => {
      if (item.endShow > date.getTime()) {
        prev = [item, ...prev];
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
  activitiesHome: [],
  activitiesInvest: [],
  notifications: [],
  invest: [],
  campaignTagConfig: {
    orderbook: [],
    market: [],
    Amm: [],
    Fiat: [],
    swap: [],
  },
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
const TYPE_ITEM = {
  type: 0,
  place: 1,
  version: 2,
  name: 3,
  title: 4,
  description1: 5,
  description2: 6,
  link: 7,
  startShow: 8,
  endShow: 9,
  color: 10,
  banner: 11,
  bannerWeb: 12,
  webRouter: 13,
};
const TAGP_CONFIF_ITEM = {
  scenario: 0,
  name: 1,
  startShow: 2,
  endShow: 3,
  iconSource: 4,
  symbols: 5,
  scenarios: 6,
};
const PLACE = {
  HOME: "HOME",
  INVEST: "INVEST",
};
const _router = path.resolve(__dirname);

async function createNotifyJSON(lng) {
  const notificationPath = `${_router}/${notifyPath}/notification.${lng}.csv`;
  const investPath = `${_router}/${notifyPath}/invest.${lng}.csv`;

  console.log(notificationPath);
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
              .utc(item[TYPE_ITEM.startShow], "MM/DD/YYYY HH:mm:ss")
              .valueOf();
            const endShow = moment
              .utc(item[TYPE_ITEM.endShow], "MM/DD/YYYY HH:mm:ss")
              .valueOf();

            const _item = {
              type: item[TYPE_ITEM.type]?.trim(),
              place: item[TYPE_ITEM.place]?.trim(),
              version: item[TYPE_ITEM.version]?.trim(), //localStore for visited should be unique
              name: item[TYPE_ITEM.name]?.trim(),
              title: item[TYPE_ITEM.title]?.trim(),
              description1: item[TYPE_ITEM.description1]?.trim(),
              description2: item[TYPE_ITEM.description2]?.trim(),
              link: item[TYPE_ITEM.link]?.trim(),
              startShow,
              endShow,
              color: item[TYPE_ITEM.color]?.trim(),
              banner: item[TYPE_ITEM.banner]?.trim(),
              bannerWeb: item[TYPE_ITEM.bannerWeb]?.trim(),
              webRouter: item[TYPE_ITEM.webRouter]?.trim(),
            };

            if (_item.type === TYPE.ACTIVITY) {
              if (_item.place === PLACE.INVEST) {
                json.activitiesInvest = json.activitiesInvest.concat(_item);
              } else {
                json.activities = json.activities.concat(_item);
                json.activitiesHome = json.activitiesHome.concat(_item);
              }
            } else if (_item.type === TYPE.NOTIFICATION) {
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
  // if (fs.existsSync(investPath)) {
  //   await new Promise((resolve, reject) => {
  //     const list = [];
  //     fs.createReadStream(investPath)
  //       .pipe(parse({ delimiter: ",", from_line: 2 }))
  //       .on("data", (data) => {
  //         list.push(data);
  //       })
  //       .on("end", () => {
  //         list.map((item) => {
  //           const startShow = moment
  //             .utc(item[6], "MM/DD/YYYY HH:mm:ss")
  //             .valueOf();
  //           const endShow = moment
  //             .utc(item[7], "MM/DD/YYYY HH:mm:ss")
  //             .valueOf();
  //
  //           const _item = {
  //             name: item[0],
  //             version: item[1], //localStore for visited should be unique
  //             type: item[2],
  //             bannerMobile: item[3],
  //             bannerLaptop: item[4],
  //             linkRule: item[5],
  //             startShow: startShow,
  //             endShow: endShow,
  //             link: item[8],
  //           };
  //           json.invest = json.invest.concat(_item);
  //           if (json.prev.endDate <= endShow) {
  //             json.prev.endDate = endShow;
  //           }
  //         }, undefined);
  //         resolve(json);
  //       })
  //       .on("error", function (error) {
  //         console.log(error.message);
  //         reject(error);
  //       });
  //   });
  // }
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

async function createTagJson() {
  const tagPath = `${_router}/tagConfig.csv`;
  if (fs.existsSync(tagPath)) {
    await new Promise((resolve, reject) => {
      const list = [];
      fs.createReadStream(tagPath)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", (data) => {
          list.push(data);
        })
        .on("end", () => {
          list.map((item) => {
            const startShow = moment
              .utc(item[TAGP_CONFIF_ITEM.startShow], "MM/DD/YYYY HH:mm:ss")
              .valueOf();
            const endShow = moment
              .utc(item[TAGP_CONFIF_ITEM.endShow], "MM/DD/YYYY HH:mm:ss")
              .valueOf();
            const key = item[TAGP_CONFIF_ITEM.scenario];
            const _item = {
              name: item[TAGP_CONFIF_ITEM.name].trim(),
              startShow,
              endShow,
              iconSource: item[TAGP_CONFIF_ITEM.iconSource].trim(),
              symbols: item[TAGP_CONFIF_ITEM.symbols]?.trim()?.split(","),
              scenarios: item[TAGP_CONFIF_ITEM.scenarios]?.trim()?.split(","),
            };
            json.campaignTagConfig[key] = [
              ...(json.campaignTagConfig[key] ?? []),
              _item,
            ];

            // json.campaignTagConfig = json.campaignTagConfig.concat(_item);
          }, undefined);
          console.log(json.campaignTagConfig);
          resolve(json);
        })
        .on("error", function (error) {
          console.log(error.message);
          reject(error);
        });
    });
  }
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
  await createTagJson();
  const jsonNotify = await getNotification();
  const totalNotifyPath = _router + `/notification.json`;
  try {
    await fs.unlink(totalNotifyPath);
    console.log(`Deleted ${totalNotifyPath}`);
  } catch (error) {
    // console.error(`Got an error trying to delete the file: ${error.message}`);
  }
  // console.log("investJson", investJson);
  fs.writeFileSync(
    totalNotifyPath,
    JSON.stringify({
      ...jsonNotify,
      invest: { ...investJson },
      campaignTagConfig: json.campaignTagConfig,
      prev: json.prev,
    })
  );
  // const storeFilePath = `${path.basename(filePath).replace(".csv", ".json")}`;
}
start();
// cd js file
// node generateNotification.js 2022/06

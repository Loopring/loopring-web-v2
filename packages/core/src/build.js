const fs = require("fs-extra");
const path = require("path");
// const ASSET_PATH = process.env.ASSET_PATH || '/';
const pathFrom = path.join(__dirname, "..", "assets");
const pathTo = path.join(__dirname, "src", "assets");
var mkdir = function (dir) {
  // making directory without exception if exists
  try {
    fs.mkdirSync(dir, 0o755);
  } catch (e) {
    if (e.code != "EEXIST") {
      throw e;
    }
  }
};
(async () => {
  try {
    console.log(pathFrom, pathTo);
    if (fs.existsSync(pathTo)) {
      fs.rmdirSync(pathTo, { recursive: true });
    }
    fs.mkdir(pathTo);
    fs.copy(pathFrom, pathTo, (err) => {
      err ? console.log(err) : "";
    });
    // await fs.unlink(path.join(__dirname,'src','asset'));
  } catch (e) {
    console.log(e);
  }
})();

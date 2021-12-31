let _myLog;
if (process.env.NODE_ENV !== "production") {
  _myLog = console.log;
} else {
  // @ts-ignore
  _myLog = function (message?: any, ...optionalParams: any[]) {};
}
let _myError;
if (process.env.NODE_ENV !== "production") {
  _myError = console.error;
} else {
  // @ts-ignore
  _myError = function (message?: any, ...optionalParams: any[]) {};
}
export const myLog = _myLog;
export const myError = _myError;

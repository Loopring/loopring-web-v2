let _myLog
// @ts-ignore
if (process.env.NODE_ENV !== 'production' || window?.___OhTrustDebugger___) {
  _myLog = console.log
} else {
  // @ts-ignore
  _myLog = function (message?: any, ...optionalParams: any[]) {}
}
let _myError
// @ts-ignore
if (process.env.NODE_ENV !== 'production' || window?.___OhTrustDebugger___) {
  _myError = console.error
} else {
  // @ts-ignore
  _myError = function (message?: any, ...optionalParams: any[]) {}
}
export const setMyLog = (___OhTrustDebugger___: boolean) => {
  if (___OhTrustDebugger___) {
    _myLog = console.log
  }
}
export const myLog = _myLog
export const myError = _myError

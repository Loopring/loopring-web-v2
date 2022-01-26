import { ConnectorError } from "@loopring-web/loopring-sdk";
import * as sdk from "@loopring-web/loopring-sdk";

export const checkErrorInfo = (
  errorInfo: sdk.RESULT_INFO,
  isFirstTime: boolean
) => {
  const message = errorInfo.message;
  if (isFirstTime && message === "NOT_SUPPORT_ERROR") {
    return ConnectorError.NOT_SUPPORT_ERROR;
  } else if (message === "USER_DENIED") {
    return ConnectorError.USER_DENIED;
  } else if (message) {
    const msgStr = errorInfo.message as string;
    if (
      msgStr.startsWith("personalSign last") ||
      msgStr.indexOf("User denied transaction") > 0
    ) {
      return message;
    }
  }

  return "OK";
};

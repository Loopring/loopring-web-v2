import * as sdk from "@loopring-web/loopring-sdk";
import { ConnectorError } from "@loopring-web/loopring-sdk";

export const checkErrorInfo = (
  errorInfo: sdk.RESULT_INFO,
  isFirstTime: boolean
) => {
  const message = errorInfo.message;
  if (isFirstTime && message === "NOT_SUPPORT_ERROR") {
    return ConnectorError.NOT_SUPPORT_ERROR;
  } else if (message === "USER_DENIED" || message === "USER_DENIED_2") {
    return ConnectorError.USER_DENIED;
  } else if (
    message &&
    (message.startsWith("personalSign last") ||
      message.indexOf("User denied transaction") > 0)
  ) {
    return ConnectorError.USER_DENIED;
  }
  return message;
};

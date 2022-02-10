import { useTranslation } from "react-i18next";
import { TOptions } from "i18next";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";

export const ErrorMap = {
  ERROR_UNKNOWN: {
    id: "ERROR_UNKNOWN",
    messageKey: "errorUnknown",
  },
  ERROR_FROM_FROM_SUBMIT: {
    id: "ERROR_FROM_FROM_SUBMIT",
    messageKey: "errorOnFromSubmit",
  },
  ERROR_WRONG_ACCOUNT: {
    id: "ERROR_WRONG_ACCOUNT",
    messageKey: "errorWrongAccount",
  },
  ERROR_WRONG_APIKEY: {
    id: "ERROR_WRONG_APIKEY",
    messageKey: "errorWrongApikey",
  },
  ERROR_ON_FEE: {
    id: "ERROR_ON_FEE",
    messageKey: "errorAboutFee",
  },
  LOADING_WHOLE_SITE: {
    id: "LOADING_WHOLE_SITE",
    messageKey: "errorLoading",
  },
  NO_SUPPORT_PAIR: {
    id: "NO_SUPPORT_PAIR",
    messageKey: "no support base/quote pair!",
  },
  NO_SDK: {
    id: "NO_SDK",
    messageKey: "errorBase",
  },
  NO_NETWORK_ERROR: {
    id: "NO_NETWORK_ERROR",
    messageKey: "errorMessageNoNetwork",
  },
  NO_TOKEN_MAP: {
    id: "NO_TOKEN_MAP",
    messageKey: "errorMessageTokenMapIsEmpty",
  },
  NO_ENOUGH_BALANCE: {
    id: "NO_ENOUGH_BALANCE",
    messageKey: "errorTokenNotEnough",
  },
  NO_TOKEN_KEY_LIST: {
    id: "NO_TOKEN_KEY_LIST",
    messageKey: "errorRequiredTokenKeyList",
  },
  GET_X_TOKEN_TICKER_ERROR: {
    id: "NO_TOKEN_KEY_LIST",
    messageKey: "errorRequiredTokenKeyList",
    options: {},
  },
  BUILD_AMM_MAP_WITH_TICKER: {
    id: "BUILD_AMM_MAP_WITH_TICKER",
    messageKey: "errorBase",
    options: {},
  },
  TRADE_LITE_SET_PAIR_ERROR: {
    id: "TRADE_LITE_SET_PAIR_ERROR",
    messageKey: "errorBase",
    options: {},
  },
  SOCKET_ERROR: {
    id: "SOCKET_ERROR",
    messageKey: "errorBase",
    options: {},
  },
  TRADE_404: {
    id: "404",
    messageKey: "error404",
    options: {},
  },
  NTF_ID_ENCODE_ERROR: {
    id: "NTF_ID_ENCODE_ERROR",
    messageKey: "NTF_ID_ENCODE_ERROR",
    options: {},
  },
  PROVIDER_ERROR: {
    id: "PROVIDER_ERROR",
    messageKey: "errorDisableOtherWalletForCurrent",
    options: {},
  },
  PROVIDER_NOT_INSTALL_GME: {
    id: "PROVIDER_NOT_INSTALL_GME",
    messageKey: "errorNotInstallGME",
    options: {},
  },
};
export enum UIERROR_CODE {
  UNKNOWN = 700001,
  PROVIDER_ERROR = 700002,
  PROVIDER_ERROR_Unknown = 700003,
  PROVIDER_NOT_INSTALL_GME = 700004,
}
export type ErrorObject = {
  from?: string;
  timestamp?: number;
  messageKey: string;
  [key: string]: any;
};
export const SDK_ERROR_MAP_TO_UI = {
  700001: ErrorMap.ERROR_UNKNOWN, //UI Unknown error =>
  700002: ErrorMap.PROVIDER_ERROR,
  700003: ErrorMap.ERROR_UNKNOWN,
  700004: ErrorMap.PROVIDER_NOT_INSTALL_GME,
  100000: ErrorMap.ERROR_UNKNOWN, //Unknown error =>
  100001: ErrorMap.ERROR_FROM_FROM_SUBMIT, //Invalid argument
  101002: ErrorMap.ERROR_WRONG_ACCOUNT, //User not found
  104001: ErrorMap.ERROR_WRONG_APIKEY, //Empty ApiKey
  104002: ErrorMap.ERROR_WRONG_APIKEY, //Invalid ApiKey
  104003: ErrorMap.ERROR_WRONG_ACCOUNT, //Invalid Account ID
  104004: ErrorMap.ERROR_FROM_FROM_SUBMIT, //No signature information provided
  104005: ErrorMap.ERROR_FROM_FROM_SUBMIT, //Wrong signature information
  102001: ErrorMap.ERROR_FROM_FROM_SUBMIT, //Exchange ID is incorrect
  102021: ErrorMap.ERROR_FROM_FROM_SUBMIT, //	Nonce is invalid
  102022: ErrorMap.ERROR_FROM_FROM_SUBMIT, //Transfer sender is invalid
  102023: ErrorMap.ERROR_FROM_FROM_SUBMIT, //Transfer receiver is invalid
  102024: ErrorMap.ERROR_ON_FEE, //Fee token is unsupported
  102025: ErrorMap.ERROR_ON_FEE, //Fee token is unsupported//Transfer token isnt consistent with fee token
};
export const TransErrorHelp = ({
  error,
  options,
}: {
  error: RESULT_INFO;
  options?: TOptions<any> | string;
}) => {
  const { t } = useTranslation(["error"]);
  const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001];
  if (errorItem) {
    return <>{t(errorItem.messageKey, options ?? errorItem.options)}</>;
  } else {
    return <>{error.message}</>;
  }
};

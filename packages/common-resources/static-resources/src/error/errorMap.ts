export const ErrorMap = {
    LOADING_WHOLE_SITE: {
        id: 'LOADING_WHOLE_SITE',
        messageKey: 'errorLoading'
    },
    NO_SUPPORT_PAIR: {
        id: 'NO_SUPPORT_PAIR',
        messageKey: 'no support base/quote pair!'
    },
    NO_SDK: {
        id: 'NO_SDK',
        messageKey: 'errorBase'
    },
    NO_NETWORK_ERROR: {
        id: 'NO_NETWORK_ERROR',
        messageKey: 'errorMessageNoNetwork'
    },
    NO_TOKEN_MAP: {
        id: 'NO_TOKEN_MAP',
        messageKey: 'errorMessageTokenMapIsEmpty'
    },
    NO_ENOUGH_BALANCE: {
        id: 'NO_ENOUGH_BALANCE',
        messageKey: 'errorTokenNotEnough'
    },
    NO_TOKEN_KEY_LIST: {
        id: 'NO_TOKEN_KEY_LIST',
        messageKey: 'errorRequiredTokenKeyList'
    },
    GET_X_TOKEN_TICKER_ERROR: {
        id: 'NO_TOKEN_KEY_LIST',
        messageKey: 'errorRequiredTokenKeyList',
        options: {}
    },
    BUILD_AMM_MAP_WITH_TICKER: {
        id: 'BUILD_AMM_MAP_WITH_TICKER',
        messageKey: 'errorBase',
        options: {}
    },
    TRADE_LITE_SET_PAIR_ERROR: {
        id: 'TRADE_LITE_SET_PAIR_ERROR',
        messageKey: 'errorBase',
        options: {}
    },
    SOCKET_ERROR: {
        id: 'SOCKET_ERROR',
        messageKey: 'errorBase',
        options: {}
    },
    TRADE_404: {
        id: '404',
        messageKey: 'error404',
        options: {}
    }

}

export type ErrorObject = {
    from?: string,
    timestamp?: number,
    messageKey: string
    [ key: string ]: any,
}

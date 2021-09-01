import { ConnectorError } from "loopring-sdk"

export const checkErrorInfo = (errorInfo: any, isFirstTime: boolean) => {
    if (errorInfo?.errMsg === 'USER_DENIED' || (errorInfo?.message
        && (errorInfo.message as string).startsWith('personalSign last') ||
        (errorInfo.message as string).indexOf('User denied transaction') > 0)) {
        return ConnectorError.USER_DENIED
    } else if (isFirstTime && errorInfo?.errMsg === 'NOT_SUPPORT_ERROR') {
        return ConnectorError.NOT_SUPPORT_ERROR
    }
    
    return 'OK'
}

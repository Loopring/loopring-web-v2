import { ConnectorError } from "loopring-sdk"

export const checkErrorInfo = (errorInfo: any, isFirstTime: boolean) => {

    if (isFirstTime && errorInfo?.errMsg === 'NOT_SUPPORT_ERROR') {
        return ConnectorError.NOT_SUPPORT_ERROR
    } else if (errorInfo?.errMsg === 'USER_DENIED') {
        return ConnectorError.USER_DENIED
    } else if (errorInfo?.message) {
        const msgStr = errorInfo.message as string
        if (msgStr.startsWith('personalSign last') || msgStr.indexOf('User denied transaction') > 0) {
            return ConnectorError.USER_DENIED
        }
    }

    return 'OK'
}

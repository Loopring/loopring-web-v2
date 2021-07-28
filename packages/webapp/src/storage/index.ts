import { myLog } from "utils/log_tools"

export enum CONSTANTS {
    Handler = 'handler',
    AccountId = 'account_id',
    Account = 'account',
    Apikey = 'apikey',
    Eddsakey = 'eddsakey',
    ActiveTime = 'active_time',
    AmmOrder = 'amm_order',
    HardwareAddresses = 'hardware_addresses',
    ConnectorName = 'connector_name',

    WalletConnect = 'walletconnect',
}

const SESSION_TIMEOUT_SECONDS = 600

export class UserStorage {

    public static clearWalletConnect() {
        myLog('try to clearWalletConnect....')
        localStorage.removeItem(CONSTANTS.WalletConnect)
    }

    public static setConnectorName(connectionName: string) {
        localStorage.setItem(CONSTANTS.ConnectorName, connectionName)
    }

    public static getConnectorName() {
        return localStorage.getItem(CONSTANTS.ConnectorName)
    }

    public static clearConnectorName() {
        myLog('try to clearConnectorName')
        localStorage.removeItem(CONSTANTS.ConnectorName)
    }

    public static getHandler() {
        const rawHandler = sessionStorage.getItem(CONSTANTS.Handler)
        try {
            if (rawHandler !== undefined && rawHandler !== null)
                return parseInt(rawHandler)
        } catch (err) {
        }
        return undefined
    }

    public static setHandler(handler: any) {
        sessionStorage.setItem(CONSTANTS.Handler, handler)
    }

    public static clearHandler() {
        sessionStorage.removeItem(CONSTANTS.Handler)
    }

    public static checkTimeout(reset: boolean = false) : boolean {
        let dateTimeStr = localStorage.getItem(CONSTANTS.ActiveTime)
        let now = new Date().getTime()

        if (dateTimeStr !== null && !reset) {
            let tmpDt = new Date(parseInt(dateTimeStr))

            if(now - tmpDt.getTime() > SESSION_TIMEOUT_SECONDS * 1000) {
                myLog(`TIMEOUT! now:${now} dateTimeStr:${dateTimeStr} delta:${now - tmpDt.getTime()}`)
                sessionStorage.clear()
                localStorage.setItem(CONSTANTS.ActiveTime, now.toString())
                return true
            }
        } else {
            localStorage.setItem(CONSTANTS.ActiveTime, now.toString())
        }

        return false
    }


    public static getAccountId() {
        const rawId = sessionStorage.getItem(CONSTANTS.AccountId)
        try {
            if (rawId)
                return parseInt(rawId)
        } catch (err) {
        }
        return undefined
    }

    public static setAccountId(accountId: number) {
        sessionStorage.setItem(CONSTANTS.AccountId, accountId.toString())
    }

    public static getAccount() {
        return sessionStorage.getItem(CONSTANTS.Account)
    }

    public static setAccount(account: string) {
        sessionStorage.setItem(CONSTANTS.Account, account)
    }

    public static getApikey() {
        return sessionStorage.getItem(CONSTANTS.Apikey)
    }

    public static setApikey(apikey: string) {
        sessionStorage.setItem(CONSTANTS.Apikey, apikey)
    }

    public static getEddsakey() {
        return sessionStorage.getItem(CONSTANTS.Eddsakey)
    }

    public static setEddsakey(eddsakey: string) {
        sessionStorage.setItem(CONSTANTS.Eddsakey, eddsakey)
    }

    public static getAmmOrder(): string {
        var orderHash = localStorage.getItem(CONSTANTS.AmmOrder)
        return orderHash ? orderHash : ''
    }

    public static setAmmOrder(orderHash: string) {
        localStorage.setItem(CONSTANTS.AmmOrder, orderHash)
    }

    public static clearAmmOrder() {
        localStorage.removeItem(CONSTANTS.AmmOrder)
    }

    public static isHardwareAddress(address: string) {
        let current = localStorage.getItem(CONSTANTS.HardwareAddresses)
        if (current) {
            if (current.includes(address.toLowerCase())) {
                return true
            }
        }
        return false
    }

    public static saveHardwareAddress(address: string) {
        let current = localStorage.getItem(CONSTANTS.HardwareAddresses);
        if (current) {
            if (current.includes(address.toLowerCase()) !== true) {
                let newValue = current + ',' + address.toLowerCase();
                localStorage.setItem(CONSTANTS.HardwareAddresses, newValue);
            }
        } else {
            localStorage.setItem(CONSTANTS.HardwareAddresses, address.toLowerCase());
        }

    }
}

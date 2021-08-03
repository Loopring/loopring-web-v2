import { Account } from '@loopring-web/common-resources';
import { Subject } from 'rxjs';
import { Commands } from '@loopring-web/web3-provider';

const subject = new Subject<{ status: keyof typeof Commands, data: any, }>();

function getLocalDepositHash(account: Account): {[key:string]:any}|undefined {
    let depositsHash = window.localStorage.getItem('__loopring__.depositsHash');
    if (depositsHash) {
        depositsHash = JSON.parse(depositsHash);
        if (depositsHash && depositsHash[ account.accAddress ]) {
            return depositsHash[ account.accAddress ]
        }
    }
    return undefined
}

function clearDepositHash(account: Account, value: string) {
    // @ts-ignore
    let depositsHash: { [ key: string ]:object } = window.localStorage.getItem('__loopring__.depositsHash');
    depositsHash = depositsHash ? JSON.parse(depositsHash as any) : {};
    if ( depositsHash[ account.accAddress ] && depositsHash[ account.accAddress ][value]) {
        delete depositsHash[ account.accAddress ][value];
    }
}

function setLocalDepositHash(account: Account, value: string): void {
    // @ts-ignore
    let depositsHash: { [ key: string ]:object} = window.localStorage.getItem('__loopring__.depositsHash');
    depositsHash = depositsHash ? JSON.parse(depositsHash as any) : {};
    depositsHash[ account.accAddress ] = {
        ...depositsHash[ account.accAddress ],
        [value]:1,
    }
}

export const walletLayer2Services = {
    // ...walletServices,

    sendLayer2Processing: () => {

    },
    //INFO: for update Account and unlock account
    sendAssign: () => {

    },
    //INFO: for lock account todo clear the private info, user click or provider on wrong network
    sendLock: () => {

    },
    sendActiveAccountDeposit: () => {

    },
    sendCheckAccount: () => {

    },
    sendHadAccount:()=>{

    },
    checkIsDepositing: () => {

    },
    onSocket: () => subject.asObservable()
    // clearMessages: () => subject.next(),
    // onSocket: () => subject.asObservable()
};
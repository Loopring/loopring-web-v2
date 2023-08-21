import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { updateContacts, getContactsStatus } from './reducer'

import { LoopringAPI, store } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk';
// export const getAllContacts = async (
//     offset: number,
//     accountId: number,
//     apiKey: string,
//     accountAddress: string,
//     color: string,
// ) => {
//   const limit = 100
//   const recursiveLoad = async (offset: number): Promise<DisplayContact[]> => {
//     const isHebao = await checkIsHebao(accountAddress)
//     const response = await LoopringAPI.contactAPI!.getContacts(
//         {
//           isHebao,
//           accountId,
//           limit,
//           offset,
//         },
//         apiKey,
//     )
//     const displayContacts = response.contacts
//         .filter((contact) => contact.addressType !== sdk.AddressType.OFFICIAL)
//         .map((contact) => {
//           return {
//             name: contact.contactName,
//             address: contact.contactAddress,
//             avatarURL: createImageFromInitials(32, contact.contactName, color),
//             editing: false,
//             addressType: contact.addressType,
//           } as DisplayContact
//         })
//     if (response.total > offset + limit) {
//       const rest = await recursiveLoad(offset + limit)
//       return displayContacts.concat(rest)
//     } else {
//       return displayContacts
//     }
//   }
//   return recursiveLoad(offset)
// }
const getContractsApi = async ({limit = 100}: { limit?: number }) => {
    const {isContractAddress, isCFAddress, accountId, apiKey} = store.getState().account
    let contacts: any[] = []
    if (apiKey && LoopringAPI.contactAPI && accountId) {
        const response = await LoopringAPI.contactAPI?.getContacts(
            {
                isHebao: !!(isContractAddress || isCFAddress),
                accountId,
                limit,
                offset: 0,
            },
            apiKey,
        )
        if (
            response &&
            ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
        ) {
            throw new Error((response as sdk.RESULT_INFO).message)
        }
        contacts = response.contacts;
        if (response.total > limit) {
            let more: Promise<any>[] = [];
            for (let i = 1; i <= response.total / limit; i++) {
                more.push(LoopringAPI.contactAPI.getContacts(
                    {
                        isHebao: !!(isContractAddress || isCFAddress),
                        accountId,
                        limit,
                        offset: i * limit,
                    },
                    apiKey,
                ).then(res => {
                    if (
                        response &&
                        ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
                    ) {
                        throw new Error((response as sdk.RESULT_INFO).message)
                    }
                    return res.contacts
                }))
            }
            const res = await Promise.all(more)
            contacts = contacts.concat(res.flat())
        }
    }
    return {contacts};
}

export function* getPostsSaga() {
    try {
        const {contacts} = yield call(getContractsApi, {})
        yield put(getContactsStatus({contacts}))
    } catch (err) {
        yield put(getContactsStatus({error: err}))
    }
}

function* contractsSaga() {
    yield all([takeLatest(updateContacts, getPostsSaga)])
}

export const contractsForks = [
    fork(contractsSaga),
]

import * as sdk from '@loopring-web/loopring-sdk'
import { ChainId } from '@loopring-web/loopring-sdk'
import { LoopringAPI } from '../../api_wrapper'
import {
  Account,
  BANXA_URLS,
  BanxaOrder,
  myLog,
  VendorProviders,
} from '@loopring-web/common-resources'
import { resetTransferBanxaData, store } from '../../stores'
import { Subject } from 'rxjs'
import { offFaitService } from './offFaitService'
import {
  // AccountStep,
  setShowAccount,
} from '@loopring-web/component-lib'

export enum BalanceReason {
  Balance = 0,
  FeeAndBalance = 1,
}

export enum BanxaCheck {
  CheckOrderStatus = 0,
  OrderEnd = 1,
  OrderHide = 2,
  OrderShow = 3,
}

export enum OrderENDReason {
  UserCancel = 0,
  Expired = 1,
  Done = 2,
  Waiting = 3,
  BanxaNotReady,
  CreateOrderFailed = 4,
}

export const banxaApiCall = async ({
  url,
  query,
  payload,
  method,
  chainId,
  account,
}: {
  url: string
  query: URLSearchParams | string | string[][]
  payload: object | undefined
  method: sdk.ReqMethod
  chainId: ChainId
  account: Account
}): Promise<{ data: any }> => {
  const querys = url + (query ? '?' + new URLSearchParams(query).toString() : '')
  const { result } = (await LoopringAPI.globalAPI?.getBanxaAPI(
    {
      url: BANXA_URLS[chainId as number],
      method,
      query: querys,
      accountId: account.accountId,
      payload: JSON.stringify(payload),
    },
    account.eddsaKey.sk,
    account.apiKey,
  )) ?? { result: null }
  let data: any
  try {
    // @ts-ignore
    data = JSON.parse(result)?.data
  } catch (e) {}
  return { data }
}

const subject = new Subject<{
  status: BanxaCheck
  data?: {
    [key: string]: any
  }
}>()
export const banxaService = {
  banxaCheckHavePending: async () => {
    const {
      account,
      system: { chainId },
      localStore: { offRampHistory },
      // modals:{isShowAccount}
    } = store.getState()
    if (
      offRampHistory[chainId][account.accAddress] &&
      offRampHistory[chainId][account.accAddress][VendorProviders.Banxa] &&
      offRampHistory[chainId][account.accAddress][VendorProviders.Banxa]['pending']
    ) {
      const _order = offRampHistory[chainId][account.accAddress][VendorProviders.Banxa]['pending']
      const { data } = await banxaApiCall({
        chainId: chainId as ChainId,
        method: sdk.ReqMethod.GET,
        url: `/api/orders/${_order.orderId}`,
        query: '',
        payload: {},
        account,
      })
      if (data) {
        myLog('banxa Check Have Pending', data.order)

        offFaitService.banxaCheckStatus({
          data: data.order,
        })
        return data
      }
    }
  },
  openOldOne: async () => {
    const {
      account,
      system: { chainId },
      localStore: { offRampHistory },
      // modals:{isShowAccount}
    } = store.getState()

    store.dispatch(setShowAccount({ isShow: false, info: { isBanxaLaunchLoading: true } }))
    if (
      offRampHistory[chainId][account.accAddress] &&
      offRampHistory[chainId][account.accAddress][VendorProviders.Banxa] &&
      offRampHistory[chainId][account.accAddress][VendorProviders.Banxa]['pending'] &&
      offRampHistory[chainId][account.accAddress][VendorProviders.Banxa]['pending'].checkout_iframe
    ) {
    } else {
      banxaService.banxaStart(true)
    }
  },
  banxaStart: async (_createNew = false) => {
    const {
      account,
      system: { chainId },
      // localStore: { offRampHistory },
    } = store.getState()
    let banxa: any = undefined
    try {
      // @ts-ignore
      banxa = new window.Banxa('loopring', chainId == ChainId.SEPOLIA ? 'sandbox' : '')
    } catch (e) {
      banxaService.banxaEnd({
        reason: OrderENDReason.BanxaNotReady,
        data: 'Banxa SKD is not ready',
      })
      return
    }
    store.dispatch(setShowAccount({ isShow: false, info: { isBanxaLaunchLoading: true } }))
    const anchor: any = window.document.querySelector('#iframeBanxaTarget')
    // anchor.querySelector("anchor");
    if (anchor && banxa) {
      anchor.style.display = 'flex'
      try {
        const { data } = await banxaApiCall({
          chainId: chainId as ChainId,
          account,
          method: sdk.ReqMethod.POST,
          url: '/api/orders',
          query: '',
          payload: {
            blockchain: 'LRC',
            iframe_domain: window.location.href.replace(/http(s)?:\/\//, ''), //: BANXA_URLS[chainId].replace(/http(s)?:\/\//, ""),
            source: 'USDT',
            target: 'AUD',
            refund_address: account.accAddress,
            return_url_on_success: 'https://beta.loopring.io/#/trade/fiat/Sell',
            account_reference: account.accAddress,
          },
        })

        banxa.generateIframe(
          '#iframeBanxaTarget',
          data.order.checkout_iframe,
          false,
          // "800px", //Optional width parameter – Pass false if not needed.
          // "400px" //Optional height parameter – Pass false if not needed.
        )
        offFaitService.banxaCheckStatus({
          data: {
            ...data.order,
            status: data.order.status ?? 'create',
            id: data.order.id,
          },
        })
        subject.next({
          status: BanxaCheck.CheckOrderStatus,
          data: data,
        })
      } catch (e) {
        banxaService.banxaEnd({
          reason: OrderENDReason.CreateOrderFailed,
          data: (e as any)?.message,
        })
      }
    }

    // @ts-ignore
  },
  KYCDone: () => {
    subject.next({
      status: BanxaCheck.OrderHide,
      data: {
        reason: 'KYCDone',
      },
    })
  },
  TransferDone: ({ order }: { order: Partial<BanxaOrder> }) => {
    offFaitService.banxaCheckStatus({
      data: {
        status: 'paymentReceived',
        id: order.id ?? '',
        wallet_address: order.wallet_address,
      },
    })
    subject.next({
      status: BanxaCheck.OrderShow,
      data: {
        reason: 'transferDone',
        id: order.id ?? '',
      },
    })
  },
  orderDone: () => {},
  orderExpired: () => {
    banxaService.banxaEnd({ reason: OrderENDReason.Expired, data: '' })
  },
  banxaEnd: ({ reason, data }: { reason: OrderENDReason; data: any }) => {
    store.dispatch(resetTransferBanxaData(undefined))
    const parentsNode: any = window.document.querySelector('#iframeBanxaTarget')
    parentsNode.style = 'display: none'
    const items = parentsNode?.getElementsByTagName('iframe')
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      item && item.parentNode.removeChild(item)
    }
    subject.next({
      status: BanxaCheck.OrderEnd,
      data: {
        reason,
        data,
      },
    })
  },
  banxaConfirm: () => {},
  onSocket: () => subject.asObservable(),
}

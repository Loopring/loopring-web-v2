import { store } from '../../stores'
import {
  myLog,
  OffRampHashItem,
  OffRampHashItemObj,
  OffRampStatus,
  VendorProviders,
} from '@loopring-web/common-resources'
import { banxaApiCall, banxaService } from './banxaService'
import * as sdk from '@loopring-web/loopring-sdk'
import { updateOffRampHash } from '../../stores/localStore/offRamp'
import { Subject } from 'rxjs'

let __timer__: -1 | NodeJS.Timeout = -1

export enum OffFaitCommon {
  ShowUI = 'ShowUI',
  OffFaitCancel = 'OffFaitCancel',
}

export type OffOderUIItem = {
  order: any
  orderStatus: OffRampStatus
  product: VendorProviders
}
const subject = new Subject<{
  status: OffFaitCommon
  data?: {
    [key: string]: any
  }
}>()
export const offFaitService = {
  backendCheckStart: () => {
    const {
      localStore: { offRampHistory },
      system: { chainId },
      account,
    } = store.getState()
    if (__timer__ !== -1) {
      clearTimeout(__timer__)
    }
    if (
      account?.accAddress &&
      offRampHistory[chainId] &&
      offRampHistory[chainId][account?.accAddress]
    ) {
      const { pending, payments }: OffRampHashItemObj = offRampHistory[chainId][account.accAddress][
        VendorProviders.Banxa
      ] ?? { pending: undefined, payments: undefined }
      let promise: any = [...payments]
      if (pending) {
        promise.push(pending)
      }
      if (promise.length) {
        promise = promise.reduce((prev: any[], item: any) => {
          const ajxa = banxaApiCall({
            chainId: chainId as sdk.ChainId,
            method: sdk.ReqMethod.GET,
            url: `/api/orders/${item.orderId}`,
            query: '',
            payload: {},
            account,
          })
          return [...prev, ajxa]
        }, [])

        Promise.all(promise as Promise<any>[])
          .then((result) => {
            result.forEach(({ data }: any) => {
              if (data?.order) {
                offFaitService.banxaCheckStatus({ data: data?.order })
              }
            })
          })
          .catch(() => {})

        __timer__ = setTimeout(() => {
          offFaitService.backendCheckStart()
        }, 120000)
      }
    }
  },
  offRampCancel: ({ data: order }: { data: any }) => {
    const {
      system: { chainId },
      account: { accAddress },
    } = store.getState()
    store.dispatch(
      updateOffRampHash({
        ...order,
        address: accAddress,
        chainId,
        status: OffRampStatus.cancel,
      } as OffRampHashItem),
    )
    subject.next({
      status: OffFaitCommon.OffFaitCancel,
      data: {
        reason: 'offRampCancel',
        id: order.id ?? '',
      },
    })
  },
  banxaCheckStatus: ({
    data: order,
  }: {
    data: Omit<OffRampHashItem, 'status' | 'orderId'> & {
      status: string
      id: string
    }
  }) => {
    const {
      system: { chainId },
      account,
    } = store.getState()

    if (order && order.status) {
      if (order?.wallet_address && order.status === 'waitingPayment') {
        offFaitService.notifyUI({
          data: order,
          product: VendorProviders.Banxa,
          status: OffRampStatus.watingForCreateOrder,
        })
      } else if (order.status === 'refunded') {
        offFaitService.notifyUI({
          data: order,
          product: VendorProviders.Banxa,
          status: OffRampStatus.refund,
        })
      } else if (order.status === 'complete') {
        offFaitService.notifyUI({
          data: order,
          product: VendorProviders.Banxa,
          status: OffRampStatus.done,
        })
      }
      const _order = {
        orderId: order.id,
        address: account.accAddress,
        chainId,
        product: VendorProviders.Banxa,
        ...(order?.checkout_iframe ? { checkout_iframe: order?.checkout_iframe } : {}),
        ...(order?.wallet_address
          ? { wallet_address: order?.wallet_address?.toString() ?? undefined }
          : {}),
        ...(order?.account_reference ? { account_reference: order?.account_reference } : {}),
      }
      if (
        order.status === 'waitingPayment' ||
        order.status === 'pendingPayment' ||
        order.status === 'create'
      ) {
        store.dispatch(
          updateOffRampHash({
            ..._order,
            status: OffRampStatus.watingForCreateOrder,
          } as OffRampHashItem),
        )
        myLog('watingForCreateOrder')
      } else if (order.status === 'paymentReceived' || order.status === 'inProgress') {
        store.dispatch(
          updateOffRampHash({
            ..._order,
            status: OffRampStatus.waitingForWithdraw,
          } as OffRampHashItem),
        )
      } else if (
        order.status === 'cancelled' ||
        order.status === 'expired' ||
        order.status === 'declined'
      ) {
        store.dispatch(
          updateOffRampHash({
            ..._order,
            status: OffRampStatus.expired,
          } as OffRampHashItem),
        )
        banxaService.orderExpired()
      } else if (order.status === 'refunded') {
        store.dispatch(
          updateOffRampHash({
            ..._order,
            status: OffRampStatus.refund,
          } as OffRampHashItem),
        )
      } else if (order.status === 'complete') {
        store.dispatch(
          updateOffRampHash({
            ..._order,
            status: OffRampStatus.done,
          } as OffRampHashItem),
        )
      }
    }
  },
  notifyUI: ({
    data: order,
    status,
    product,
  }: {
    data: Omit<OffRampHashItem, 'status' | 'orderId'> & {
      status: string
      id: string
    }
    status: OffRampStatus
    product: VendorProviders
  }) => {
    subject.next({
      status: OffFaitCommon.ShowUI,
      data: { order, orderStatus: status, product },
    })
  },
  banxaEnd: () => {
    if (__timer__ !== -1) {
      clearTimeout(__timer__)
    }
  },
  onSocket: () => subject.asObservable(),
}

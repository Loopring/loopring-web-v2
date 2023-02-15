import { store } from "../../stores";
import {
  OffRampHashItem,
  OffRampHashItemObj,
  OffRampStatus,
  VendorProviders,
} from "@loopring-web/common-resources";
import { banxaApiCall } from "./banxaService";
import * as sdk from "@loopring-web/loopring-sdk";
import { updateOffRampHash } from "../../stores/localStore/offRamp";
import { Subject } from "rxjs";

let __timer__: -1 | NodeJS.Timeout = -1;

export enum OffFaitCommon {
  ShowUI = "ShowUI",
}

export type OffOderUIItem = {
  order: any;
  orderStatus: OffRampStatus;
  product: VendorProviders;
};
const subject = new Subject<{
  status: OffFaitCommon;
  data?: {
    [key: string]: any;
  };
}>();
export const offFaitService = {
  backendCheckStart: () => {
    const {
      localStore: { offRampHistory },
      system: { chainId },
      account,
    } = store.getState();
    if (__timer__ !== -1) {
      clearTimeout(__timer__);
    }
    if (account?.accAddress && offRampHistory[chainId][account?.accAddress]) {
      const { pending, payments }: OffRampHashItemObj = offRampHistory[chainId][
        account.accAddress
      ][VendorProviders.Banxa] ?? { pending: undefined, payments: undefined };
      let promise: any = [...payments];
      if (pending) {
        promise.push(pending);
      }
      if (promise.length) {
        promise = promise.reduce((prev: any[], item: any) => {
          const ajxa = banxaApiCall({
            chainId: chainId as sdk.ChainId,
            method: sdk.ReqMethod.GET,
            url: `/api/orders/${item.orderId}`,
            query: "",
            payload: {},
            account,
          });
          return [...prev, ajxa];
        }, []);
        Promise.all(promise as Promise<any>[]).then((result) => {
          result.forEach(({ data }: any) => {
            if (data?.order) {
              offFaitService.banxaCheckStatus({ data: data?.order });
            }
          });
        });

        __timer__ = setTimeout(() => {
          offFaitService.backendCheckStart();
        }, 600000);
      }
    }
  },
  offRampCancel: ({ data: order }: { data: any }) => {
    store.dispatch(
      updateOffRampHash({
        ...order,
        status: OffRampStatus.cancel,
      } as OffRampHashItem)
    );
  },
  banxaCheckStatus: ({ data: order }: { data: any }) => {
    const {
      system: { chainId },
      account,
    } = store.getState();
    if (order && order.status) {
      if (order.wallet_address && order.status === "waitingPayment") {
        offFaitService.notifyUI({
          data: order,
          product: VendorProviders.Banxa,
          status: OffRampStatus.watingForCreateOrder,
        });
      } else if (order.wallet_address && order.status === "refunded") {
        offFaitService.notifyUI({
          data: order,
          product: VendorProviders.Banxa,
          status: OffRampStatus.refund,
        });
      } else if (order.wallet_address && order.status === "complete") {
        offFaitService.notifyUI({
          data: order,
          product: VendorProviders.Banxa,
          status: OffRampStatus.done,
        });
      }
      if (
        (order.wallet_address && order.status === "waitingPayment") ||
        (order.wallet_address && order.status === "pendingPayment")
      ) {
        store.dispatch(
          updateOffRampHash({
            orderId: order.orderId,
            address: account.accAddress,
            product: VendorProviders.Banxa,
            status: OffRampStatus.watingForCreateOrder,
          } as OffRampHashItem)
        );
      } else if (
        (order.wallet_address && order.status === "paymentReceived") ||
        (order.wallet_address && order.status === "inProgress")
      ) {
        store.dispatch(
          updateOffRampHash({
            orderId: order.orderId,
            address: account.accAddress,
            product: VendorProviders.Banxa,
            status: OffRampStatus.waitingForWithdraw,
          } as OffRampHashItem)
        );
      } else if (
        (order.wallet_address && order.status === "cancelled") ||
        (order.wallet_address && order.status === "expired") ||
        (order.wallet_address && order.status === "declined")
      ) {
        store.dispatch(
          updateOffRampHash({
            orderId: order.orderId,
            address: account.accAddress,
            product: VendorProviders.Banxa,
            chainId,
            status: OffRampStatus.expired,
          } as OffRampHashItem)
        );
      } else if (order.wallet_address && order.status === "refunded") {
        store.dispatch(
          updateOffRampHash({
            orderId: order.orderId,
            address: account.accAddress,
            product: VendorProviders.Banxa,
            status: OffRampStatus.refund,
          } as OffRampHashItem)
        );
      } else if (order.wallet_address && order.status === "complete") {
        store.dispatch(
          updateOffRampHash({
            orderId: order.orderId,
            address: account.accAddress,
            product: VendorProviders.Banxa,
            status: OffRampStatus.done,
          } as OffRampHashItem)
        );
      }
    }
  },
  notifyUI: ({
    data: order,
    status,
    product,
  }: {
    data: { order: any; status: OffRampStatus };
    status: OffRampStatus;
    product: VendorProviders;
  }) => {
    subject.next({
      status: OffFaitCommon.ShowUI,
      data: { order, orderStatus: status, product },
    });
  },
  banxaEnd: () => {
    if (__timer__ !== -1) {
      clearTimeout(__timer__);
    }
  },
  onSocket: () => subject.asObservable(),
};

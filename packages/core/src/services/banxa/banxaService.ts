import * as sdk from "@loopring-web/loopring-sdk";
import { ChainId } from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";
import { Account, BANXA_URLS } from "@loopring-web/common-resources";
import { resetTransferBanxaData, store } from "../../stores";
import { Subject } from "rxjs";

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
  url: string;
  query: URLSearchParams | string | string[][];
  payload: object | undefined;
  method: sdk.ReqMethod;
  chainId: ChainId;
  account: Account;
}): Promise<{ data: any }> => {
  const querys =
    url + (query ? "?" + new URLSearchParams(query).toString() : "");
  const { result } = (await LoopringAPI.globalAPI?.getBanxaAPI(
    {
      url: BANXA_URLS[chainId as number],
      method,
      query: querys,
      accountId: account.accountId,
      payload: JSON.stringify(payload),
    },
    account.eddsaKey.sk,
    account.apiKey
  )) ?? { result: null };
  let data: any;
  try {
    // @ts-ignore
    data = JSON.parse(result)?.data;
  } catch (e) {}
  return { data };
};

const subject = new Subject<{
  status: BanxaCheck;
  data?: {
    [key: string]: any;
  };
}>();
export const banxaService = {
  banxaStart: async () => {
    const {
      account,
      system: { chainId },
    } = store.getState();

    let banxa: any = undefined;
    try {
      // @ts-ignore
      banxa = new window.Banxa(
        "loopring",
        chainId == ChainId.GOERLI ? "sandbox" : ""
      );
    } catch (e) {
      banxaService.banxaEnd({
        reason: OrderENDReason.BanxaNotReady,
        data: "Banxa SKD is not ready",
      });

      // subject.next({
      //   status: BanxaCheck.o,
      //   data: data,
      // });
    }
    // @ts-ignore
    const anchor: any = window.document.querySelector("#iframeBanxaTarget");
    // anchor.querySelector("anchor");
    if (anchor && banxa) {
      // debugger;
      anchor.style.display = "flex";
      try {
        const { data } = await banxaApiCall({
          chainId: chainId as ChainId,
          account,
          method: sdk.ReqMethod.POST,
          url: "/api/orders",
          query: "",
          payload: {
            blockchain: "LRC",
            iframe_domain: window.location.href.replace(/http(s)?:\/\//, ""), //: BANXA_URLS[chainId].replace(/http(s)?:\/\//, ""),
            source: "USDT",
            target: "AUD",
            refund_address: account.accAddress,
            return_url_on_success: "https://loopring.io/#/l2assets",
            account_reference: account.accAddress,
          },
        });
        // TODO: console.log

        console.log("BANXA create order", data.order);

        banxa.generateIframe(
          "#iframeBanxaTarget",
          data.order.checkout_iframe,
          false
          // "800px", //Optional width parameter – Pass false if not needed.
          // "400px" //Optional height parameter – Pass false if not needed.
        );
        subject.next({
          status: BanxaCheck.CheckOrderStatus,
          data: data,
        });
      } catch (e) {
        banxaService.banxaEnd({
          reason: OrderENDReason.CreateOrderFailed,
          data: (e as any)?.message,
        });
      }
    }
  },
  KYCDone: () => {
    subject.next({
      status: BanxaCheck.OrderHide,
      data: {
        reason: "KYCDone",
      },
    });
  },
  TransferDone: () => {
    subject.next({
      status: BanxaCheck.OrderShow,
      data: {
        reason: "transferDone",
      },
    });
  },
  orderDone: () => {},
  orderExpired: () => {
    banxaService.banxaEnd({ reason: OrderENDReason.Expired, data: "" });
  },
  banxaEnd: ({ reason, data }: { reason: OrderENDReason; data: any }) => {
    store.dispatch(resetTransferBanxaData(undefined));
    const parentsNode: any =
      window.document.querySelector("#iframeBanxaTarget");
    const items = parentsNode.getElementsByTagName("iframe");
    if (items && items[0]) {
      [].slice.call(items).forEach((item) => parentsNode.removeChild(item));
    }
    subject.next({
      status: BanxaCheck.OrderEnd,
      data: {
        reason,
        data,
      },
    });
  },
  banxaConfirm: () => {},
  onSocket: () => subject.asObservable(),
};

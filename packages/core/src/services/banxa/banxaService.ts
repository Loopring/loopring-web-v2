import { ChainId } from "@loopring-web/loopring-sdk";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";
import { BANXA_URLS, BanxaOrder, myLog } from "@loopring-web/common-resources";
import axios from "axios";
import { resetTransferBanxaData, store } from "../../stores";
import { Subject } from "rxjs";

export const mockReturn: { order: BanxaOrder } = {
  order: {
    id: "dd734aec66eb781ecc7f7bb01274ec63",
    account_id: "324a77f69fc5797c2afbe67efefddbba",
    account_reference: "0xff7d59d9316eba168837e3ef924bcdfd64b237d8",
    order_type: "CRYPTO-SELL",
    payment_type: null,
    ref: null,
    fiat_code: "AUD",
    fiat_amount: 0,
    coin_code: "USDC",
    coin_amount: 0,
    wallet_address: null,
    wallet_address_tag: null,
    fee: null,
    fee_tax: null,
    payment_fee: null,
    payment_fee_tax: null,
    commission: null,
    tx_hash: null,
    tx_confirms: 0,
    created_date: "30-Nov-2022",
    created_at: "30-Nov-2022 17:48:25",
    status: "pendingPayment",
    completed_at: null,
    merchant_fee: null,
    merchant_commission: null,
    meta_data: null,
    blockchain: { id: 30, code: "LRC", description: "Loopring" },
  },
};
export const mockAfterKYCReturn: { order: BanxaOrder } = {
  order: {
    id: "dd734aec66eb781ecc7f7bb01274ec63",
    account_id: "324a77f69fc5797c2afbe67efefddbba",
    account_reference: "0xff7d59d9316eba168837e3ef924bcdfd64b237d8",
    order_type: "CRYPTO-SELL",
    payment_type: "DIRECTCREDIT",
    ref: 111904,
    fiat_code: "AUD",
    fiat_amount: 73.7,
    coin_code: "USDC",
    coin_amount: 49.99,
    wallet_address: null,
    wallet_address_tag: null,
    fee: 0,
    fee_tax: 0,
    payment_fee: 0,
    payment_fee_tax: 0,
    commission: 0,
    tx_hash: null,
    tx_confirms: 0,
    created_date: "30-Nov-2022",
    created_at: "30-Nov-2022 17:51:50",
    status: "pendingPayment",
    completed_at: null,
    merchant_fee: 0,
    merchant_commission: 0,
    meta_data: null,
    blockchain: { id: 30, code: "LRC", description: "Loopring " },
  },
};
export enum BanxaCheck {
  CheckOrderStatus = 0,
  OrderEnd = 1,
  OrderHide = 2,
  OrderShow = 3,
}
export enum OrderENDReason {
  UserCancel,
  Expired,
  Done,
  Waiting,
}
// export enum IPFSCommands {
//   ErrorGetIpfs = "ErrorGetIpfs",
//   IpfsResult = "IpfsResult",
// }
//
// const subject = new Subject<{
//   status: IPFSCommands;
//   data?: {
//     uniqueId?: string;
//     [key: string]: any;
//   };
// }>();

export const banxaApiCall = async ({
  url,
  query,
  payload,
  method,
  chainId,
}: {
  url: string;
  query: URLSearchParams | string | string[][];
  payload: object | undefined;
  method: sdk.ReqMethod;
  chainId: ChainId;
}): Promise<{ [key: string]: any }> => {
  const querys = url + "?" + new URLSearchParams(query).toString();
  const apiKey = await LoopringAPI.globalAPI?.getBanxaAPI({
    method,
    query: querys,
    payload: JSON.stringify(payload),
  });
  const bearer: string = (apiKey?.result as string) ?? "";
  myLog("apiKey", bearer, query, new URLSearchParams(query).toString());
  const _axios = axios.create({
    baseURL: BANXA_URLS[chainId as number],
    timeout: 6000,
    headers: {
      // Accept: "application/json",
      Authorization: bearer,
      "Content-Type": "application/json",
    },
    validateStatus: function (status: any) {
      if ((status >= 200 && status < 300) || status === 400) {
        return true;
      }
      return false;
      // return true // always true, handle exception in each bussiness logic
    },
  });
  const result = await _axios.request({ method, url: querys, data: payload });
  return { ...result };
};

const subject = new Subject<{
  status: BanxaCheck;
  data?: {
    [key: string]: any;
  };
}>();
export const banxaService = {
  banxaStart: () => {
    const {
      account,
      system: { chainId },
    } = store.getState();
    // @ts-ignore
    const banxa: any = new window.Banxa("loopring", "sandbox");
    // @ts-ignore
    const anchor: any = window.document.querySelector("#iframeBanxaTarget");
    // anchor.querySelector("anchor");
    if (anchor) {
      // debugger;
      anchor.style.display = "flex";
      //let { checkout_url, orderId } =
      banxaApiCall({
        chainId: chainId as ChainId,
        method: sdk.ReqMethod.POST,
        url: "/api/orders",
        query: "",
        payload: {
          blockchain: "LRC",
          // iframe_domain: BANXA_URLS[chainId],
          source: "USDC",
          target: "AUD",
          refund_address: account.accAddress,
          return_url_on_success: "https://loopring.io/#/l2assets",
          account_reference: account.accAddress,
        },
      })
        .then((res: any) => {
          subject.next({
            status: BanxaCheck.CheckOrderStatus,
            data: {
              res,
            },
          });
        })
        .finally(() => {
          mockAfterKYCReturn;
        })
        .catch((res: any) => {
          subject.next({
            status: BanxaCheck.CheckOrderStatus,
            data: {
              ...res,
              ...mockAfterKYCReturn,
            },
          });
        });
    }
  },
  KYCDone: () => {
    subject.next({
      status: BanxaCheck.OrderHide,
    });
  },
  TransferDone: () => {
    subject.next({
      status: BanxaCheck.OrderShow,
    });
  },
  orderDone: () => {
    banxaService.banxaEnd({ reason: OrderENDReason.Done, data: "" });
    // subject.next({
    //   status: BanxaCheck.CheckOrderStatus,
    //   data: {
    //     ...res,
    //     ...mockAfterKYCReturn,
    //   },
    // });
  },
  orderExpired: () => {
    banxaService.banxaEnd({ reason: OrderENDReason.Expired, data: "" });
  },
  banxaEnd: ({ reason, data }: { reason: OrderENDReason; data: any }) => {
    store.dispatch(resetTransferBanxaData);
    subject.next({
      status: BanxaCheck.OrderEnd,
      data: {
        reason,
        data,
      },
    });
    // const parentsNode: any =
    //   window.document.querySelector("#iframeBanxaTarget");
    // const items = parentsNode.getElementsByTagName("iframe");
    // if (items && items[0]) {
    //   parentsNode.removeChild(items[0]);
    // }
    // parentsNode.style.display = "none";
  },
  banxaConfirm: () => {
    // subject.next({
    //   status: BanxaCheck.OrderEnd,
    //   data: {
    //     reason,
    //     data,
    //   },
    // });
  },
  // sendError: (error: CustomError) => {
  //   subject.next({
  //     status: IPFSCommands.ErrorGetIpfs,
  //     data: {
  //       error: error,
  //     },
  //   });
  // },
  // addJSONStringify: async ({
  //   ipfs,
  //   str,
  //   uniqueId,
  // }: {
  //   ipfs: IPFSHTTPClient;
  //   str: string;
  //   uniqueId: string;
  // }) => {
  //   if (ipfs) {
  //     try {
  //       const data = await ipfs.add(str); //callIpfs({ ipfs, cmd, opts });
  //       subject.next({
  //         status: IPFSCommands.IpfsResult,
  //         data: { ...data, uniqueId },
  //       });
  //     } catch (error) {
  //       subject.next({
  //         status: IPFSCommands.ErrorGetIpfs,
  //         data: {
  //           uniqueId,
  //           error: {
  //             code: UIERROR_CODE.ADD_IPFS_ERROR,
  //             ...(error as any),
  //             uniqueId,
  //           },
  //         },
  //       });
  //     }
  //   } else {
  //     subject.next({
  //       status: IPFSCommands.ErrorGetIpfs,
  //       data: {
  //         uniqueId,
  //         error: {
  //           code: UIERROR_CODE.NO_IPFS_INSTANCE,
  //           message: "IPFSHTTPClient is undefined",
  //         } as sdk.RESULT_INFO,
  //       },
  //     });
  //   }
  // },
  // addFile: async ({
  //   ipfs,
  //   file,
  //   uniqueId,
  // }: {
  //   ipfs: IPFSHTTPClient | undefined;
  //   file: File;
  //   uniqueId: string;
  // }) => {
  //   if (ipfs) {
  //     try {
  //       const data: AddResult = await ipfs
  //         .add({ content: file.stream() })
  //         .catch((e) => {
  //           throw e;
  //         });
  //       subject.next({
  //         status: IPFSCommands.IpfsResult,
  //         data: { ...data, uniqueId, file },
  //       });
  //     } catch (error) {
  //       subject.next({
  //         status: IPFSCommands.ErrorGetIpfs,
  //         data: {
  //           error: {
  //             code: UIERROR_CODE.ADD_IPFS_ERROR,
  //             ...(error as any),
  //           },
  //           uniqueId,
  //         },
  //       });
  //     }
  //   } else {
  //     subject.next({
  //       status: IPFSCommands.ErrorGetIpfs,
  //       data: {
  //         uniqueId,
  //         error: {
  //           code: UIERROR_CODE.NO_IPFS_INSTANCE,
  //           message: "IPFSHTTPClient is undefined",
  //         },
  //       },
  //     });
  //   }
  // },
  // addJSON: async ({
  //   ipfs,
  //   json,
  //   uniqueId,
  // }: {
  //   ipfs: IPFSHTTPClient | undefined;
  //   json: string;
  //   uniqueId: string;
  // }) => {
  //   if (ipfs) {
  //     try {
  //       const data: AddResult = await ipfs.add(json); //callIpfs({ ipfs, cmd, opts });
  //       subject.next({
  //         status: IPFSCommands.IpfsResult,
  //         data: { ...data, uniqueId },
  //       });
  //     } catch (error) {
  //       subject.next({
  //         status: IPFSCommands.ErrorGetIpfs,
  //         data: {
  //           error: {
  //             code: UIERROR_CODE.ADD_IPFS_ERROR,
  //             ...(error as any),
  //           },
  //           uniqueId,
  //         },
  //       });
  //     }
  //   } else {
  //     subject.next({
  //       status: IPFSCommands.ErrorGetIpfs,
  //       data: {
  //         uniqueId,
  //         error: {
  //           code: UIERROR_CODE.NO_IPFS_INSTANCE,
  //           message: "IPFSHTTPClient is undefined",
  //         },
  //       },
  //     });
  //   }
  // },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
};

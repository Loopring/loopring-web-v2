import {
  AccountStatus,
  myLog,
  UIERROR_CODE,
} from "@loopring-web/common-resources";

import { Subject } from "rxjs";
import { LoopringAPI, store } from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";
import _ from "lodash";
import { unlockAccount } from "./unlockAccount";
import { resetLayer12Data, resetLayer2Data } from "./resetAccount";
import { AccountCommands } from "./command";
import { updateAccountStatus } from "../../stores/account/reducer";
import { connectProvides } from "@loopring-web/web3-provider";
import { isContract } from "@loopring-web/loopring-sdk";

const subject = new Subject<{ status: AccountCommands; data: any }>();

export const accountServices = {
  //INFO: for update Account and unlock account
  sendSign: async () => {
    subject.next({
      status: AccountCommands.ProcessSign,
      data: undefined,
    });
  },
  sendSignDeniedByUser: () => {
    subject.next({
      status: AccountCommands.SignDeniedByUser,
      data: undefined,
    });
  },
  sendErrorUnlock: (error?: sdk.RESULT_INFO, walletType?: sdk.WalletType) => {
    subject.next({
      status: AccountCommands.ErrorSign,
      data: {
        walletType,
        error:
          error ??
          ({
            code: UIERROR_CODE.UNKNOWN,
            msg: "unknown error",
          } as sdk.RESULT_INFO),
      },
    });
  },

  sendUpdateAccStatusAndReset: (
    readyState: AccountStatus,
    accountId: number = -1
  ) => {
    store.dispatch(
      updateAccountStatus({
        accountId,
        readyState,
        apiKey: "",
        eddsaKey: "",
        publicKey: "",
        nonce: undefined,
      })
    );

    if (readyState === AccountStatus.ERROR_NETWORK) {
      resetLayer12Data();
      subject.next({
        status: AccountCommands.ErrorNetwork,
        data: undefined,
      });
    } else {
      const { accAddress } = store.getState().account;
      accountServices.sendCheckAccount(accAddress);
    }
  },
  sendAccountLock: async (accInfo?: sdk.AccountInfo) => {
    const updateInfo = accInfo
      ? {
          readyState: AccountStatus.LOCKED,
          accountId: accInfo.accountId,
          nonce: accInfo.nonce,
          level:
            accInfo.tags?.split(";").find((item) => /vip/gi.test(item)) ?? "",
          keyNonce: accInfo.keyNonce,
          keySeed: accInfo.keySeed,
        }
      : {
          readyState: AccountStatus.LOCKED,
          apiKey: "",
          eddsaKey: "",
          publicKey: "",
          nonce: undefined,
        };
    store.dispatch(updateAccountStatus(updateInfo));
    resetLayer2Data();
    // await sleep(50)

    _.delay(() => {
      subject.next({
        status: AccountCommands.LockAccount,
        data: undefined,
      });
    }, 10);
  },
  sendActiveAccountDeposit: () => {},
  sendAccountSigned: ({
    // accountId,
    apiKey,
    // frozen,
    eddsaKey,
    // isReset,
    // keySeed,
    // nonce,
    isInCounterFactualStatus,
    isContract,
  }: {
    apiKey?: string;
    eddsaKey?: any;
    isInCounterFactualStatus?: boolean;
    isContract?: boolean;
  }) => {
    const updateInfo =
      apiKey && eddsaKey
        ? {
            // accountId,
            apiKey,
            eddsaKey,
            // nonce,
            // frozen,
            // keySeed,
            publicKey: {
              x: sdk.toHex(sdk.toBig(eddsaKey.keyPair.publicKeyX)),
              y: sdk.toHex(sdk.toBig(eddsaKey.keyPair.publicKeyY)),
            },
            readyState: AccountStatus.ACTIVATED,
            _accountIdNotActive: -1,
            isInCounterFactualStatus,
            isContract,
          }
        : { readyState: AccountStatus.ACTIVATED };

    store.dispatch(updateAccountStatus(updateInfo));
    subject.next({
      status: AccountCommands.AccountUnlocked,
      data: undefined,
    });
  },
  sendNoAccount: (isContract: boolean) => {
    store.dispatch(
      updateAccountStatus({ readyState: AccountStatus.NO_ACCOUNT, isContract })
    );
    subject.next({
      status: AccountCommands.NoAccount,
      data: undefined,
    });
  },
  sendNeedUpdateAccount: async (
    accInfo: sdk.AccountInfo & { isContract: boolean }
  ) => {
    myLog("sendNeedUpdateAccount accInfo:", accInfo);
    store.dispatch(
      updateAccountStatus({
        readyState: AccountStatus.NOT_ACTIVE,
        _accountIdNotActive: accInfo.accountId,
        nonce: accInfo.nonce,
        keySeed: accInfo.keySeed,
        isContract: accInfo.isContract,
      })
    );
    subject.next({
      status: AccountCommands.SignAccount,
      data: accInfo,
    });
  },
  sendCheckAcc: async () => {
    myLog("-------sendCheckAcc enter!");
    if (store) {
      const account = store.getState().account;
      if (LoopringAPI.exchangeAPI) {
        if (connectProvides.usedProvide && connectProvides.usedWeb3) {
          const chainId = await connectProvides?.usedWeb3.eth.getChainId();
          if (chainId !== LoopringAPI.__chainId__) {
            LoopringAPI.InitApi(chainId as sdk.ChainId);
          }
        }
        const [{ accInfo }, is_Contract] = await Promise.all([
          LoopringAPI.exchangeAPI.getAccount({
            owner: account.accAddress,
          }),
          isContract(connectProvides.usedWeb3, account.accAddress),
        ]);
        if (accInfo === undefined) {
          if (account.readyState !== AccountStatus.NO_ACCOUNT) {
            accountServices.sendNoAccount(is_Contract);
          }
        } else {
          if (account.accountId) {
            if (!account.publicKey.x || !account.publicKey.y) {
              myLog("-------sendCheckAcc need update account!");
              accountServices.sendNeedUpdateAccount({
                ...accInfo,
                isContract: is_Contract,
              });
            } else {
              myLog("-------need unlockAccount!");
              unlockAccount();
            }
          } else {
            myLog("unexpected accInfo:", accInfo);
            throw Error("unexpected accinfo:" + accInfo);
          }
        }
      }
    }
  },
  sendCheckAccount: async (
    ethAddress: string,
    _chainId?: sdk.ChainId | undefined
  ) => {
    myLog(
      "After connect >>,sendCheckAccount: step3 processAccountCheck",
      ethAddress
    );
    store.dispatch(
      updateAccountStatus({
        accAddress: ethAddress,
        readyState: AccountStatus.UN_CONNECT,
      })
    );
    subject.next({
      status: AccountCommands.ProcessAccountCheck,
      data: undefined,
    });
    if (connectProvides.usedProvide && connectProvides.usedWeb3) {
      const chainId = await connectProvides?.usedWeb3.eth.getChainId();
      if (chainId !== LoopringAPI.__chainId__) {
        LoopringAPI.InitApi(chainId as sdk.ChainId);
      }
    }
    if (LoopringAPI.exchangeAPI) {
      // const { accInfo } = await LoopringAPI.exchangeAPI.getAccount({
      //   owner: ethAddress,
      // });

      const [{ accInfo }, is_Contract] = await Promise.all([
        LoopringAPI.exchangeAPI.getAccount({
          owner: ethAddress,
        }),
        isContract(connectProvides.usedWeb3, ethAddress),
      ]);
      if (accInfo === undefined) {
        accountServices.sendNoAccount(is_Contract);
      } else {
        if (accInfo.accountId) {
          if (!accInfo.publicKey.x || !accInfo.publicKey.y) {
            myLog("-------sendCheckAccount need update account!");
            accountServices.sendNeedUpdateAccount({
              ...accInfo,
              isContract: is_Contract,
            });
          } else {
            myLog("-------need unlockAccount!");
            accountServices.sendAccountLock(accInfo);
          }
        } else {
          myLog("unexpected accInfo:", accInfo);
          throw Error("unexpected accinfo:" + accInfo);
        }
      }
    } else {
      myLog("unexpected no ethAddress:" + ethAddress);
    }
  },

  onSocket: () => subject.asObservable(),
};

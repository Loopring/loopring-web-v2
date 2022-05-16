import {
  AccountStatus,
  myLog,
  UIERROR_CODE,
} from "@loopring-web/common-resources";

import { Subject } from "rxjs";
import { LoopringAPI, store } from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";
import _ from "lodash";
import { resetLayer12Data, resetLayer2Data } from "./resetAccount";
import { AccountCommands } from "./command";
import { updateAccountStatus } from "../../stores/account/reducer";

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
          accAddress: accInfo.owner,
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
  sendNoAccount: (ethAddress: string) => {
    store.dispatch(
      updateAccountStatus({
        readyState: AccountStatus.NO_ACCOUNT,
        accAddress: ethAddress,
        _accountIdNotActive: -1,
      })
    );
    subject.next({
      status: AccountCommands.NoAccount,
      data: undefined,
    });
  },
  sendNeedUpdateAccount: async (accInfo: sdk.AccountInfo) => {
    myLog("sendNeedUpdateAccount accInfo:", accInfo);
    store.dispatch(
      updateAccountStatus({
        readyState: AccountStatus.NOT_ACTIVE,
        accAddress: accInfo.owner,
        _accountIdNotActive: accInfo.accountId,
        nonce: accInfo.nonce,
        keySeed: accInfo.keySeed,
      })
    );
    subject.next({
      status: AccountCommands.SignAccount,
      data: accInfo,
    });
  },
  sendCheckAccount: async (
    ethAddress: string,
    _chainId?: sdk.ChainId | undefined
  ) => {
    myLog(
      "After connect >>,sendCheckAccount: step3 processAccountCheck",
      ethAddress
    );
    const account = store.getState().account;
    subject.next({
      status: AccountCommands.ProcessAccountCheck,
      data: undefined,
    });

    if (_chainId && _chainId !== LoopringAPI.__chainId__) {
      LoopringAPI.InitApi(_chainId as sdk.ChainId);
    }

    if (ethAddress && LoopringAPI.exchangeAPI) {
      const { accInfo } = await LoopringAPI.exchangeAPI.getAccount({
        owner: ethAddress,
      });
      if (accInfo === undefined) {
        if (
          account.readyState !== AccountStatus.NO_ACCOUNT ||
          account.accountId !== -1 ||
          account.accAddress.toLowerCase() !== ethAddress.toLowerCase()
        ) {
          accountServices.sendNoAccount(ethAddress);
        }
      } else {
        if (account.accountId == accInfo.accountId && account.publicKey.x) {
          myLog("-------sendCheckAccount already Unlock!");
          accountServices.sendAccountSigned({
            ...account,
          });
        } else if (accInfo.accountId) {
          if (!accInfo.publicKey.x || !accInfo.publicKey.y) {
            myLog("-------sendCheckAccount need update account!");
            accountServices.sendNeedUpdateAccount({
              ...accInfo,
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
      store.dispatch(
        updateAccountStatus({
          accAddress: ethAddress,
          readyState: AccountStatus.UN_CONNECT,
          _accountIdNotActive: -1,
        })
      );
    }
  },

  onSocket: () => subject.asObservable(),
};

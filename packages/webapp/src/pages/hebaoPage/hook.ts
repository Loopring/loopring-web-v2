import React from "react";
import { useAccount } from "../../stores/account";
import {
  ConnectProviders,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import { LoopringAPI } from "../../api_wrapper";
import {
  Guardian,
  HebaoOperationLog,
  LockHebaoHebaoParam,
  Protector,
} from "@loopring-web/loopring-sdk";
import { connectProvides } from "@loopring-web/web3-provider";
import { HebaoStep } from "@loopring-web/component-lib";
import { useSystem } from "../../stores/system";
import * as sdk from "@loopring-web/loopring-sdk";

export enum TxHebaoHistoryType {
  ADD_GUARDIAN = 51,
  GUARDIAN_CONFIRM_ADDITION = 52,
  GUARDIAN_REJECT_ADDITION = 53,
  GUARDIAN_APPROVE = 54,
  APPROVE_RECOVER = 55, // RECOVER  16
  APPROVE_TRANSFER = 56, // APPROVE TRANSFER 18
  APPROVE_TOKEN_APPROVE = 57, // 23
  ADD_GUARDIAN_WA = 58, // 34
  REMOVE_GUARDIAN_WA = 59, // 35
  UNLOCK_WALLET_WA = 60, // 37
  RESET_GUARDIANS_WA = 61, // 200
}
export enum TxHebaoAction {
  Approve,
  Reject,
}

export const useHebaoMain = <
  T extends Protector,
  G extends Guardian,
  H extends HebaoOperationLog
>() => {
  const { account, status: accountStatus } = useAccount();
  const [
    { hebaoConfig, protectList, guardiansList, operationLogList },
    setList,
  ] = React.useState<{
    hebaoConfig: any;
    protectList: T[];
    guardiansList: G[];
    operationLogList: H[];
  }>({
    protectList: [],
    guardiansList: [],
    operationLogList: [],
    hebaoConfig: {},
  });
  const [openHebao, setOpenHebao] = React.useState<{
    isShow: boolean;
    step: HebaoStep;
    options?: any;
  }>({
    isShow: false,
    step: HebaoStep.LockAccount_WaitForAuth,
    options: undefined,
  });

  const loadData = async () => {
    if (LoopringAPI.walletAPI && account.accAddress) {
      const [
        { raw_data: hebaoConfig },
        protector,
        guardian,
        hebaooperationlog,
      ]: any = await Promise.all([
        LoopringAPI.walletAPI.getHebaoConfig(),
        LoopringAPI.walletAPI.getProtectors(
          {
            guardian: account.accAddress,
          },
          account.apiKey
        ),
        // api/wallet/v3/operationLogs
        LoopringAPI.walletAPI
          .getGuardianApproveList({
            guardian: account.accAddress,
          })
          .then((guardian) => {
            guardian?.guardiansArray.map((ele) => {
              ele.businessDataJson = JSON.parse(ele.businessDataJson ?? "");
              return ele;
            });
            return guardian;
          }),
        LoopringAPI.walletAPI.getHebaoOperationLogs({
          from: account.accAddress,
          fromTime: 0,
          offset: 0,
          limit: 50,
          // to?: string;
          // offset?: number;
          // network?: 'ETHEREUM';
          // statues?: string;
          // hebaoTxType?: string;
          // limit?: number;
        }),
      ]).catch((error) => {
        myLog(error);
      });
      const _guardiansList: G[] = guardian?.guardiansArray
        ? guardian.guardiansArray.reduce((prev: G[], approve: G) => {
            const _protector = protector.protectorArray?.find(
              ({ address: pAddress }: any) => pAddress === approve.address
            );
            if (_protector) {
              // @ts-ignore
              approve.ens = _protector.ens;
              return [...prev, approve] as G[];
            }
            return prev;
          }, [] as G[])
        : [];

      setList({
        protectList: protector.protectorArray ?? [],
        guardiansList: _guardiansList,
        operationLogList: hebaooperationlog?.operationArray ?? [],
        hebaoConfig,
      });
    }
  };
  React.useEffect(() => {
    if (account.accAddress && accountStatus === SagaStatus.UNSET) {
      loadData();
    }
  }, [accountStatus]);
  return {
    protectList,
    guardiansList,
    hebaoConfig,
    openHebao,
    operationLogList,
    setOpenHebao,
    loadData,
  };
};

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
  LockHebaoHebaoParam,
  Protector,
} from "@loopring-web/loopring-sdk";
import { connectProvides } from "@loopring-web/web3-provider";
import { HebaoStep } from "@loopring-web/component-lib";
import { useSystem } from "../../stores/system";
import * as sdk from "@loopring-web/loopring-sdk";

export const useHebaoMain = <T extends Protector, G extends Guardian>() => {
  const { account, status: accountStatus } = useAccount();
  const [{ hebaoConfig, protectList, guardiansList, history }, setList] =
    React.useState<{
      hebaoConfig: any;
      protectList: T[];
      guardiansList: G[];
      history: any;
    }>({ protectList: [], guardiansList: [], history: [], hebaoConfig: {} });
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
      const [{ raw_data: hebaoConfig }, protector, guardian, logData]: any =
        await Promise.all([
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
        ])
          .then(([protector, guardians]) => [protector, guardians])
          .catch((error) => {
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
      console.log("actionGasSettings", hebaoConfig);

      setList({
        protectList: protector.protectorArray ?? [],
        guardiansList: _guardiansList,
        history,
        hebaoConfig,
      });
    }
  };
  React.useEffect(() => {
    if (account.accAddress && accountStatus === SagaStatus.UNSET) {
      loadData();
    }
  }, [accountStatus]);
  return { protectList, guardiansList, hebaoConfig, openHebao, setOpenHebao };
};
export const useHebaoProtector = <T extends Protector>({
  hebaoConfig,
  handleOpenModal,
}: {
  hebaoConfig: any;
  handleOpenModal: (props: { step: HebaoStep; options?: any }) => void;
}) => {
  const { account } = useAccount();
  const { chainId, gasPrice } = useSystem();
  const onLock = React.useCallback(
    async (item: T) => {
      const config = hebaoConfig.actionGasSettings.find(
        (item: any) => item.action === "META_TX_LOCK_WALLET_WA"
      );
      const guardianModule = hebaoConfig.supportContracts.find(
        (ele: any) => ele.contractName.toUpperCase() === "GUARDIAN_MODULE"
      ).contractAddress;
      if (LoopringAPI?.walletAPI) {
        const params: LockHebaoHebaoParam = {
          web3: connectProvides.usedWeb3 as any,
          from: account.accAddress,
          contractAddress: guardianModule,
          wallet: item.address,
          gasPrice,
          gasLimit: config.gasLimit ?? 15000,
          chainId: chainId as any,
          sendByMetaMask:
            connectProvides.provideName === ConnectProviders.MetaMask,
        };
        try {
          await LoopringAPI.walletAPI.lockHebaoWallet(params);
        } catch (reason) {
          // result.code = ActionResultCode.ApproveFailed;
          // result.data = reason;
          sdk.dumpError400(reason);
          handleOpenModal({
            step: HebaoStep.LockAccount_User_Denied,
            options: { reason },
          });
        }
      }
    },
    [hebaoConfig, handleOpenModal]
  );
  return {
    onLock,
  };
};

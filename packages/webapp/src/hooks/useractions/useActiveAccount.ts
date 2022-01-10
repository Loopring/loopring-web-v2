import React from "react";

import {
  ActiveAccountProps,
  TokenType,
  useOpenModals,
} from "@loopring-web/component-lib";

import {
  AccountStatus,
  FeeInfo,
  SagaStatus,
} from "@loopring-web/common-resources";
import { useBtnStatus } from "hooks/common/useBtnStatus";

import { useUpdateAccount } from "./useUpdateAccount";
import { useModalData } from "stores/router";
import { AssetsRawDataItem } from "pages/Layer2Page/AssetPanel/hook";
import { useTokenMap } from "stores/token";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";
import { WalletLayer2Map } from "stores/walletLayer2";
import { useAccount } from "stores/account";

export const useActiveAccount = <T>(): {
  activeAccountProps: ActiveAccountProps<T>;
} => {
  const [activeAccountFeeInfo, setActiveAccountFeeInfo] =
    React.useState<FeeInfo>();
  const { btnStatus } = useBtnStatus();
  const { tokenMap, idIndex, status: tokenMapStatus } = useTokenMap();
  const { account } = useAccount();
  const {
    activeAccountValue: { chargeFeeList },
    updateActiveAccountData,
  } = useModalData();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);

  const { setShowActiveAccount, setShowDeposit } = useOpenModals();

  const { goUpdateAccount } = useUpdateAccount();

  const handleFeeChange = (value: FeeInfo): void => {
    value.__raw__ = {
      ...value.__raw__,
      tokenId: tokenMap[value.belong.toString()].tokenId,
    };
    setActiveAccountFeeInfo(value);
  };
  console.log("activeAccountFeeInfo", activeAccountFeeInfo);
  const onActiveAccountClick = () => {
    setActiveAccountFeeInfo((state: any) => {
      if (state) {
        setShowActiveAccount({ isShow: false });
        goUpdateAccount({
          isFirstTime: true,
          isReset: false,
          feeInfo: state,
        });
      }
      return state;
    });
  };

  const buildProps = React.useCallback(
    () =>
      ({
        onActiveAccountClick,
        activeAccountBtnStatus: btnStatus,
        chargeFeeToken: activeAccountFeeInfo?.belong,
        goToDeposit: () => {
          setShowActiveAccount({ isShow: false });
          setShowDeposit({ isShow: true });
        },
        chargeFeeTokenList:
          tokenMap &&
          Reflect.ownKeys(tokenMap).length &&
          chargeFeeList.map((item: any) => {
            const tokenInfo = tokenMap[item.token.toString()];
            return {
              ...item,
              tokenId: tokenInfo?.tokenId,
              belong: item.token,
              fee: sdk
                .toBig(item.fee)
                .div("1e" + tokenInfo.decimals)
                .toString(),
              __raw__: item,
            };
          }),
        handleFeeChange,
      } as ActiveAccountProps<T>),
    [
      onActiveAccountClick,
      handleFeeChange,
      tokenMap,
      btnStatus,
      activeAccountFeeInfo,
    ]
  );

  const resultMemo = React.useCallback(async () => {
    if (
      account._accountIdNotActive &&
      (account.readyState === AccountStatus.DEPOSITING ||
        account.readyState === AccountStatus.NOT_ACTIVE)
    ) {
      if (account.readyState === AccountStatus.DEPOSITING) {
        nodeTimer.current = setTimeout(() => resultMemo(), 30000);
      }
      let tokens = chargeFeeList
        .map((item) => `${tokenMap[item.token ?? "ETH"].tokenId}`)
        .join(",");
      const { userBalances } =
        (await LoopringAPI?.globalAPI?.getUserBalanceForFee({
          accountId: account._accountIdNotActive,
          tokens,
        })) ?? {};
      let walletLayer2: WalletLayer2Map<T> | undefined = undefined;
      if (userBalances) {
        walletLayer2 = Reflect.ownKeys(userBalances).reduce((prev, item) => {
          // @ts-ignore
          return { ...prev, [idIndex[item]]: userBalances[Number(item)] };
        }, {} as WalletLayer2Map<T>);
        updateActiveAccountData({ chargeFeeList, walletLayer2 });
      }
      const _activeAccountProps = buildProps();
      setActiveAccountProps({
        ..._activeAccountProps,
        assetsData:
          walletLayer2 &&
          Reflect.ownKeys(walletLayer2).reduce((pre, item) => {
            pre.push({
              token: {
                type: TokenType.single,
                value: item.toString(),
              },
              amount: walletLayer2 && walletLayer2[item.toString()].total,
              available: walletLayer2 && walletLayer2[item.toString()].total,
              locked: walletLayer2 && walletLayer2[item.toString()].locked,
              smallBalance: false,
              tokenValueDollar: 0,
              name: item.toString(),
              tokenValueYuan: 0,
            });
            return pre;
          }, [] as AssetsRawDataItem[]),
      });
    }
  }, [
    nodeTimer,
    account._accountIdNotActive,
    buildProps,
    chargeFeeList,
    idIndex,
    tokenMap,
    updateActiveAccountData,
  ]);

  const [activeAccountProps, setActiveAccountProps] = React.useState<
    ActiveAccountProps<T>
  >(() => buildProps());
  React.useEffect(() => {
    if (
      tokenMapStatus === SagaStatus.UNSET &&
      chargeFeeList.length &&
      account._accountIdNotActive &&
      account._accountIdNotActive !== -1
    ) {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout);
      }
      resultMemo();
    }
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout);
      }
    };
  }, [tokenMapStatus, chargeFeeList.length, account._accountIdNotActive]);

  return {
    activeAccountProps,
  };
};

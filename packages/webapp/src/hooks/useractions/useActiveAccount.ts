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
import { useWalletLayer2 } from "stores/walletLayer2";
import { useAccount } from "stores/account";

export const useActiveAccount = <T>(): {
  activeAccountProps: ActiveAccountProps<T>;
} => {
  const [activeAccountFeeInfo, setActiveAccountFeeInfo] = React.useState<
    Partial<FeeInfo>
  >({
    belong: "",
    fee: "",
    __raw__: undefined,
  } as unknown as FeeInfo);
  const { btnStatus } = useBtnStatus();
  const { tokenMap, idIndex, status: tokenMapStatus } = useTokenMap();
  const { account } = useAccount();
  const { walletLayer2, status: walletLayer2Statue } = useWalletLayer2();
  const {
    activeAccountValue: { chargeFeeList },
    updateActiveAccountData,
  } = useModalData();

  const { setShowActiveAccount, setShowDeposit } = useOpenModals();

  const { goUpdateAccount } = useUpdateAccount();

  const handleFeeChange = (value: FeeInfo): void => {
    value.__raw__ = {
      ...value.__raw__,
      tokenId: tokenMap[value.belong.toString()].tokenId,
    };
    setActiveAccountFeeInfo(value);
    updateActiveAccountData({ fee: value });
  };
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
    account._accountIdNotActive,
    buildProps,
    walletLayer2,
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
      walletLayer2Statue === SagaStatus.UNSET &&
      chargeFeeList.length
    ) {
      resultMemo();
    }
  }, [tokenMapStatus, chargeFeeList.length, walletLayer2Statue]);

  return {
    activeAccountProps,
  };
};

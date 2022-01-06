import React from "react";

import {
  ActiveAccountProps,
  TokenType,
  useOpenModals,
} from "@loopring-web/component-lib";

import { FeeInfo } from "@loopring-web/common-resources";
import { useBtnStatus } from "hooks/common/useBtnStatus";

import { useUpdateAccout } from "./useUpdateAccount";
import { useModalData } from "../../stores/router";
import { AssetsRawDataItem } from "../../pages/Layer2Page/AssetPanel/hook";
import { useTokenMap } from "../../stores/token";
import { toBig } from "@loopring-web/loopring-sdk";

export const useActiveAccount = <T>(): {
  activeAccountProps: ActiveAccountProps<T>;
} => {
  const [activeAccountFeeInfo, setActiveAccountFeeInfo] =
    React.useState<FeeInfo>();
  const { btnStatus } = useBtnStatus();
  const { tokenMap } = useTokenMap();
  const {
    activeAccountValue: { chargeFeeList, walletLayer2 },
  } = useModalData();

  const {
    modals: { isShowActiveAccount },
    setShowActiveAccount,
  } = useOpenModals();

  const { goUpdateAccount } = useUpdateAccout();

  const onActiveAccountClick = React.useCallback(() => {
    setShowActiveAccount({ isShow: false });
    goUpdateAccount({
      isFirstTime: true,
      isReset: false,
      feeInfo: activeAccountFeeInfo,
    });
  }, [goUpdateAccount]);

  const handleFeeChange = React.useCallback(
    (value: FeeInfo): void => {
      setActiveAccountFeeInfo(value);
    },
    [setActiveAccountFeeInfo]
  );
  const resultMemo = () => {
    return {
      onActiveAccountClick,
      activeAccountBtnStatus: btnStatus,
      chargeFeeToken: activeAccountFeeInfo?.belong,
      chargeFeeTokenList:
        tokenMap &&
        Reflect.ownKeys(tokenMap).length &&
        chargeFeeList.map((item: any) => {
          const tokenInfo = tokenMap[item.token.toString()];
          return {
            ...item,
            tokenId: tokenInfo?.tokenId,
            belong: item.token,
            fee: toBig(item.fee)
              .div("1e" + tokenInfo.decimals)
              .toString(),
          };
        }),
      handleFeeChange,
      assetsData:
        walletLayer2 &&
        Reflect.ownKeys(walletLayer2).reduce((pre, item) => {
          pre.push({
            token: {
              type: TokenType.single,
              value: item.toString(),
            },
            amount: walletLayer2[item.toString()].total,
            available: walletLayer2[item.toString()].total,
            locked: walletLayer2[item.toString()].locked,
            smallBalance: false,
            tokenValueDollar: 0,
            name: item.toString(),
            tokenValueYuan: 0,
          });
          return pre;
        }, [] as AssetsRawDataItem[]),
    } as ActiveAccountProps<T>;
  };

  const [activeAccountProps, setActiveAccountProps] = React.useState<
    ActiveAccountProps<T>
  >(() => {
    return resultMemo();
  });
  React.useEffect(() => {
    setActiveAccountProps(resultMemo());
  }, [tokenMap, chargeFeeList]);

  return {
    activeAccountProps,
  };
};

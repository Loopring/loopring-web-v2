import { ActiveAccountProps } from "../Interface";
import { withTranslation, WithTranslation } from "react-i18next";
import { FeeInfo, IBData } from "@loopring-web/common-resources";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import { ActiveAccountWrap } from "../components";
import React from "react";

export const ActiveAccountPanel = withTranslation("common", { withRef: true })(
  <T extends FeeInfo>({
    onActiveAccountClick,
    activeAccountBtnStatus,
    feeInfo,
    isFeeNotEnough,
    chargeFeeTokenList,
    assetsData,
    ...rest
  }: ActiveAccountProps<T> & WithTranslation) => {
    const props: SwitchPanelProps<"tradeMenuList" | "trade"> = {
      index: 0, // show default show
      panelList: [
        {
          key: "trade",
          element: (
            <ActiveAccountWrap<T>
              key={"transfer"}
              {...{
                ...rest,
                isFeeNotEnough,
                feeInfo,
                chargeFeeTokenList,
                activeAccountBtnStatus,
                onActiveAccountClick,
                assetsData,
              }}
            />
          ),
          toolBarItem: undefined,
        },
      ],
    };
    return <SwitchPanel {...{ ...rest, ...props }} />;
  }
) as <T extends IBData<I>, I>(
  props: ActiveAccountProps<T> & React.RefAttributes<any>
) => JSX.Element;

// export const TransferModal = withTranslation()

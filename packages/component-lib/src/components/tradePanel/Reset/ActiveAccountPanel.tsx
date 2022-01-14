import { ActiveAccountProps } from "../Interface";
import { withTranslation, WithTranslation } from "react-i18next";
import { IBData } from "@loopring-web/common-resources";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import { ActiveAccountWrap } from "../components";
import React from "react";

export const ActiveAccountPanel = withTranslation("common", { withRef: true })(
  <T extends IBData<I>, I>({
    onActiveAccountClick,
    activeAccountBtnStatus,
    chargeFeeToken,
    chargeFeeTokenList,
    assetsData,
    ...rest
  }: ActiveAccountProps<T> & WithTranslation) => {
    const props: SwitchPanelProps<"tradeMenuList" | "trade"> = {
      index: 0, // show default show
      panelList: [
        {
          key: "trade",
          element: React.useMemo(
            () => (
              <ActiveAccountWrap<T>
                key={"transfer"}
                {...{
                  ...rest,
                  chargeFeeToken,
                  chargeFeeTokenList,
                  activeAccountBtnStatus,
                  onActiveAccountClick,
                  assetsData,
                }}
              />
            ),
            [
              onActiveAccountClick,
              activeAccountBtnStatus,
              rest,
              assetsData,
              chargeFeeToken,
              chargeFeeTokenList,
            ]
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

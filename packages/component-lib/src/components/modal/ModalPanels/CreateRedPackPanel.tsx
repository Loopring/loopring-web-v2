import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
} from "../../basic-lib";
import { WithdrawProps } from "../../tradePanel/Interface";
import { IBData } from "@loopring-web/common-resources";
import {
  HorizontalLabelPositionBelowStepper,
  TradeMenuList,
  useBasicTrade,
} from "../../tradePanel/components";
import React from "react";
import { cloneDeep } from "lodash";
import {
  CreateRedPacketStepType,
  CreateRedPacketStepWrap,
  RedPacketStep,
} from "../../tradePanel/components/CreateRedPacketWrap";
import { Box } from "@mui/material";
const steps = [
  "labelRedPacketChoose", //Prepare NFT metadata
  "labelRedPacketMain", //labelADMint2
];
export const CreateRedPackPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <T extends IBData<I>, I>({
    type = "TOKEN",
    chargeFeeTokenList,
    onWithdrawClick,
    withdrawBtnStatus,
    assetsData,
    walletMap = {},
    coinMap = {},
    onBack,
    t,
    ...rest
  }: WithdrawProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      coinMap,
      type,
      // index,
      walletMap,
    });
    const [panelIndex, setPanelIndex] = React.useState(0);
    const setActiveStep = React.useCallback((index: RedPacketStep) => {
      switch (index) {
        case RedPacketStep.Main:
          setPanelIndex(1);
          break;
        case RedPacketStep.ChooseType:
          setPanelIndex(0);
          break;
      }
    }, []);
    React.useEffect(() => {
      setPanelIndex((state) => {
        if (state > 0) {
          return index + 1;
        } else {
          return state;
        }
      });
    }, [index]);
    // LP token should not exist in withdraw panel for now
    const getWalletMapWithoutLP = React.useCallback(() => {
      const clonedWalletMap = cloneDeep(walletMap ?? {});
      const keyList = Object.keys(clonedWalletMap);
      keyList.forEach((key) => {
        const [first] = key.split("-");
        if (first === "LP") {
          delete clonedWalletMap[key];
        }
      });
      return clonedWalletMap;
    }, [walletMap]);

    const props: SwitchPanelProps<string> = {
      index: panelIndex, // show default show
      panelList: [
        // {
        //   key: "selectType",
        //   element: React.useMemo(() => <CreateRedPacketStepType />, []),
        // },
        // {
        //   key: "trade",
        //   element: React.useMemo(() => <CreateRedPacketStepWrap />, []),
        //   toolBarItem: React.useMemo(
        //     () => (
        //       <>
        //         {onBack ? (
        //           <ModalBackButton
        //             marginTop={0}
        //             marginLeft={-2}
        //             onBack={() => {
        //               onBack();
        //             }}
        //             {...rest}
        //           />
        //         ) : (
        //           <></>
        //         )}
        //       </>
        //     ),
        //     [onBack]
        //   ),
        // },
      ].concat(
        type === "TOKEN"
          ? ([
              {
                key: "tradeMenuList",
                element: React.useMemo(
                  () => (
                    <TradeMenuList
                      {...{
                        nonZero: true,
                        sorted: true,
                        ...rest,
                        onChangeEvent,
                        coinMap,
                        selected: switchData.tradeData.belong,
                        tradeData: switchData.tradeData,
                        walletMap: getWalletMapWithoutLP(),
                        //oinMap
                      }}
                    />
                  ),
                  [switchData, rest, onChangeEvent, getWalletMapWithoutLP]
                ),
                toolBarItem: undefined,
              },
            ] as any)
          : []
      ),
    };
    return (
      <Box
        className={walletMap ? "" : "loading"}
        display={"flex"}
        flex={1}
        flexDirection={"column"}
        padding={5 / 2}
        alignItems={"center"}
      >
        <HorizontalLabelPositionBelowStepper
          activeStep={panelIndex === 0 ? 0 : 1}
          steps={steps}
        />
        <SwitchPanel {...{ ...rest, ...props }} />
      </Box>
    );
  }
) as <T, I>(
  props: WithdrawProps<T, I> & React.RefAttributes<any>
) => JSX.Element;

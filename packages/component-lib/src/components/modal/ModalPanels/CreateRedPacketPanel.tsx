import { WithTranslation, withTranslation } from "react-i18next";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import {
  CreateRedPacketProps,
  RedPacketStep,
  WithdrawProps,
} from "../../tradePanel";
import { FeeInfo, LuckyRedPacketList } from "@loopring-web/common-resources";
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
} from "../../tradePanel/components/CreateRedPacketWrap";
import { RedPacketOrderData } from "@loopring-web/core";
import { Box, styled } from "@mui/material";
const steps = [
  "labelRedPacketChoose", //Prepare NFT metadata
  "labelRedPacketMain", //labelADMint2
];
const BoxStyle = styled(Box)`
  &.createRedPacket {
    .container {
      align-items: center;
      display: flex;
    }
  }
`;
export const CreateRedPacketPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <T extends Partial<RedPacketOrderData<I>>, I extends any, C = FeeInfo>({
    tradeType = "TOKEN",
    tradeData,
    disabled,
    handleOnDataChange,
    walletMap = {},
    coinMap = {},
    tokenMap = {},
    t,
    ...rest
  }: CreateRedPacketProps<T, I, C> &
    WithTranslation & { assetsData: any[] }) => {
    const onBack = React.useCallback(() => {
      setPanelIndex(0);
    }, []);
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      coinMap,
      type: tradeType,
      // index,
      walletMap,
    } as any);
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
    const [selectedType, setSelectType] = React.useState(LuckyRedPacketList[0]);
    React.useEffect(() => {
      setSelectType(() => {
        if (tradeData?.type) {
          if (
            tradeData.type.partition == LuckyRedPacketList[0].value.partition &&
            tradeData.type.mode == LuckyRedPacketList[0].value.mode
          ) {
            return LuckyRedPacketList[0];
          } else if (
            tradeData.type.partition == LuckyRedPacketList[1].value.partition &&
            tradeData.type.mode == LuckyRedPacketList[1].value.mode
          ) {
            return LuckyRedPacketList[1];
          } else {
            return LuckyRedPacketList[2];
          }
        } else {
          return LuckyRedPacketList[2];
        }
      });
      // setScope();
    }, [
      tradeData?.type?.partition,
      tradeData?.type?.scope,
      tradeData?.type?.mode,
    ]);

    const props: SwitchPanelProps<string> = {
      index: panelIndex,
      panelList: [
        {
          key: "selectType",
          element: React.useMemo(
            () => (
              // @ts-ignore
              <CreateRedPacketStepType
                handleOnDataChange={handleOnDataChange as any}
                tradeData={tradeData as any}
                disabled={disabled}
                tradeType={tradeType}
                selectedType={selectedType}
                {...{ ...rest }}
                setActiveStep={setActiveStep}
                activeStep={RedPacketStep.ChooseType}
              />
            ),
            [tradeData, disabled, rest]
          ),
          toolBarItem: undefined,
        },
        {
          key: "trade",
          element: React.useMemo(() => {
            return (
              // @ts-ignore
              <CreateRedPacketStepWrap
                onBack={onBack}
                disabled={disabled}
                coinMap={coinMap}
                selectedType={selectedType}
                handleOnDataChange={handleOnDataChange as any}
                tradeType={tradeType}
                tokenMap={tokenMap}
                tradeData={tradeData as any}
                {...{ ...rest }}
                walletMap={getWalletMapWithoutLP()}
                onChangeEvent={onChangeEvent as any}
                setActiveStep={setActiveStep}
                activeStep={RedPacketStep.Main}
              />
            );
          }, [tradeData, tradeType, disabled, coinMap, rest]),
          toolBarItem: undefined,
        },
      ].concat(
        tradeType === "TOKEN"
          ? ([
              {
                key: "tradeMenuList",
                element: React.useMemo(
                  () => (
                    <TradeMenuList
                      {...({
                        nonZero: true,
                        sorted: true,
                        selected: switchData.tradeData.belong,
                        tradeData: switchData.tradeData,
                        walletMap: getWalletMapWithoutLP(),
                        t,
                        ...rest,
                        onChangeEvent,
                        coinMap,
                        //oinMap
                      } as any)}
                    />
                  ),
                  [
                    switchData,
                    coinMap,
                    rest,
                    onChangeEvent,
                    getWalletMapWithoutLP,
                  ]
                ),
                toolBarItem: undefined,
              },
            ] as any)
          : []
      ),
    };
    return (
      <BoxStyle
        className={walletMap ? "createRedPacket" : "loading createRedPacket"}
        display={"flex"}
        flex={1}
        flexDirection={"column"}
        paddingY={5 / 2}
        alignItems={"center"}
      >
        <HorizontalLabelPositionBelowStepper
          activeStep={panelIndex === 0 ? 0 : 1}
          steps={steps}
        />
        <Box paddingTop={2} display={"flex"} flex={1}>
          <SwitchPanel {...{ ...rest, t, ...props }} />
        </Box>
      </BoxStyle>
    );
  }
) as unknown as <T, I>(
  props: WithdrawProps<T, I> & React.RefAttributes<any>
) => JSX.Element;

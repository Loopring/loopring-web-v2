import { WithTranslation, withTranslation } from "react-i18next";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import {
  CreateRedPacketProps,
  RedPacketStep,
  WithdrawProps,
} from "../../tradePanel/Interface";
import { FeeInfo, IBData } from "@loopring-web/common-resources";
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
    //div {
    //
    //
    //}
  }
`;
export const CreateRedPacketPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <
    T extends Partial<RedPacketOrderData<I>>,
    I extends any,
    LuckInfo,
    C = FeeInfo
  >({
    tradeType = "TOKEN",
    tradeData,
    handleOnDataChange,
    walletMap = {},
    coinMap = {},
    t,
    ...rest
  }: CreateRedPacketProps<T, I, LuckInfo, C> &
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
    const handleError = ({ belong, balance, tradeValue }: IBData<I>) => {
      if (typeof tradeValue !== "undefined" && (balance ?? 0 < tradeValue)) {
        return {
          error: true,
          message: `Not enough ${belong} perform a deposit`,
        };
      }
      return { error: false };
    };

    const props: SwitchPanelProps<string> = {
      index: panelIndex,
      panelList: [
        {
          key: "selectType",
          element: React.useMemo(
            () => (
              // @ts-ignore
              <CreateRedPacketStepType
                handleError={handleError as any}
                handleOnDataChange={handleOnDataChange as any}
                redPacketStepValue={undefined}
                setActiveStep={setActiveStep}
                activeStep={RedPacketStep.ChooseType}
                tradeData={tradeData as any}
                tradeType={tradeType}
                {...{ ...rest }}
              />
            ),
            []
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
                handleError={handleError as any}
                handleOnDataChange={handleOnDataChange as any}
                redPacketStepValue={undefined}
                tradeType={tradeType}
                onChangeEvent={onChangeEvent as any}
                setActiveStep={setActiveStep}
                activeStep={RedPacketStep.ChooseType}
                tradeData={tradeData as any}
                {...{ ...rest }}
              />
            );
          }, []),
          toolBarItem: undefined,
          // React.useMemo(
          // () => (
          //   <>
          //     {onBack ? (
          //       <ModalBackButton
          //         marginTop={0}
          //         marginLeft={-2}
          //         onBack={() => {
          //           onBack();
          //         }}
          //         {...rest}
          //       />
          //     ) : (
          //       // @ts-ignore
          //       <CreateRedPacketStepWrap
          //         handleError={handleError as any}
          //         tradeData={tradeData as any}
          //         handleOnDataChange={handleOnDataChange as any}
          //         {...{ ...rest }}
          //       />
          //     )}
          //   </>
          // ),
          // [onBack]
          // ),
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
                        onChangeEvent,
                        selected: switchData.tradeData.belong,
                        tradeData: switchData.tradeData,
                        walletMap: getWalletMapWithoutLP(),
                        t,
                        ...rest,
                        coinMap,
                        //oinMap
                      } as any)}
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
      <BoxStyle
        className={walletMap ? "createRedPacket" : "loading createRedPacket"}
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
        <SwitchPanel {...{ ...rest, t, ...props }} />
      </BoxStyle>
    );
  }
) as unknown as <T, I>(
  props: WithdrawProps<T, I> & React.RefAttributes<any>
) => JSX.Element;

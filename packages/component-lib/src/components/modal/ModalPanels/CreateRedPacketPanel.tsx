import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
} from "../../basic-lib";
import {
  CreateRedPacketViewProps,
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
import { Box } from "@mui/material";
const steps = [
  "labelRedPacketChoose", //Prepare NFT metadata
  "labelRedPacketMain", //labelADMint2
];
export const CreateRedPacketPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <T extends IBData<I>, I, LuckInfo, C = FeeInfo>({
    type = "TOKEN",
    chargeFeeTokenList,
    onSubmitClick,
    // handleOnSelectedType,
    btnStatus,
    assetsData,
    handleOnDataChange,
    walletMap = {},
    coinMap = {},
    onBack,
    t,
    ...rest
  }: CreateRedPacketViewProps<T, I, LuckInfo, C> &
    WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      coinMap,
      type,
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

    const props: SwitchPanelProps<string> = {
      index: panelIndex,
      panelList: [
        {
          key: "selectType",
          element: React.useMemo(
            () => (
              <></>
              // <CreateRedPacketStepType
              //   handleOnSelectedType={handleOnSelectedType}
              //   handleOnDataChange={handleOnDataChange}
              //   redPacketStepValue={undefined}
              //   selectedType={{
              //     labelKey: "",
              //     desKey: "",
              //     value: {
              //       value: 0,
              //       partition: sdk.LuckyTokenAmountType.RANDOM,
              //       mode: sdk.LuckyTokenClaimType.RELAY,
              //     },
              //   }}
              //   setActiveStep={setActiveStep}
              //   btnStatus={TradeBtnStatus.AVAILABLE}
              //   walletMap={undefined}
              //   activeStep={RedPacketStep.ChooseType}
              // />
            ),
            []
          ),
        },
        {
          key: "trade",
          element: React.useMemo(() => {
            return <></>;
            // <CreateRedPacketStepWrap />
          }, []),
          toolBarItem: React.useMemo(
            () => (
              <>
                {onBack ? (
                  <ModalBackButton
                    marginTop={0}
                    marginLeft={-2}
                    onBack={() => {
                      onBack();
                    }}
                    {...rest}
                  />
                ) : (
                  <></>
                )}
              </>
            ),
            [onBack]
          ),
        },
      ].concat(
        type === "TOKEN"
          ? ([
              {
                key: "tradeMenuList",
                element: React.useMemo(
                  () => (
                    <TradeMenuList
                      {...({
                        nonZero: true,
                        sorted: true,
                        ...rest,
                        onChangeEvent,
                        coinMap,
                        selected: switchData.tradeData.belong,
                        tradeData: switchData.tradeData,
                        walletMap: getWalletMapWithoutLP(),
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
        <SwitchPanel {...{ ...rest, t, ...props }} />
      </Box>
    );
  }
) as unknown as <T, I>(
  props: WithdrawProps<T, I> & React.RefAttributes<any>
) => JSX.Element;

import { useTranslation } from "react-i18next";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import { CreateRedPacketProps, RedPacketStep } from "../../tradePanel";
import {
  FeeInfo,
  LuckyRedPacketList,
  NFTWholeINFO,
  RedPacketOrderData,
  TRADE_TYPE,
} from "@loopring-web/common-resources";
import {
  HorizontalLabelPositionBelowStepper,
  TradeMenuList,
  useBasicTrade,
} from "../../tradePanel/components";
import React from "react";
import { cloneDeep } from "lodash";

import {
  CreateRedPacketStepTokenType,
  CreateRedPacketStepType,
  CreateRedPacketStepWrap,
} from "../../tradePanel/components/CreateRedPacketWrap";
import { Box, styled } from "@mui/material";

const steps = [
  "labelRedPacketTypeTokens", //labelADMint2
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
export const CreateRedPacketPanel = <
  T extends Partial<RedPacketOrderData<I>>,
  I extends any,
  C = FeeInfo,
  NFT = NFTWholeINFO
>({
  tradeType,
  tradeData,
  disabled,
  handleOnDataChange,
  walletMap = {},
  coinMap = {},
  tokenMap = {},
  assetsData,
  //@ts-ignore
  myNFTPanel,
  ...rest
}: CreateRedPacketProps<T, I, C, NFT> & { assetsData: any[] }) => {
  const { t, i18n, ready: tReady } = useTranslation(["common", "error"]);
  const { onChangeEvent, index, switchData } = useBasicTrade({
    ...rest,
    coinMap,
    type: tradeType,
    // index,
    walletMap,
  } as any);
  const [panelIndex, setPanelIndex] = React.useState(RedPacketStep.TradeType);

  React.useEffect(() => {
    if (
      tradeType === TRADE_TYPE.NFT &&
      tradeData.nftData &&
      panelIndex === RedPacketStep.NFTList
    ) {
      setActiveStep(RedPacketStep.Main);
    }
  }, [tradeData?.nftData, panelIndex, tradeType]);

  const setActiveStep = React.useCallback((index: RedPacketStep) => {
    switch (index) {
      case RedPacketStep.TradeType:
        setPanelIndex(0);
        break;
      case RedPacketStep.ChooseType:
        handleOnDataChange({
          collectionInfo: undefined,
          tokenId: undefined,
          tradeValue: undefined,
          balance: undefined,
          nftData: undefined,
          belong: undefined,
          tokenAddress: undefined,
          image: undefined,
        } as any);
        setPanelIndex(1);
        break;
      case RedPacketStep.Main:
        handleOnDataChange({
          validSince: Date.now(),
        } as any);
        setPanelIndex(2);
        break;
      case RedPacketStep.NFTList:
        setPanelIndex(3);
        break;
    }
  }, []);
  React.useEffect(() => {
    setPanelIndex((state) => {
      if (state > 1) {
        return index + 2;
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

  const [selectedType, setSelectType] = React.useState(
    tradeData.tradeType === TRADE_TYPE.NFT
      ? LuckyRedPacketList.find((x) => x.defaultForNFT)
      : LuckyRedPacketList.find((x) => x.defaultForERC20)
  );
  React.useEffect(() => {
    setSelectType(() => {
      if (tradeData && tradeData.type) {
        // if (tradeData.)
        const found = LuckyRedPacketList.find(
          (x) =>
            tradeData.type?.partition == x.value.partition &&
            tradeData.type?.mode == x.value.mode
        );
        // found?.value.mode ===
        return found ?? LuckyRedPacketList[2];
      } else {
        return LuckyRedPacketList[2];
      }
    });
    // setScope();
  }, [
    tradeData?.type?.partition,
    // tradeData?.type?.scope,
    tradeData?.type?.mode,
  ]);

  // tradeData.tradeType === TRADE_TYPE.NFT
  React.useEffect(() => {
    const found =
      tradeData.tradeType === TRADE_TYPE.NFT
        ? LuckyRedPacketList.find((x) => x.defaultForNFT)
        : LuckyRedPacketList.find((x) => x.defaultForERC20);

    setSelectType(found);
    handleOnDataChange({
      type: {
        ...tradeData?.type,
        partition: found!.value.partition,
        mode: found!.value.mode,
      },
    } as any);
  }, [tradeData.tradeType]);

  const [privateChecked, setPrivateChecked] = React.useState(false);

  const props: SwitchPanelProps<string> = React.useMemo(() => {
    return {
      index: panelIndex,
      panelList: [
        {
          key: "selectTokenType",
          element: (
            <CreateRedPacketStepTokenType
              {...({
                ...rest,
                handleOnDataChange: handleOnDataChange as any,
                disabled,
                tradeType,
                setActiveStep,
                activeStep: RedPacketStep.TradeType,
              } as any)}
            />
          ),
          toolBarItem: undefined,
        },
        {
          key: "selectType",
          element: (
            <CreateRedPacketStepType
              {...({
                ...rest,
                handleOnDataChange: handleOnDataChange as any,
                tradeData: {
                  ...tradeData,
                  type: tradeData.type,
                } as any,
                disabled,
                tradeType,
                selectedType,
                setActiveStep,
                activeStep: RedPacketStep.ChooseType,
              } as any)}
              privateChecked={privateChecked}
              onChangePrivateChecked={() => {
                handleOnDataChange({
                  type: {
                    ...tradeData?.type,
                    scope: !privateChecked ? 1 : 0,
                  },
                } as any);
                setPrivateChecked(!privateChecked);
              }}
            />
          ),
          toolBarItem: undefined,
        },
        {
          key: "trade",
          element: (
            // @ts-ignore
            <CreateRedPacketStepWrap
              {...{
                ...rest,
                tradeData,
                disabled,
                coinMap,
                selectedType,
                handleOnDataChange: handleOnDataChange as any,
                tradeType,
                tokenMap,
                walletMap: getWalletMapWithoutLP(),
                onChangeEvent,
                setActiveStep,
                activeStep: RedPacketStep.Main,
              }}
            />
          ),
          toolBarItem: undefined,
        },
      ].concat(
        tradeType === TRADE_TYPE.TOKEN
          ? ([
              {
                key: "tradeMenuList",
                element: (
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
                toolBarItem: undefined,
              },
            ] as any)
          : myNFTPanel
          ? ([
              {
                key: "nftList",
                element: myNFTPanel,
                toolBarItem: undefined,
              },
            ] as any)
          : []
      ),
      _width: "100%",
    };
  }, [
    tradeData,
    rest,
    tradeType,
    switchData,
    coinMap,
    assetsData,
    rest,
    walletMap,
    onChangeEvent,
    getWalletMapWithoutLP,
    panelIndex,
    disabled,
    tradeData,
  ]);
  return (
    <BoxStyle
      className={walletMap ? "createRedPacket" : "loading createRedPacket"}
      display={"flex"}
      flex={1}
      flexDirection={"column"}
      paddingY={5 / 2}
      paddingTop={3}
      paddingBottom={0}
      alignItems={"center"}
    >
      <HorizontalLabelPositionBelowStepper
        activeStep={panelIndex === 2 || panelIndex === 3 ? 2 : panelIndex}
        steps={steps}
      />
      <Box
        paddingTop={2}
        display={"flex"}
        flex={1}
        width={"100%"}
        minWidth={240}
        paddingX={3}
      >
        <SwitchPanel {...{ ...rest, tReady, i18n, t, ...props }} />
      </Box>
    </BoxStyle>
  );
};

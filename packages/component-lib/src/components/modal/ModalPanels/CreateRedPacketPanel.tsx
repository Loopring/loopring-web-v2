import { useTranslation } from 'react-i18next'
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import { CreateRedPacketProps, RedPacketStep, TargetRedPacketStep } from '../../tradePanel'
import {
  FeeInfo,
  LuckyRedPacketItem,
  LuckyRedPacketList,
  NFTWholeINFO,
  RedPacketOrderData,
  RedPacketOrderType,
} from '@loopring-web/common-resources'
import {
  HorizontalLabelPositionBelowStepper,
  TradeMenuList,
  useBasicTrade,
} from '../../tradePanel/components'
import React from 'react'
import { cloneDeep } from 'lodash'

import {
  CreateRedPacketScope,
  CreateRedPacketStepTokenType,
  CreateRedPacketStepType,
  CreateRedPacketStepWrap,
  TargetRedpacktInputAddressStep,
  TargetRedpacktSelectStep,
} from '../../tradePanel/components/CreateRedPacketWrap'
import { Box, styled } from '@mui/material'
import { LuckyTokenClaimType, LuckyTokenViewType } from '@loopring-web/loopring-sdk'
import { useNotify } from '@loopring-web/core'

const BoxStyle = styled(Box)`
  &.createRedPacket {
    .container {
      align-items: center;
      display: flex;
    }
  }
`
export const CreateRedPacketPanel = <
  T extends Partial<RedPacketOrderData<I>>,
  I extends any,
  C = FeeInfo,
  NFT = NFTWholeINFO,
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
  onSendTargetRedpacketClick,
  targetRedPackets,
  popRedPacket,
  onClickViewTargetDetail,
  onCloseRedpacketPop,
  contacts,
  isWhiteListed,
  ...rest
}: CreateRedPacketProps<T, I, C, NFT> & { assetsData: any[] }) => {
  const { t, i18n, ready: tReady } = useTranslation(['common', 'error'])
  const { onChangeEvent, index, switchData } = useBasicTrade({
    ...rest,
    coinMap,
    type: tradeType,
    // index,
    walletMap,
  } as any)
  const [panelIndex, setPanelIndex] = React.useState<RedPacketStep | TargetRedPacketStep>(
    tradeType === RedPacketOrderType.FromNFT 
      ? RedPacketStep.ChooseType 
      : RedPacketStep.TradeType,
  )

  let steps: string[]
  if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
    if (tradeType === RedPacketOrderType.FromNFT) {
      steps = [
        'labelRedPacketChoose', //Prepare NFT metadata
        'labelRedPacketMain', //labelADMint2
        'labelRedPacketRecipientList', //labelADMint2
      ]
    } else {
      steps = [
        'labelRedPacketChooseTarget', //labelADMint2
        'labelRedPacketTypeTokens', //labelADMint2
        'labelRedPacketChoose', //Prepare NFT metadata
        'labelRedPacketMain', //labelADMint2
        'labelRedPacketRecipientList', //labelADMint2
      ]
    }
  } else {
    if (tradeType === RedPacketOrderType.FromNFT) {
      steps = [
        'labelRedPacketChoose', //Prepare NFT metadata
        'labelRedPacketMain', //labelADMint2
      ]
    } else {
      steps = [
        'labelRedPacketTypeTokens', //labelADMint2
        'labelRedPacketChoose', //Prepare NFT metadata
        'labelRedPacketMain', //labelADMint2
      ]
    }
  }

  React.useEffect(() => {
    if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
      if (tradeData.target?.redpacketHash) {
        setActiveStep(TargetRedPacketStep.TargetSend)
      } else if (!isToken && tradeData.nftData && panelIndex === TargetRedPacketStep.NFTList) {
        setActiveStep(TargetRedPacketStep.Main)
      }
    } else {
      if (!isToken && tradeData.nftData && panelIndex === RedPacketStep.NFTList) {
        setActiveStep(RedPacketStep.Main)
      }
    }
  }, [tradeData?.nftData, panelIndex, tradeType, tradeData.target?.redpacketHash])

  const setActiveStep = React.useCallback(
    (index: RedPacketStep | TargetRedPacketStep) => {
      if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
        switch (index) {
          case TargetRedPacketStep.TradeType:
            setPanelIndex(1)
            break
          case TargetRedPacketStep.ChooseType:
            if (tradeType !== RedPacketOrderType.FromNFT) {
              handleOnDataChange({
                collectionInfo: undefined,
                tokenId: undefined,
                tradeValue: undefined,
                balance: undefined,
                nftData: undefined,
                belong: undefined,
                tokenAddress: undefined,
                image: undefined,
              } as any)
            }
            setPanelIndex(2)
            break
          case TargetRedPacketStep.Main:
            handleOnDataChange({
              validSince: Date.now(),
            } as any)
            setPanelIndex(3)
            break
          case TargetRedPacketStep.NFTList:
            setPanelIndex(4)
            break
          case TargetRedPacketStep.TargetSend:
            setPanelIndex(5)
            break
        }
      } else {
        switch (index) {
          case RedPacketStep.TradeType:
            setPanelIndex(0)
            break
          case RedPacketStep.ChooseType:
            if (tradeType !== RedPacketOrderType.FromNFT) {
              handleOnDataChange({
                collectionInfo: undefined,
                tokenId: undefined,
                tradeValue: undefined,
                balance: undefined,
                nftData: undefined,
                belong: undefined,
                tokenAddress: undefined,
                image: undefined,
              } as any)
            }
            setPanelIndex(1)
            break
          case RedPacketStep.Main:
            handleOnDataChange({
              validSince: Date.now(),
            } as any)
            setPanelIndex(2)
            break
          case RedPacketStep.NFTList:
            setPanelIndex(3)
            break
        }
      }
    },
    [tradeData.type?.scope],
  )
  React.useEffect(() => {
    setPanelIndex((state) => {
      if (state > 1) {
        if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
          return index + 3
        } else {
          return index + 2
        }
      } else {
        return state
      }
    })
  }, [index, tradeData.type?.scope])
  // LP token should not exist in withdraw panel for now
  const getWalletMapWithoutLP = React.useCallback(() => {
    const clonedWalletMap = cloneDeep(walletMap ?? {})
    const keyList = Object.keys(clonedWalletMap)
    keyList.forEach((key) => {
      const [first] = key.split('-')
      if (first === 'LP') {
        delete clonedWalletMap[key]
      }
    })
    return clonedWalletMap
  }, [walletMap])
  const showERC20Blindbox = useNotify().notifyMap?.redPacket.showERC20Blindbox
  const [selectedType, setSelectType] = React.useState(
    tradeData.tradeType === RedPacketOrderType.NFT
      ? LuckyRedPacketList.find((config) => config.defaultForNFT)
      : tradeData.tradeType === RedPacketOrderType.BlindBox
      ? LuckyRedPacketList.find((config) =>
          showERC20Blindbox
            ? config.defaultForBlindbox
            : config.defaultForBlindboxNotShowERC20Blindbox,
        )
      : tradeData.tradeType === RedPacketOrderType.FromNFT
      ? LuckyRedPacketList.find((config) => config.defaultForFromNFT)
      : LuckyRedPacketList.find((config) => config.defaultForERC20),
  )
  React.useEffect(() => {
    setSelectType(() => {
      if (tradeData && tradeData.type) {
        let found: LuckyRedPacketItem | undefined
        if (tradeType === RedPacketOrderType.FromNFT) {
          found = LuckyRedPacketList.find(
            (config) =>
              config.showInFromNFT &&
              config.value.mode === tradeData.type?.mode &&
              config.value.partition === tradeData.type?.partition,
          )
        } else if (tradeData.type?.mode === LuckyTokenClaimType.BLIND_BOX) {
          found = LuckyRedPacketList.find(
            (config) =>
              config.value.mode === LuckyTokenClaimType.BLIND_BOX &&
              (tradeData.isNFT ? true : false) === (config.isBlindboxNFT ? true : false),
          )
        } else {
          found = LuckyRedPacketList.find(
            (config) =>
              tradeData.type?.partition == config.value.partition &&
              tradeData.type?.mode == config.value.mode,
          )
        }
        return found ?? LuckyRedPacketList[2]
      } else {
        return LuckyRedPacketList[2]
      }
    })
    // setScope();
  }, [
    tradeData?.type?.partition,
    // tradeData?.type?.scope,
    tradeData?.type?.mode,
    tradeData.isNFT,
  ])

  React.useEffect(() => {
    const found =
      tradeData.tradeType === RedPacketOrderType.NFT
        ? LuckyRedPacketList.find((config) => config.defaultForNFT)
        : tradeData.tradeType === RedPacketOrderType.BlindBox
        ? LuckyRedPacketList.find((config) =>
            showERC20Blindbox
              ? config.defaultForBlindbox
              : config.defaultForBlindboxNotShowERC20Blindbox,
          )
        : tradeData.tradeType === RedPacketOrderType.FromNFT
        ? LuckyRedPacketList.find((config) => config.defaultForFromNFT)
        : LuckyRedPacketList.find((config) => config.defaultForERC20)
    setSelectType(found)
    handleOnDataChange({
      type: {
        ...tradeData?.type,
        partition: found!.value.partition,
        mode: found!.value.mode,
      },
      isNFT:
        tradeData.tradeType === RedPacketOrderType.NFT ||
        tradeData.tradeType === RedPacketOrderType.FromNFT ||
        (tradeData.tradeType === RedPacketOrderType.BlindBox && !showERC20Blindbox)
          ? true
          : false,
    } as any)
  }, [tradeData.tradeType, showERC20Blindbox])

  const [privateChecked, setPrivateChecked] = React.useState(false)
  const isToken =
    tradeType === RedPacketOrderType.TOKEN ||
    (tradeType === RedPacketOrderType.BlindBox && !tradeData.isNFT)
  const [showScope, setShowScope] = React.useState(true)
  const backToScope = () => setShowScope(true)
  const notify = useNotify()
  const props: SwitchPanelProps<string> = React.useMemo(() => {
    const isTarget = tradeData.type?.scope === LuckyTokenViewType.TARGET
    let showNFT = isTarget 
      ? notify.notifyMap?.redPacket.showNFT && isWhiteListed
      : notify.notifyMap?.redPacket.showNFT && tradeData.type?.scope !== LuckyTokenViewType.PUBLIC
    const commonPanels = [
      {
        key: 'selectTokenType',
        element: (
          <CreateRedPacketStepTokenType
            {...({
              ...rest,
              handleOnDataChange: handleOnDataChange as any,
              disabled,
              tradeType,
              setActiveStep,
              activeStep: RedPacketStep.TradeType,
              backToScope: backToScope,
              onClickNext: () => {
                if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
                  setActiveStep(TargetRedPacketStep.ChooseType)
                } else {
                  setActiveStep(RedPacketStep.ChooseType)
                }
              },
              showNFT
            } as any)}
          />
        ),
        toolBarItem: undefined,
      },
      {
        key: 'selectType',
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
              onClickNext: () => {
                if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
                  setActiveStep(TargetRedPacketStep.Main)
                } else {
                  setActiveStep(RedPacketStep.Main)
                }
              },
            } as any)}
            privateChecked={privateChecked}
            onChangePrivateChecked={() => {
              handleOnDataChange({
                type: {
                  ...tradeData?.type,
                  scope: !privateChecked ? 1 : 0,
                },
              } as any)
              setPrivateChecked(!privateChecked)
            }}
            backToScope={backToScope}
            showNFT={showNFT}
          />
        ),
        toolBarItem: undefined,
      },
      {
        key: 'trade',
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
    ]
    const tokenNFTSelectionPanel = isToken
      ? {
          key: 'tradeMenuList',
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
        }
      : myNFTPanel
      ? {
          key: 'nftList',
          element: myNFTPanel,
          toolBarItem: undefined,
        }
      : undefined
    if (isTarget) {
      return {
        index: panelIndex,
        _width: '100%',
        panelList: [
          {
            key: 'tradeMenuList',
            element: (
              <TargetRedpacktSelectStep
                backToScope={backToScope}
                onCloseRedpacketPop={onCloseRedpacketPop}
                popRedPacket={popRedPacket}
                onClickExclusiveRedpacket={(hash) => {
                  handleOnDataChange({
                    target: {
                      ...tradeData.target,
                      redpacketHash: hash,
                    },
                  } as any)
                  setActiveStep(TargetRedPacketStep.TargetSend)
                }}
                targetRedPackets={targetRedPackets}
                onClickCreateNew={() => {
                  setActiveStep(TargetRedPacketStep.TradeType)
                }}
                onClickViewDetail={(hash) => {
                  onClickViewTargetDetail(hash)
                }}
              />
            ),
            toolBarItem: undefined,
          },
          ...commonPanels,
          tokenNFTSelectionPanel as any,
          {
            key: 'selectTokenType',
            element: (
              <TargetRedpacktInputAddressStep
                contacts={contacts}
                addressListString={tradeData.target?.addressListString ?? ''}
                isRedDot={
                  tradeData.target?.isRedDot !== undefined ? tradeData.target?.isRedDot : true
                }
                onChangeIsRedDot={(isRedDot) => {
                  handleOnDataChange({
                    target: {
                      ...tradeData.target,
                      isRedDot,
                    },
                  } as any)
                }}
                onFileInput={(input) => {
                  handleOnDataChange({
                    target: {
                      ...tradeData.target,
                      addressListString: input,
                    },
                  } as any)
                }}
                onManualInputConfirm={(input) => {
                  handleOnDataChange({
                    target: {
                      ...tradeData.target,
                      addressListString: input,
                    },
                  } as any)
                }}
                onClickSend={() => {
                  onSendTargetRedpacketClick()
                }}
                onConfirm={(addressList) => {
                  handleOnDataChange({
                    target: {
                      ...tradeData.target,
                      addressListString: addressList.join(';'),
                    },
                  } as any)
                }}
                showPopUpOption={isWhiteListed ? true : false}
              />
            ),
            toolBarItem: undefined,
          },
        ],
      }
    } else {
      return {
        index: panelIndex,
        _width: '100%',
        panelList: [...commonPanels, tokenNFTSelectionPanel as any],
      }
    }
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
    isToken,
    tradeData.type?.scope
  ])

  let activeStep
  if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
    activeStep = panelIndex === 3 || panelIndex === 4 ? 3 : panelIndex
  } else {
    activeStep = panelIndex === 2 || panelIndex === 3 ? 2 : panelIndex
  }
  return (
    <BoxStyle
      className={walletMap ? 'createRedPacket' : 'loading createRedPacket'}
      display={'flex'}
      flex={1}
      flexDirection={'column'}
      paddingY={5 / 2}
      paddingTop={3}
      paddingBottom={0}
      alignItems={'center'}
    >
      {showScope ? (
        <CreateRedPacketScope
          showPalazaPublic={tradeData.tradeType !== RedPacketOrderType.FromNFT}
          onClickNext={() => {
            if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
              setActiveStep(TargetRedPacketStep.TargetChosse)
            } else {
              setActiveStep(RedPacketStep.TradeType)
            }
            setShowScope(false)
          }}
          onSelecteScope={(scope) => {
            handleOnDataChange({
              type: {
                ...tradeData?.type,
                scope: scope,
              },
            } as any)
          }}
          selectedScope={tradeData.type!.scope!}
        />
      ) : (
        <>
          <HorizontalLabelPositionBelowStepper activeStep={activeStep} steps={steps} />
          <Box paddingTop={2} display={'flex'} flex={1} width={'100%'} minWidth={240} paddingX={3}>
            <SwitchPanel {...{ ...rest, tReady, i18n, t, ...props }} />
          </Box>
        </>
      )}
    </BoxStyle>
  )
}

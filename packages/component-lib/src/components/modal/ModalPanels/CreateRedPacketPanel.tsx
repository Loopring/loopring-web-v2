import { useTranslation } from 'react-i18next'
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import { CreateRedPacketProps, RedPacketStep, TargetRedPacketStep } from '../../tradePanel'
import {
  FeeInfo,
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
import {
  LuckyTokenAmountType,
  LuckyTokenClaimType,
  LuckyTokenViewType,
} from '@loopring-web/loopring-sdk'
import moment from 'moment'

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
  myNFTPanel,
  onSendTargetRedpacketClick,
  targetRedPackets,
  popRedPacket,
  popRedPacketAmountStr,
  onClickViewTargetDetail,
  onCloseRedpacketPop,
  contacts,
  isWhiteListed,
  showExclusiveOption,
  ...rest
}: CreateRedPacketProps<T, I, C, NFT> & { assetsData: any[] }) => {
  const { t, i18n, ready: tReady } = useTranslation(['common', 'error'])
  const { redPacketConfig } = rest
  const { onChangeEvent, index, switchData } = useBasicTrade({
    ...rest,
    coinMap,
    type: tradeType,
    // index,
    walletMap,
  } as any)
  const [panelIndex, setPanelIndex] = React.useState<RedPacketStep | TargetRedPacketStep>(
    tradeType === RedPacketOrderType.FromNFT ? RedPacketStep.ChooseType : RedPacketStep.TradeType,
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
  React.useEffect(() => {
    if (tradeData.tradeType !== RedPacketOrderType.FromNFT) {
      handleOnDataChange({
        type: {
          ...tradeData.type,
          scope: LuckyTokenViewType.PRIVATE,
          mode: LuckyTokenClaimType.BLIND_BOX,
          partition: LuckyTokenAmountType.RANDOM,
        },
        tradeType: RedPacketOrderType.BlindBox,
      } as any)
    } else {
      handleOnDataChange({
        type: {
          ...tradeData.type,
          scope: LuckyTokenViewType.PRIVATE,
          mode: LuckyTokenClaimType.BLIND_BOX,
          partition: LuckyTokenAmountType.RANDOM,
        },
      } as any)
    }
  }, [])

  const setActiveStep = React.useCallback(
    (index: RedPacketStep | TargetRedPacketStep) => {
      if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
        switch (index) {
          case TargetRedPacketStep.TargetChosse:
            setPanelIndex(0)
            break
          case TargetRedPacketStep.TradeType:
            if (tradeType === RedPacketOrderType.FromNFT) {
              setPanelIndex(0)
            } else {
              setPanelIndex(1)
            }
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
            if (tradeType === RedPacketOrderType.FromNFT) {
              setPanelIndex(0)
            } else {
              setPanelIndex(2)
            }
            break
          case TargetRedPacketStep.Main:
            handleOnDataChange({
              validSince: Date.now(),
            } as any)
            if (tradeType === RedPacketOrderType.FromNFT) {
              setPanelIndex(1)
            } else {
              setPanelIndex(3)
            }
            break
          case TargetRedPacketStep.NFTList:
            if (tradeType === RedPacketOrderType.FromNFT) {
              setPanelIndex(2)
            } else {
              setPanelIndex(4)
            }
            break
          case TargetRedPacketStep.TargetSend:
            if (tradeType === RedPacketOrderType.FromNFT) {
              setPanelIndex(3)
            } else {
              setPanelIndex(5)
            }
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
            if (tradeType === RedPacketOrderType.FromNFT) {
              setPanelIndex(0)
            } else {
              setPanelIndex(1)
            }
            break
          case RedPacketStep.Main:
            handleOnDataChange({
              validSince: Date.now(),
            } as any)
            if (tradeType === RedPacketOrderType.FromNFT) {
              setPanelIndex(1)
            } else {
              setPanelIndex(2)
            }
            break
          case RedPacketStep.NFTList:
            if (tradeType === RedPacketOrderType.FromNFT) {
              setPanelIndex(2)
            } else {
              setPanelIndex(3)
            }
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
  const [selectedType, setSelectType] = React.useState(
    tradeData.tradeType === RedPacketOrderType.NFT
      ? LuckyRedPacketList.find((config) => config.defaultForNFT)
      : tradeData.tradeType === RedPacketOrderType.BlindBox
      ? LuckyRedPacketList.find((config) =>
          redPacketConfig.showERC20Blindbox
            ? config.defaultForBlindbox
            : config.defaultForBlindboxNotShowERC20Blindbox,
        )
      : tradeData.tradeType === RedPacketOrderType.FromNFT
      ? LuckyRedPacketList.find((config) => config.defaultForFromNFT)
      : LuckyRedPacketList.find((config) => config.defaultForERC20),
  )

  const [privateChecked, setPrivateChecked] = React.useState(false)
  const isToken =
    tradeType === RedPacketOrderType.TOKEN ||
    (tradeType === RedPacketOrderType.BlindBox && !tradeData.isNFT)
  const [showScope, setShowScope] = React.useState(true)
  const backToScope = () => setShowScope(true)
  const props: SwitchPanelProps<string> = React.useMemo(() => {
    const isTarget = tradeData.type?.scope === LuckyTokenViewType.TARGET
    let showNFT = isTarget
      ? redPacketConfig.showNFT
      : redPacketConfig.showNFT && tradeData.type?.scope !== LuckyTokenViewType.PUBLIC

    const tradeMenuListPanel = {
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
    const nftListPanel = {
      key: 'nftList',
      element: myNFTPanel,
      toolBarItem: undefined,
    }
    const selectTypePanel = {
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
          onSelecteValue={(item) => {
            setSelectType(item)
            if (tradeType === RedPacketOrderType.BlindBox) {
              handleOnDataChange({
                isNFT: item.isBlindboxNFT ? true : false,
                type: {
                  ...tradeData?.type,
                  partition: item.value.partition,
                  mode: item.value.mode,
                },
              } as any)
            } else {
              handleOnDataChange({
                type: {
                  ...tradeData?.type,
                  partition: item.value.partition,
                  mode: item.value.mode,
                },
              } as any)
            }
          }}
        />
      ),
      toolBarItem: undefined,
    }
    const tradePanel = {
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
    }
    const selectTokenTypePanel = {
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
            onClickBack: () => {
              if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
                setActiveStep(TargetRedPacketStep.TargetChosse)
              } else {
                backToScope()
              }
            },
            onClickNext: () => {
              if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
                setActiveStep(TargetRedPacketStep.ChooseType)
              } else {
                setActiveStep(RedPacketStep.ChooseType)
              }
            },
            showNFT,
            onChangeTradeType: (tradeType) => {
              const found =
                tradeType === RedPacketOrderType.NFT
                  ? LuckyRedPacketList.find((config) => config.defaultForNFT)
                  : tradeType === RedPacketOrderType.BlindBox
                  ? LuckyRedPacketList.find((config) =>
                      redPacketConfig?.showERC20Blindbox
                        ? config.defaultForBlindbox
                        : config.defaultForBlindboxNotShowERC20Blindbox,
                    )
                  : tradeType === RedPacketOrderType.FromNFT
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
                  tradeType === RedPacketOrderType.NFT ||
                  tradeType === RedPacketOrderType.FromNFT ||
                  (tradeType === RedPacketOrderType.BlindBox && !redPacketConfig?.showERC20Blindbox)
                    ? true
                    : false,
                tradeType,
              } as any)
            },
          } as any)}
        />
      ),
      toolBarItem: undefined,
    }
    const targetSelectPanel = {
      key: 'targetSelect',
      element: (
        <TargetRedpacktSelectStep
          backToScope={backToScope}
          onCloseRedpacketPop={onCloseRedpacketPop}
          popRedPacket={popRedPacket}
          popRedPacketAmountStr={popRedPacketAmountStr}
          onClickExclusiveRedpacket={(info) => {
            handleOnDataChange({
              target: {
                ...tradeData.target,
                redpacketHash: info.hash,
                maxSendCount: info.remainCount,
              },
            } as any)
            setActiveStep(TargetRedPacketStep.TargetSend)
          }}
          targetRedPackets={targetRedPackets}
          onClickCreateNew={() => {
            window.scrollTo(0, 0)
            setActiveStep(TargetRedPacketStep.TradeType)
          }}
          onClickViewDetail={(hash) => {
            onClickViewTargetDetail(hash)
          }}
          {...{ ...rest }}
        />
      ),
      toolBarItem: undefined,
    }
    const maximumTargetsLength = tradeData.target?.maxSendCount ?? 0
    const targetInputAddressPanel = {
      key: 'targetInputAddress',
      element: (
        <TargetRedpacktInputAddressStep
          maximumTargetsLength={maximumTargetsLength}
          contacts={contacts}
          addressListString={tradeData.target?.addressListString ?? ''}
          popupChecked={
            isWhiteListed
              ? tradeData.target?.popupChecked !== undefined
                ? tradeData.target?.popupChecked
                : true
              : false
          }
          onChangePopupChecked={(popupChecked) => {
            handleOnDataChange({
              target: {
                ...tradeData.target,
                popupChecked,
              },
            } as any)
          }}
          onFileInput={(input) => {
            handleOnDataChange({
              target: {
                ...tradeData.target,
                addressListString: input
                  .split(';')
                  .map((value) => value.trim())
                  .slice(0, maximumTargetsLength)
                  .join(';\n'),
              },
            } as any)
          }}
          onManualEditInput={(input) => {
            handleOnDataChange({
              target: {
                ...tradeData.target,
                addressListString: input,
              },
            } as any)
          }}
          onClickSend={() => {
            onSendTargetRedpacketClick().then(() => {
              handleOnDataChange({
                target: undefined,
              } as any)
              setActiveStep(TargetRedPacketStep.TargetChosse)
            })
          }}
          onConfirm={(addressList) => {
            handleOnDataChange({
              target: {
                ...tradeData.target,
                addressListString: addressList.join(';\n'),
              },
            } as any)
          }}
          popUpOptionDisabled={isWhiteListed ? false : true}
          onClickBack={() => {
            handleOnDataChange({
              target: undefined,
            } as any)
            setActiveStep(TargetRedPacketStep.TargetChosse)
          }}
          sentAddresses={tradeData.target?.sentAddresses}
          clearInput={() => {
            handleOnDataChange({
              numbers: undefined,
              tradeValue: undefined,
              validSince: Date.now(),
              validUntil: moment().add('days', 1).toDate().getTime(),
              giftNumbers: undefined,
              memo: '',
            } as any)
          }}
        />
      ),
      toolBarItem: undefined,
    }
    const tokenNFTSelectionPanel = isToken
      ? tradeMenuListPanel
      : myNFTPanel
      ? nftListPanel
      : undefined
    return {
      index: panelIndex,
      _width: '100%',
      panelList: [
        ...(isTarget && tradeData.tradeType !== RedPacketOrderType.FromNFT
          ? [targetSelectPanel]
          : []),
        ...(tradeData.tradeType !== RedPacketOrderType.FromNFT ? [selectTokenTypePanel] : []),
        selectTypePanel,
        tradePanel,
        tokenNFTSelectionPanel as any,
        ...(isTarget ? [targetInputAddressPanel] : []),
      ],
      scrollDisabled:
        tradeData.type?.scope === LuckyTokenViewType.TARGET &&
        panelIndex !== TargetRedPacketStep.TargetSend,
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
    tradeData.type?.scope,
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
          palazaPublicDisabled={tradeData.tradeType === RedPacketOrderType.FromNFT}
          onClickNext={() => {
            if (tradeData.type?.scope === LuckyTokenViewType.TARGET) {
              setActiveStep(TargetRedPacketStep.TargetChosse)
            } else {
              setActiveStep(RedPacketStep.TradeType)
            }
            setShowScope(false)
          }}
          onSelecteScope={(scope) => {
            if (tradeData.tradeType === RedPacketOrderType.FromNFT) {
              handleOnDataChange({
                type: {
                  ...tradeData?.type,
                  scope: scope,
                  mode: LuckyTokenClaimType.BLIND_BOX,
                  partition: LuckyTokenAmountType.RANDOM,
                },
              } as any)
              setSelectType(LuckyRedPacketList.find((config) => config.defaultForFromNFT))
            } else {
              const found = LuckyRedPacketList.find((config) =>
                redPacketConfig?.showERC20Blindbox
                  ? config.defaultForBlindbox
                  : config.defaultForBlindboxNotShowERC20Blindbox,
              )
              setSelectType(found)
              handleOnDataChange({
                type: {
                  ...tradeData?.type,
                  scope: scope,
                  mode: LuckyTokenClaimType.BLIND_BOX,
                  partition: LuckyTokenAmountType.RANDOM,
                },
                isNFT: false,
                tradeType: RedPacketOrderType.BlindBox,
              } as any)
            }
          }}
          selectedScope={tradeData.type!.scope!}
          exclusiveDisabled={!isWhiteListed && tradeData.tradeType === RedPacketOrderType.FromNFT}
          showBackBtn={tradeData.tradeType === RedPacketOrderType.FromNFT}
          showExclusiveOption={showExclusiveOption ? true : false}
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

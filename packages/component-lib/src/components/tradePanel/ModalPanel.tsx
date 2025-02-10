import { Box, BoxProps, Modal as MuiModal } from '@mui/material'
import {
  AccountStep,
  ActiveAccountPanel,
  AnotherNetworkNotice,
  ClaimProps,
  CollectionAdvanceProps,
  DeFiStackRedeemWrap,
  DeFiStakeRedeemWrapProps,
  DeployNFTWrap,
  DepositPanel,
  DepositProps,
  ExportAccountPanel,
  InformationForAccountFrozen,
  LayerswapNotice,
  ModalCloseButton,
  modalContentBaseStyle,
  ModalPanelProps,
  NFTDeployProps,
  RedPacketViewStep,
  ResetAccountConfirmationPanel,
  ResetPanel,
  ResetProps,
  TransferPanel,
  TransferProps,
  useOpenModals,
  useSettings,
  WithdrawPanel,
  WithdrawProps,
  EditContact,
  TransferToTaikoAccountModal,
  TransferToTaikoAccountProps,
} from '../..'
import {
  Account,
  CollectionMeta,
  FeeInfo,
  IBData,
  SendAssetList,
  TRADE_TYPE,
  TradeNFT,
} from '@loopring-web/common-resources'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import { CollectionAdvanceWrap } from './components/CollectionAdvanceWrap'
import { ClaimWithdrawPanel } from '../modal/ModalPanels/ClaimWithdrawPanel'
import { TargetRedpacketWrap } from './components/TargetRedpacketWrap'
import { TransferNFTBurn } from './components'


const BoxStyle = styled(Box)<{ _height?: number | string; _width?: number | string } & BoxProps>`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  ${({ theme }) => modalContentBaseStyle({ theme: theme })}
  background: var(--color-pop-bg);

  .trade-wrap {
    margin-top: -26px;
  }
  > .vault-wrap {
    .vaultSwap {
      .MuiToolbar-root {
        > .MuiTypography-root:first-of-type {
          align-self: flex-end;
          font-size: ${({ theme }) => theme.fontDefault.h5};
          padding: 0 ${({ theme }) => 3 * theme.unit}px;
          margin-bottom: ${({ theme }) => 1.5 * theme.unit}px;
        }
        > .toolButton {
          height: 100%;
          align-items: center;
        }
        .MuiTypography-root {
          height: auto;
        }
        margin-bottom: ${({ theme }) => 2 * theme.unit}px;
        border-bottom: var(--color-divide) 1px solid;
        .record {
          visibility: hidden;
        }
      }
    }
    margin-top: -32px;
    .MuiToolbar-root {
      height: 48px;
      padding: 0;
    }
    .toolbarTitle {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
  }

  > .vault-wrap {
    .vaultSwap {
      .MuiToolbar-root {
        > .MuiTypography-root:first-of-type {
          align-self: flex-end;
          font-size: ${({ theme }) => theme.fontDefault.h5};
          padding: 0 ${({ theme }) => 3 * theme.unit}px;
          margin-bottom: ${({ theme }) => 1.5 * theme.unit}px;
        }

        > .toolButton {
          height: 100%;
          align-items: center;
        }

        .MuiTypography-root {
          height: auto;
        }

        margin-bottom: ${({ theme }) => 2 * theme.unit}px;
        border-bottom: var(--color-divide) 1px solid;

        .record {
          visibility: hidden;
        }
      }
    }

    margin-top: -32px;

    .MuiToolbar-root {
      height: 48px;
      padding: 0;
    }

    .toolbarTitle {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
  }

  .trade-panel {
    position: relative;
    height: ${({ _height }) =>
      _height && Number.isNaN(_height) ? _height + 'px' : _height ? _height : 'auto'};

    &.valut-load {
      padding: 0;
      border: 0;

      .react-swipeable-view-container {
        & > div {
          padding: 0 ${({ theme }) => (theme.unit * 5) / 2}px 0px;
        }
      }
    }

    .react-swipeable-view-container {
      & > div {
        padding: 0 ${({ theme }) => (theme.unit * 5) / 2}px ${({ theme }) => theme.unit * 5}px;
        overflow-x: hidden;
        overflow-y: scroll !important;
        background: initial;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* Internet Explorer 10+ */

        &::-webkit-scrollbar {
          /* WebKit */
          width: 0;
        }

        .container {
          height: 100%;
          padding-top: 0;
        }
      }
    }
  }
` as (props: { _height?: number | string; _width?: number | string } & BoxProps) => JSX.Element

export const Modal = withTranslation('common')(
  ({
    open,
    onClose,
    content,
    _height,
    contentClassName,
    _width,
    ...rest
  }: ModalPanelProps & WithTranslation) => {
    const { isMobile } = useSettings()
    return (
      <MuiModal
        open={open}
        onClose={onClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <BoxStyle
          style={{ boxShadow: '24' }}
          {...{
            _width: _width ?? `var(--modal-width)`,
            _height: _height,
          }}
        >
          <Box display={'flex'} width={'100%'} flexDirection={'column'}>
            <ModalCloseButton onClose={onClose} {...rest} />
          </Box>
          <Box
            className={contentClassName}
            maxWidth={isMobile ? 'var(--modal-min-width)' : 'inherit'}
          >
            {content}
          </Box>
        </BoxStyle>
      </MuiModal>
    )
  },
)

export const ModalPanel = <
  T extends IBData<I>,
  N extends IBData<I> & TradeNFT<I, any>,
  C extends CollectionMeta,
  I,
  F = FeeInfo,
>({
  transferProps,
  withdrawProps,
  depositProps,
  nftTransferProps,
  nftWithdrawProps,
  nftDeployProps,
  resetProps,
  claimProps,
  nftBurnProps,
  activeAccountProps,
  collectionAdvanceProps,
  sideStackRedeemProps,
  contactAddProps,
  assetsData,
  account,
  baseURL,
  transferToTaikoProps,
  ...rest
}: {
  _width?: number | string
  _height?: number | string
  nftBurnProps: TransferProps<T, I>
  contactAddProps: any
  transferProps: TransferProps<T, I>
  withdrawProps: WithdrawProps<T, I>
  baseURL: string
  nftTransferProps: TransferProps<N, I>
  claimProps: ClaimProps<T, I>
  nftWithdrawProps: WithdrawProps<N, I>
  nftDeployProps: NFTDeployProps<N & { broker: string }, I, F>
  depositProps: DepositProps<T, I>
  sideStackRedeemProps: DeFiStakeRedeemWrapProps<T, I, any>

  collectionAdvanceProps: CollectionAdvanceProps<C>

  resetProps: ResetProps<F>
  activeAccountProps: ResetProps<F>
  assetsData: any[]
  exportAccountProps: any
  account: Account
  setExportAccountToastOpen: any
  transferToTaikoProps: TransferToTaikoAccountProps
}) => {
  const { isMobile } = useSettings()
  const {
    modals,
    setShowTransfer,
    setShowDeposit,
    setShowWithdraw,
    setShowResetAccount,
    setShowActiveAccount,
    setShowExportAccount,
    setShowNFTTransfer,
    setShowNFTWithdraw,
    setShowNFTDeploy,
    setShowAccount,
    setShowClaimWithdraw,
    setShowCollectionAdvance,
    setShowSideStakingRedeem,
    setShowTargetRedpacketPop,
    setShowRedPacket,
    setShowEditContact,
    setShowTransferToTaikoAccount    // setShowDual,
  } = useOpenModals()

  const {
    isShowTransfer,
    isShowWithdraw,
    isShowDeposit,
    isShowNFTTransfer,
    isShowNFTWithdraw,
    isShowNFTDeploy,
    isShowResetAccount,
    isShowExportAccount,
    isShowTradeIsFrozen,
    isShowActiveAccount,
    isShowCollectionAdvance,
    isShowLayerSwapNotice,
    isShowAnotherNetwork,
    isShowClaimWithdraw,
    isShowSideStakingRedeem,
    isShowTargetRedpacketPop,
    isShowEditContact,
    isShowTransferToTaikoAccount
  } = modals
  const theme = useTheme()
  return (
    <>
      <Modal
        open={isShowClaimWithdraw.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => setShowClaimWithdraw({ isShow: false, claimToken: undefined as any })}
        content={
          <ClaimWithdrawPanel
            {...{
              ...rest,
              ...claimProps,
              assetsData,
              // _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              // //    _height: DEFAULT_TRANSFER_HEIGHT + 100, ...transferProps, assetsData,
              // _height: "auto",
            }}
          />
        }
      />
      <Modal
        open={isShowTransfer.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => {
          isShowTransfer.info?.onCloseCallBack && isShowTransfer.info?.onCloseCallBack()
          setShowTransfer({ isShow: false })
        }}
        content={
          <TransferPanel<any, any>
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              //    _height: DEFAULT_TRANSFER_HEIGHT + 100, ...transferProps, assetsData,
              _height: isMobile ? 'auto' : 600,
              ...transferProps,
              assetsData,
            }}
          />
        }
      />
      <TransferToTaikoAccountModal
        {...transferToTaikoProps}
        // open={isShowTransferToTaikoAccount.isShow}
      />

      <Modal
        open={isShowWithdraw.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => {
          isShowWithdraw.info?.onCloseCallBack && isShowWithdraw.info?.onCloseCallBack()
          setShowWithdraw({ isShow: false })
        }}
        content={
          <WithdrawPanel<any, any>
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: isMobile
                ? 'auto'
                : 480 + (withdrawProps.withdrawMode?.showTrustUI ? 100 : 0) + (withdrawProps.isToMyself ? 0 : 100),
              ...withdrawProps,
              assetsData,
              isFromContact: isShowWithdraw.address ? true : false,
              contact: isShowWithdraw.address
                ? {
                    address: isShowWithdraw.address!,
                    name: isShowWithdraw.name!,
                  }
                : undefined,
            }}
          />
        }
      />

      <Modal
        open={isShowNFTTransfer.isShow && !isShowNFTTransfer.info?.isBurn}
        contentClassName={'trade-wrap'}
        onClose={() => setShowNFTTransfer({ isShow: false })}
        content={
          <TransferPanel
            {...{
              ...nftTransferProps,
              _width: isMobile ? 'var(--mobile-full-panel-width)' : 440,
              _height: isMobile ? 'auto' : 600,
              isThumb: false,
              type: TRADE_TYPE.NFT,
              baseURL,
              assetsData,
            }}
            onBack={() => {
              setShowNFTTransfer({ isShow: false })
              setShowAccount({
                isShow: true,
                step: AccountStep.SendNFTGateway,
              })
            }}
          />
        }
      />
      <Modal
        open={isShowNFTWithdraw.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => setShowNFTWithdraw({ isShow: false })}
        content={
          <WithdrawPanel
            {...{
              // _width: isMobile ? "var(--mobile-full-panel-width)" : 440,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              //    _height: DEFAULT_TRANSFER_HEIGHT + 100, ...transferProps, assetsData,
              _height: isMobile ? 'auto' : 500,
              isThumb: false,
              ...nftWithdrawProps,
              type: TRADE_TYPE.NFT,
              baseURL,
              assetsData,
              isFromContact: isShowNFTWithdraw.address ? true : false,
              contact: isShowNFTWithdraw.address
                ? {
                    address: isShowNFTWithdraw.address!,
                    name: isShowNFTWithdraw.name!,
                  }
                : undefined,
            }}
            onBack={() => {
              setShowNFTWithdraw({ isShow: false })
              setShowAccount({
                isShow: true,
                step: AccountStep.SendNFTGateway,
              })
            }}
          />
        }
      />
      <Modal
        open={isShowNFTDeploy.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => setShowNFTDeploy({ isShow: false })}
        content={
          <DeployNFTWrap<any, any, any>
            {...{
              ...nftDeployProps,
              assetsData,
            }}
          />
        }
      />
      <Modal
        open={isShowDeposit.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => setShowDeposit({ isShow: false })}
        content={
          <DepositPanel
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: 'auto',
              ...depositProps,
            }}
          />
        }
      />
      <Modal
        open={isShowNFTTransfer.isShow && isShowNFTTransfer.info?.isBurn}
        contentClassName={'trade-wrap'}
        onClose={() => setShowNFTTransfer({ isShow: false })}
        content={
          <Box width={`var(--modal-width)`} marginBottom={5 / 2}>
            <TransferNFTBurn
              {...{
                ...rest,
                ...(nftBurnProps as any),
              }}
            />
          </Box>
        }
      />
      <Modal
        open={isShowResetAccount.isShow}
        onClose={() => setShowResetAccount({ ...isShowResetAccount, isShow: false })}
        content={
          isShowResetAccount.info?.confirmationType ? (
            <ResetAccountConfirmationPanel
              onConfirmation={() =>
                setShowResetAccount({
                  ...isShowResetAccount,
                  info: { ...isShowResetAccount.info, confirmationType: undefined },
                })
              }
              type={isShowResetAccount?.info?.confirmationType}
            />
          ) : (
            <ResetPanel<any, any>
              {...{
                ...rest,
                _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
                _height: `auto`,
                ...resetProps,
                assetsData,
              }}
            />
          )
        }
      />
      <Modal
        open={isShowActiveAccount.isShow}
        onClose={() => setShowActiveAccount({ ...isShowActiveAccount, isShow: false })}
        content={
          isShowActiveAccount?.info?.confirmationType ? (
            <ResetAccountConfirmationPanel
              onConfirmation={() =>
                setShowActiveAccount({
                  ...isShowActiveAccount,
                  info: { ...isShowActiveAccount.info, confirmationType: undefined },
                })
              }
              type={isShowActiveAccount?.info?.confirmationType}
            />
          ) : (
            <ActiveAccountPanel<any, any>
              {...{
                ...rest,
                _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
                _height: `auto`,
                ...activeAccountProps,
              }}
            />
          )
        }
      />
      <Modal
        open={isShowExportAccount.isShow}
        onClose={() => setShowExportAccount({ ...isShowExportAccount, isShow: false })}
        content={
          <ExportAccountPanel
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: `calc(var(--modal-height) + ${theme.unit * 16}px)`,
            }}
          />
        }
      />
      <Modal
        open={isShowExportAccount.isShow}
        onClose={() => setShowExportAccount({ ...isShowExportAccount, isShow: false })}
        content={
          <ExportAccountPanel
            {...{
              ...rest,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: `calc(var(--modal-height) + ${theme.unit * 16}px)`,
            }}
          />
        }
      />
      <InformationForAccountFrozen
        open={isShowTradeIsFrozen.isShow}
        type={isShowTradeIsFrozen.type ?? 'Action'}
        messageKey={isShowTradeIsFrozen.messageKey ?? 'labelNoticeForForAccountFrozen'}
      />
      <LayerswapNotice open={isShowLayerSwapNotice.isShow} account={account} />
      <AnotherNetworkNotice open={isShowAnotherNetwork.isShow} account={account} />
      <Modal
        open={isShowCollectionAdvance?.isShow}
        onClose={() => setShowCollectionAdvance({ isShow: false })}
        content={
          <CollectionAdvanceWrap
            {...{
              ...rest,
              // _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              // _height: `calc(var(--modal-height) - ${theme.unit * 6}px)`,
              ...collectionAdvanceProps,
            }}
          />
        }
      />
      <Modal
        open={isShowSideStakingRedeem.isShow}
        contentClassName={'trade-wrap hasLinerBg'}
        onClose={() => setShowSideStakingRedeem({ isShow: false })}
        content={
          <Box
            maxWidth='var(--modal-width)'
            flex={1}
            display={'flex'}
            paddingX={5 / 2}
            paddingBottom={5 / 2}
          >
            <DeFiStackRedeemWrap isJoin={false} {...(sideStackRedeemProps as any)} />
          </Box>
        }
      />
      <Modal
        // maxWidth={'md'}
        open={isShowTargetRedpacketPop.isShow}
        onClose={() => {
          setShowTargetRedpacketPop({ isShow: false, info: {} })
        }}
        content={
          <TargetRedpacketWrap
            exclusiveRedPackets={isShowTargetRedpacketPop.info.exclusiveRedPackets}
            onClickOpenExclusive={(redpacket) => {
              setShowTargetRedpacketPop({ isShow: false, info: {} })
              setShowRedPacket({
                isShow: true,
                info: {
                  ...redpacket,
                },
                step: RedPacketViewStep.OpenPanel,
              })
            }}
          />
        }
      />
      <Modal
        // maxWidth={'md'}
        open={isShowEditContact.isShow}
        onClose={() => {
          setShowEditContact({ isShow: false, info: {} })
        }}
        content={
          <EditContact
            {...{
              ...contactAddProps,
            }}
            onBack={
              isShowEditContact?.info?.from === AccountStep.SendAssetFromContact
                ? () => {
                    setShowAccount({
                      isShow: true,
                      step: AccountStep.SendAssetFromContact,
                      info: {
                        ...contactAddProps?.isEdit?.item,
                        select: SendAssetList.SendAssetToOtherL1.key,
                      },
                    })
                    setShowEditContact({ isShow: false, info: {} })
                  }
                : undefined
            }
            // contacts={isShowAccount.info?.contacts}
            // setToast={setToast}
          />
        }
      />
    </>
  )
}

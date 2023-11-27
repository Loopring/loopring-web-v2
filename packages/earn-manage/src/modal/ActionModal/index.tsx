import styled from '@emotion/styled'
import {
  Button,
  DepositPanel,
  Modal,
  useSettings,
  WithdrawPanel,
} from '@loopring-web/component-lib'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { useAccount } from '@loopring-web/core'
import {
  AccountStatus,
  L1L2_NAME_DEFINED,
  MapChainId,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
const WrapStyle = styled(Box)`
  .withdraw-wrap {
    > .react-swipeable-view-container {
      > div:first-of-type {
        height: 0;
      }
    }
    .address-wrap,
    .fee-wrap,
    .address-type-wrap {
      display: none;
    }
  }
`

export type SettleProps = {
  btnStatus: TradeBtnStatus
  onClose: () => void
  btnLabel: string
  onSubmitClick: () => void
  disabled?: boolean
}
export const SettlePanel = ({
  disabled = false,
  btnStatus,
  onClose,
  btnLabel,
  onSubmitClick,
}: SettleProps) => {
  const { t } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED
  }, [disabled, btnStatus])
  const label = React.useMemo(() => {
    const key = btnLabel.split('|')
    return t(
      key[0],
      key && key[1]
        ? {
            arg: key[1],
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          }
        : {
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          },
    )
  }, [t, btnLabel])

  return (
    <Box
      flex={1}
      width={'var(--swap-box-width)'}
      minHeight={'100px'}
      display={'flex'}
      justifyContent={'space-between'}
      flexDirection={'column'}
      padding={3}
    >
      <Typography variant={'h3'} component={'h3'}>
        Settle
      </Typography>
      <Typography variant={'body1'} component={'p'}>
        Settle des.........
      </Typography>
      <Button
        fullWidth
        variant={'contained'}
        size={'medium'}
        color={'primary'}
        onClick={() => {
          onSubmitClick(0)
          // onWithdrawClick(tradeData);
        }}
        loading={btnStatus === TradeBtnStatus.LOADING && !getDisabled ? 'true' : 'false'}
        disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
      >
        {label}
      </Button>
    </Box>
  )
}

export const ActionModal = ({
  isShowDeposit,
  setShowDeposit,
  depositProps,

  isShowWithdraw,
  setShowWithdraw,
  withdrawProps,

  isShowSettle,
  setShowSettle,
  settleProps,
}: any) => {
  const { account } = useAccount()
  return account.readyState === AccountStatus.UN_CONNECT ? (
    <></>
  ) : (
    <>
      <Modal
        open={isShowDeposit.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => {
          setShowDeposit({ isShow: false })
        }}
        content={
          <WrapStyle>
            <DepositPanel
              _height={'auto'}
              title={'deposit'}
              accountReady={account?.readyState as any}
              {...depositProps}

              // btnInfo={_depositBtnI18nKey}
              // depositBtnStatus={_depositBtnStatus}
              // onDepositClick={_onDepositClick}
              // isNewAccount={false}
            />
          </WrapStyle>
        }
      />
      <Modal
        open={isShowWithdraw.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => {
          setShowWithdraw({ isShow: false })
        }}
        content={
          <WrapStyle>
            <WithdrawPanel
              className={'withdraw-wrap'}
              _height={'auto'}
              accountReady={account?.readyState as any}
              {...withdrawProps}
              // btnInfo={_depositBtnI18nKey}
              // depositBtnStatus={_depositBtnStatus}
              // onDepositClick={_onDepositClick}
              // isNewAccount={false}
            />
          </WrapStyle>
        }
      />
      <Modal
        open={isShowSettle.isShow}
        contentClassName={'trade-wrap'}
        onClose={() => {
          setShowSettle({ isShow: false })
        }}
        content={<SettlePanel {...settleProps} disabled={false} />}
      />
    </>
  )
}

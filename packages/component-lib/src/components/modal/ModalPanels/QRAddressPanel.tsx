import { Box, Link, Typography } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  Account,
  CopyIcon,
  copyToClipBoard,
  L1L2_NAME_DEFINED,
  MapChainId,
  TOAST_TIME,
} from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { useSettings } from '../../../stores'
import { Button } from '../../basic-lib'
import React from 'react'
import { Toast, ToastType } from '../../toast'
import { QRCode } from '../QRCode'

const BoxStyle = styled(Box)`
  ${({ theme }) => theme.border.defaultFrame({ c_key: 'blur', d_R: 1 / 2, d_W: 0 })};
  background: var(--provider-agree);
` as typeof Box
export const QRAddressPanel = withTranslation('common')(
  ({
    isForL2Send,
    accAddress,
    isNewAccount,
    t,
    btnInfo,
  }: //    etherscanUrl,
  WithTranslation & {
    btnInfo: {
      btnTxt: string
      callback: () => void
    }
    etherscanUrl: string
    isForL2Send: boolean
    isNewAccount: boolean
  } & Account) => {
    const { feeChargeOrder } = useSettings()
    const [copyToastOpen, setCopyToastOpen] = React.useState(false)
    const { defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    //     const etherscanLink = etherscanUrl + 'address/' + accAddress;
    return (
      <Box
        flex={1}
        paddingY={2}
        paddingX={2}
        marginTop={-7}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Typography variant={'h4'} marginBottom={2}>
          {t('labelReceiveAddress')}
        </Typography>
        {!!isForL2Send && (
          <BoxStyle marginBottom={2}>
            <Typography
              variant={'body1'}
              display={'inline-flex'}
              alignItems={'baseline'}
              color={'var(--color-warning)'}
              paddingY={2}
              paddingX={5}
            >
              {isNewAccount
                ? t('labelReceiveAddressGuide', {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                    symbol: feeChargeOrder?.join(', '),
                  })
                : t('labelReceiveAddressGuide', {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,

                    symbol: t('labelAssets', {
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                    }),
                  })}
            </Typography>
          </BoxStyle>
        )}
        <QRCode size={240} url={accAddress} />
        <Link
          marginTop={3}
          variant={'body2'}
          color={'textSecondary'}
          sx={{ wordBreak: 'break-all' }}
          display={'inline-flex'}
          alignItems={'center'}
          onClick={(e) => {
            e.stopPropagation()
            copyToClipBoard(accAddress)
            setCopyToastOpen(true)
          }}
        >
          {accAddress}
          <CopyIcon sx={{ paddingLeft: 1 }} color={'inherit'} fontSize={'large'} />
        </Link>
        <Typography paddingX={5} paddingTop={2} paddingBottom={1} variant={'body2'}>
          {t(isNewAccount ? 'labelReceiveAddressDesActive' : 'labelReceiveAddressDes', {
            loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })}
        </Typography>
        <Box alignSelf={'stretch'} paddingX={5}>
          <Button
            variant={'contained'}
            fullWidth
            size={'medium'}
            onClick={(_e?: any) => {
              if (btnInfo?.callback) {
                btnInfo.callback()
              }
            }}
          >
            {btnInfo?.btnTxt}
          </Button>
        </Box>
        <Toast
          alertText={t('labelCopyAddClip')}
          open={copyToastOpen}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            setCopyToastOpen(false)
          }}
          severity={ToastType.success}
        />
      </Box>
    )
  },
)

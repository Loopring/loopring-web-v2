import { WithTranslation, withTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { Box, Grid, Typography } from '@mui/material'
import moment from 'moment'
import {
  EmptyValueTag,
  L1L2_NAME_DEFINED,
  MapChainId,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import { TxType } from '@loopring-web/loopring-sdk'
import React from 'react'
import { TxnDetailProps } from '../Interface'
import { useSettings } from '../../../../stores'

// import { getValuePrecisionThousand } from '@loopring-web/common-resources';

const ContentWrapperStyled = styled(Box)`
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  min-width: ${({ theme }) => theme.unit * 87.5}px;
  height: 75%;
  background-color: var(--color-box);
  box-shadow: 0px ${({ theme }) => theme.unit / 2}px ${({ theme }) => theme.unit / 2}px
    rgba(0, 0, 0, 0.25);
  border-radius: ${({ theme }) => theme.unit}px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
`

const HeaderStyled = styled(Box)`
  position: absolute;
  top: 0;
  z-index: 22;
  width: 100%;
  height: ${({ theme }) => theme.unit * 7.5}px;
  box-shadow: 0px ${({ theme }) => theme.unit / 4}px ${({ theme }) => theme.unit}px
    rgba(0, 0, 0, 0.25);
  border-radius: ${({ theme }) => theme.unit}px ${({ theme }) => theme.unit}px 0px 0px;
  display: flex;
  align-items: center;
`

const GridContainerStyled = styled(Grid)`
  margin-top: ${({ theme }) => theme.unit * 7.5}px;
  flex-direction: column;
  width: auto;
`

const GridItemStyled = styled(Grid)`
  display: flex;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.unit * 3}px;
`

const EthHshStyled = styled(Typography)`
  cursor: pointer;
  text-decoration: underline;
`

const TypographyStyled = styled(Typography)`
  color: var(--color-text-secondary);
  width: ${({ theme }) => theme.unit * 20}px;
`

const InfoValueStyled = styled(Box)`
  // max-width: ${({ theme }) => theme.unit * 32}px;
  word-break: break-all;
  font-size: 1.4rem;
  color: ${(props: any) => (props.hash ? 'var(--color-secondary)' : 'var(--color-text-primary)')};
` as any

const StatusStyled = styled(Typography)<any>`
  color: ${({ theme, status }) =>
    status === 'processed'
      ? theme.colorBase.success
      : status === 'processing'
      ? theme.colorBase.warning
      : status === 'failed'
      ? theme.colorBase.error
      : theme.colorBase.secondaryHover};
`

export const TxnDetailPanel = withTranslation('common', { withRef: true })(
  React.forwardRef(
    (
      {
        t,
        txType,
        hash,
        txHash,
        status,
        time,
        from,
        to,
        amount,
        fee,
        memo,
        etherscanBaseUrl,
      }: TxnDetailProps & WithTranslation,
      ref: React.ForwardedRef<any>,
    ) => {
      const { defaultNetwork } = useSettings()
      const network = MapChainId[defaultNetwork] ?? MapChainId[1]
      const headerLabel =
        txType === TxType.DEPOSIT
          ? 'labelDTxnDetailHeader'
          : txType === TxType.OFFCHAIN_WITHDRAWAL
          ? 'labelWTxnDetailHeader'
          : 'labelTTxnDetailHeader'

      const renderStatus =
        status.toUpperCase() === 'PROCESSED'
          ? t('labelTxnDetailProcessed')
          : status.toUpperCase() === 'PROCESSING' || status.toUpperCase() === 'RECEIVED'
          ? t('labelTxnDetailProcessing')
          : t('labelTxnDetailFailed')

      return (
        <ContentWrapperStyled ref={ref} tabIndex={-1}>
          <HeaderStyled>
            <Typography variant={'h4'} marginLeft={4}>
              {t(headerLabel)}
            </Typography>
          </HeaderStyled>
          <GridContainerStyled container flexDirection={'column'}>
            <GridItemStyled item>
              <TypographyStyled>
                {t('labelTxnDetailHash', {
                  layer2: L1L2_NAME_DEFINED[network].layer2,
                })}
              </TypographyStyled>
              <InfoValueStyled>{hash}</InfoValueStyled>
            </GridItemStyled>
            {txHash && (
              <GridItemStyled item>
                <TypographyStyled>
                  {t('labelTxnDetailHashLv1', {
                    layer2: L1L2_NAME_DEFINED[network].layer2,
                  })}
                </TypographyStyled>
                <InfoValueStyled>
                  <EthHshStyled
                    color={'var(--color-secondary)'}
                    onClick={() => {
                      window.open(`${etherscanBaseUrl}tx/${txHash}`)
                      window.opener = null
                    }}
                  >
                    {txHash}
                  </EthHshStyled>
                  {/* <a target={'_blank'} href={`${etherscanBaseUrl}tx/${txHash}`}>
                        {txHash}</a> */}
                </InfoValueStyled>
              </GridItemStyled>
            )}
            <GridItemStyled item>
              <TypographyStyled>{t('labelTxnDetailStatus')}</TypographyStyled>
              {/* <StatusStyled status={status}>{status.toUpperCase()}</StatusStyled> */}
              <StatusStyled status={status}>{renderStatus}</StatusStyled>
            </GridItemStyled>
            <GridItemStyled item>
              <TypographyStyled>{t('labelTxnDetailTime')}</TypographyStyled>
              <InfoValueStyled>{moment(time).format(YEAR_DAY_MINUTE_FORMAT)}</InfoValueStyled>
            </GridItemStyled>
            <GridItemStyled item>
              <TypographyStyled>{t('labelTxnDetailFrom')}</TypographyStyled>
              <InfoValueStyled hash={from}>{from || EmptyValueTag}</InfoValueStyled>
            </GridItemStyled>
            <GridItemStyled item>
              <TypographyStyled>{t('labelTxnDetailTo')}</TypographyStyled>
              <InfoValueStyled hash={to}>{to || EmptyValueTag}</InfoValueStyled>
            </GridItemStyled>
            <GridItemStyled item>
              <TypographyStyled>{t('labelTxnDetailAmount')}</TypographyStyled>
              <InfoValueStyled>{amount}</InfoValueStyled>
            </GridItemStyled>
            <GridItemStyled item>
              <TypographyStyled>{t('labelTxnDetailFee')}</TypographyStyled>
              <InfoValueStyled>{fee}</InfoValueStyled>
            </GridItemStyled>
            <GridItemStyled item>
              <TypographyStyled>{t('labelTxnDetailMemo')}</TypographyStyled>
              <InfoValueStyled>{memo || EmptyValueTag}</InfoValueStyled>
            </GridItemStyled>
          </GridContainerStyled>
        </ContentWrapperStyled>
      )
    },
  ),
)

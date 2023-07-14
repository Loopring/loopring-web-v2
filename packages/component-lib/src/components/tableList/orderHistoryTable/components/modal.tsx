import { withTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { Box, Typography } from '@mui/material'
import { SingleOrderHistoryTable } from '../SingleOrderHistoryTable'
import { TFunction } from 'i18next'
import { OrderDetailItem } from '../OrderHistoryTable'
import { useSettings } from '../../../../stores'

export enum TxnDetailStatus {
  processed = 'PROCESSED',
  processing = 'PROCESSING',
  received = 'RECEIVED',
  failed = 'FAILED',
}

const ContentWrapperStyled = styled(Box)`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: ${({ theme }) => theme.unit * 87.5}px;
  // height: 60%;
  background-color: var(--color-box);
  box-shadow: 0px ${({ theme }) => theme.unit / 2}px ${({ theme }) => theme.unit / 2}px
    rgba(0, 0, 0, 0.25);
  padding: 0 ${({ theme }) => theme.unit * 1}px;
  border-radius: ${({ theme }) => theme.unit / 2}px;
  // display: flex;
  // justify-content: center;
  // align-items: center;
`

const HeaderStyled = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: ${({ theme }) => theme.unit * 2}px;
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
  padding: 0 ${({ theme }) => theme.unit * 3}px;
  // height: ${({ theme }) => theme.unit * 7.5}px;
  // box-shadow: 0px ${({ theme }) => theme.unit / 4}px ${({ theme }) =>
    theme.unit}px rgba(0, 0, 0, 0.25);
  // border-radius: ${({ theme }) => theme.unit}px ${({ theme }) => theme.unit}px 0px 0px;
`

export const OrderDetailPanel = withTranslation('tables', { withRef: true })(
  ({
    rawData,
    t,
    showLoading,
    orderId,
  }: {
    rawData: OrderDetailItem[]
    showLoading?: boolean
    t: TFunction
    orderId: string
  }) => {
    const { isMobile } = useSettings()
    const volume = rawData.map((o) => o.amount).reduce((prev, curr) => (prev || 0) + (curr || 0), 0)
    const volumeToken = rawData[0]?.volumeToken
    return (
      <ContentWrapperStyled width={isMobile ? 'var(--mobile-full-panel-width)' : 900}>
        <HeaderStyled flexDirection={isMobile ? 'column' : 'row'} alignItems={'flex-start'}>
          <Typography variant={'h6'} display={'flex'}>
            <Typography>{t('labelOrderDetailTradingVolume')} :&nbsp;</Typography>
            <Typography>
              {volume}&nbsp;{volumeToken}
            </Typography>
          </Typography>
          <Typography variant={'h6'} display={'flex'}>
            <Typography> {t('labelOrderDetailOrderId')} : &nbsp; </Typography>
            <Typography>
              {isMobile
                ? `${orderId.substring(0, 10)}...${orderId.substring(orderId.length - 10)}`
                : orderId}
            </Typography>
          </Typography>
        </HeaderStyled>
        <SingleOrderHistoryTable rawData={rawData} showloading={showLoading} />
      </ContentWrapperStyled>
    )
  },
)

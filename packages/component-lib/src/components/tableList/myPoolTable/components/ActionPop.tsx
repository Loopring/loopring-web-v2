import React from 'react'
import { Box, ListItemText, MenuItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  HiddenTag,
  myLog,
  TokenType,
} from '@loopring-web/common-resources'
import { EarningsDetail } from '../../rewardTable'
import styled from '@emotion/styled'
import { CoinIcons } from '../../assetsTable'
import { useSettings } from '../../../../stores'

export const ActionPopContent = React.memo(
  ({ row, allowTrade, handleWithdraw, handleDeposit, t }: any) => {
    return (
      <Box borderRadius={'inherit'} minWidth={110}>
        {allowTrade?.joinAmm?.enable && (
          <MenuItem onClick={() => handleDeposit(row)}>
            <ListItemText>{t('labelPoolTableAddLiquidity', { ns: 'tables' })}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleWithdraw(row)}>
          <ListItemText>{t('labelPoolTableRemoveLiquidity', { ns: 'tables' })}</ListItemText>
        </MenuItem>
      </Box>
    )
  },
)

const ContentWrapperStyled = styled(Box)`
  padding: 0 ${({ theme }) => theme.unit * 1}px;
  border-radius: ${({ theme }) => theme.unit / 2}px;
`
export const DetailRewardPanel = ({
  detailList,
  hideAssets = false,
}: {
  detailList?: EarningsDetail[]
  hideAssets?: boolean
}) => {
  const { t } = useTranslation()
  myLog('detailLis', detailList)
  const { coinJson } = useSettings()

  return (
    <ContentWrapperStyled flexDirection={'column'} display={'flex'}>
      <Typography
        display={'inline-flex'}
        alignItems={'center'}
        component={'span'}
        color={'textSecondary'}
        marginBottom={1}
      >
        {t(`labelClaimTypePROTOCOL_FEE`)}
      </Typography>
      {detailList?.map((item) => {
        if (item.amount === '0') {
          return <React.Fragment key={item.toString()} />
        } else {
          return (
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              flexDirection={'row'}
              key={item.toString()}
            >
              <Box
                component={'span'}
                className={'logo-icon'}
                display={'flex'}
                height={'var(--list-menu-coin-size)'}
                width={'var(--list-menu-coin-size)'}
                alignItems={'center'}
                justifyContent={'flex-start'}
              >
                <CoinIcons type={TokenType.single} tokenIcon={[coinJson[item.token]]} />
                <Typography
                  component={'span'}
                  color={'var(--color-text-primary)'}
                  variant={'body1'}
                  marginLeft={1 / 2}
                  height={20}
                  lineHeight={'20px'}
                >
                  {item.token}
                </Typography>
              </Box>

              <Typography
                component={'span'}
                color={'var(--color-text-primary)'}
                variant={'body1'}
                height={20}
                marginLeft={10}
                lineHeight={'20px'}
              >
                {item.amount == '0'
                  ? EmptyValueTag
                  : hideAssets
                  ? HiddenTag
                  : getValuePrecisionThousand(
                      item.amountStr,
                      item.precision,
                      item.precision,
                      undefined,
                      false,
                      {
                        floor: true,
                      },
                    ) +
                    ' ' +
                    item.token}
              </Typography>
            </Box>
          )
        }
      })}
    </ContentWrapperStyled>
  )
}

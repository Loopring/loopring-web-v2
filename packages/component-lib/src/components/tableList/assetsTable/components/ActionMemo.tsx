import React from 'react'
import { Box, Grid, ListItemText, MenuItem, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { Button, Popover, PopoverType, PopoverWrapProps } from '../../../basic-lib'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  HiddenTag,
  MoreIcon,
} from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import { TFunction } from 'i18next'
import { useOpenModals, useSettings, useToggle } from '../../../../stores'
import { AmmPanelType } from '../../../tradePanel'
import { RawDataAssetsItem } from '../AssetsTable'

const GridStyled = styled(Grid)`
  .MuiGrid-item {
    padding: ${({ theme }) => theme.unit / 4}px 0 0;
  }
`
export type ActionProps = {
  tokenValue: any
  allowTrade?: any
  market: `${string}-${string}`
  isLp: boolean
  isDefi: boolean
  isInvest: boolean
  onSend: (token: string, isToL1: boolean) => void
  onReceive: (token: string) => void
  // onShowDeposit: (token: string) => void;
  // onShowTransfer: (token: string) => void;
  // onShowWithdraw: (token: string) => void;
  getMarketArrayListCallback: (token: string) => string[]
  t: TFunction
}
const ActionPopContent = React.memo(
  ({
    market,
    isLp,
    isDefi,
    allowTrade,
    onSend,
    onReceive,
    // onShowDeposit,
    tokenValue,
    isInvest,
    // onShowTransfer,
    // onShowWithdraw,
    getMarketArrayListCallback,
    t,
  }: ActionProps) => {
    const history = useHistory()
    const { setShowAmm } = useOpenModals()
    const { toggle } = useToggle()
    const _allowTrade = {
      ...toggle,
      allowTrade,
    }
    const { isMobile } = useSettings()
    const tradeList = [
      ...[
        <MenuItem key={'token-Receive'} onClick={() => onReceive(tokenValue)}>
          <ListItemText>{t('labelReceive')}</ListItemText>
        </MenuItem>,
        <MenuItem key={'token-Send'} onClick={() => onSend(tokenValue, isLp)}>
          <ListItemText>{t('labelSend')}</ListItemText>
        </MenuItem>,
      ],
      // ...(isToL1
      //   ? [
      //       <MenuItem onClick={() => onShowWithdraw(tokenValue)}>
      //         <ListItemText>{t("labelL2toL1Action")}</ListItemText>
      //       </MenuItem>,
      //     ]
      //   : []),
    ]
    const marketList = isLp
      ? []
      : getMarketArrayListCallback(market).filter((pair) => {
          const [first, last] = pair.split('-')
          if (first === 'USDT' || last === 'USDT') {
            return true
          }
          return first === market
        })

    return (
      <Box borderRadius={'inherit'} minWidth={110}>
        {isMobile && tradeList.map((item) => <>{item}</>)}
        {isLp ? (
          <>
            <MenuItem
              disabled={!_allowTrade?.joinAmm?.enable}
              onClick={() => {
                setShowAmm({
                  isShow: true,
                  type: AmmPanelType.Join,
                  symbol: market,
                })
              }}
            >
              <ListItemText>{t('labelPoolTableAddLiquidity')}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowAmm({
                  isShow: true,
                  type: AmmPanelType.Exit,
                  symbol: market,
                })
              }}
            >
              <ListItemText>{t('labelPoolTableRemoveLiquidity')}</ListItemText>
            </MenuItem>
          </>
        ) : isDefi ? (
          isInvest && !isMobile ? (
            <>
              {tradeList.map((item) => (
                <>{item}</>
              ))}
            </>
          ) : (
            <>
              <MenuItem
                disabled={!_allowTrade?.[`${tokenValue}Invest`]?.enable}
                onClick={() => {
                  history.push(`/invest/defi/${tokenValue}-null/invest`)
                }}
              >
                <ListItemText>{t('labelDefiInvest')}</ListItemText>
              </MenuItem>
              <MenuItem
                disabled={!_allowTrade?.[`${tokenValue}Invest`]?.enable}
                onClick={() => {
                  history.push(`/invest/defi/${tokenValue}-null/redeem`)
                }}
              >
                <ListItemText>{t('labelDefiRedeem')}</ListItemText>
              </MenuItem>
            </>
          )
        ) : (
          marketList.map((pair) => {
            const formattedPair = pair.replace('-', ' / ')
            return (
              <MenuItem
                key={pair}
                onClick={() =>
                  history.push({
                    pathname: `/trade/lite/${pair}`,
                  })
                }
              >
                <ListItemText>{formattedPair}</ListItemText>
              </MenuItem>
            )
          })
        )}
      </Box>
    )
  },
)

const ActionMemo = React.memo((props: ActionProps) => {
  const { isMobile } = useSettings()
  const history = useHistory()
  const {
    t,
    allowTrade,
    tokenValue,
    onSend,
    onReceive,
    isLp,
    isInvest = false,
    isDefi,
    // onShowDeposit,
    // onShowTransfer,
    // onShowWithdraw,
  } = props
  const popoverProps: PopoverWrapProps = {
    type: PopoverType.click,
    popupId: 'testPopup',
    className: 'arrow-none',
    children: <MoreIcon cursor={'pointer'} />,
    popoverContent: <ActionPopContent {...props} />,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'right',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'right',
    },
  } as PopoverWrapProps

  return (
    <GridStyled container spacing={1} justifyContent={'space-between'} alignItems={'center'}>
      {isMobile ? (
        <>
          {((!isLp && allowTrade?.order?.enable) || isLp || isDefi) && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
        </>
      ) : (
        <>
          <Box display={'flex'}>
            {isInvest ? (
              <>
                <Grid item>
                  <Button
                    variant={'text'}
                    size={'small'}
                    color={'primary'}
                    onClick={() => {
                      history.push(`/invest/defi/${tokenValue}-null/invest`)
                    }}
                  >
                    {t('labelDefiInvest')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={'text'}
                    size={'small'}
                    color={'primary'}
                    onClick={() => {
                      history.push(`/invest/defi/${tokenValue}-null/redeem`)
                    }}
                  >
                    {t('labelDefiRedeem')}
                  </Button>
                </Grid>
              </>
            ) : (
              <>
                <Grid item>
                  <Button
                    variant={'text'}
                    size={'small'}
                    color={'primary'}
                    onClick={() => onReceive(tokenValue)}
                  >
                    {t('labelReceive')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={'text'}
                    size={'small'}
                    color={'primary'}
                    onClick={() => onSend(tokenValue, isLp)}
                  >
                    {t('labelSend')}
                  </Button>
                </Grid>
              </>
            )}
          </Box>
          {!isLp && !isInvest && allowTrade?.order?.enable && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
          {(isLp || isInvest) && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
        </>
      )}
    </GridStyled>
  )
})
export default ActionMemo

export const LockedMemo = React.memo(
  (
    props: RawDataAssetsItem & {
      hideAssets?: boolean
      onTokenLockHold?: (item: any) => void
      tokenLockDetail?:
        | undefined
        | {
            list: any[]
            row: any
          }
    },
  ) => {
    const { onTokenLockHold, tokenLockDetail, ...row } = props
    const value = row['locked']
    const precision = row['precision']
    // myLog(tokenLockDetail);
    if (!Number(value)) {
      return <Box className={'textAlignRight'}>{EmptyValueTag}</Box>
    } else {
      return (
        <Box className={'textAlignRight'}>
          <Typography
            display={'inline-flex'}
            alignItems={'center'}
            component={'span'}
            sx={{
              textDecoration: onTokenLockHold ? 'underline dotted' : '',
              cursor: 'pointer',
            }}
            // @ts-ignore
            onClick={(e) => {
              if (onTokenLockHold) {
                onTokenLockHold(row)
              }
            }}
          >
            {props.hideAssets
              ? HiddenTag
              : getValuePrecisionThousand(value, precision, precision, undefined, false, {
                  floor: true,
                })}
          </Typography>
        </Box>
      )
    }
  },
)

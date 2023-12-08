import React from 'react'
import { Box, Grid, ListItemText, MenuItem, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { Button, Popover, PopoverType, PopoverWrapProps } from '../../../basic-lib'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  HiddenTag,
  MapChainId,
  MoreIcon,
  LEVERAGE_ETH_CONFIG,
  AmmPanelType,
  InvestAssetRouter,
  RouterPath,
} from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import { useOpenModals, useSettings, useToggle } from '../../../../stores'
import { RawDataAssetsItem } from '../AssetsTable'
import { useTranslation } from 'react-i18next'

const GridStyled = styled(Grid)`
  .MuiGrid-item {
    padding: ${({ theme }) => theme.unit / 4}px 0 0;
  }
`
export type ActionProps = {
  tokenValue: any
  allowTrade?: any
  market?: `${string}-${string}`
  isLp: boolean
  isDefi: boolean
  isInvest: boolean
  onSend: (token: string, isToL1: boolean) => void
  onReceive: (token: string) => void

  getMarketArrayListCallback?: (token: string) => string[]
  isLeverageETH: boolean
  isWebEarn?: boolean
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
    isLeverageETH,
  }: ActionProps) => {
    const history = useHistory()
    const { t } = useTranslation(['tables', 'common'])
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
      : getMarketArrayListCallback &&
        market &&
        getMarketArrayListCallback(market).filter((pair) => {
          const [first, last] = pair.split('-')
          if (first === 'USDT' || last === 'USDT') {
            return true
          }
          return first === market
        })
    const { defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const coins = LEVERAGE_ETH_CONFIG.coins[network]
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
        ) : isDefi || isLeverageETH ? (
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
                  if (coins.includes(tokenValue)) {
                    history.push(`${RouterPath.invest}/${InvestAssetRouter.LEVERAGEETH}`)
                  } else {
                    history.push(
                      `${RouterPath.invest}/${InvestAssetRouter.STAKE}/${tokenValue}-null/invest`,
                    )
                  }
                }}
              >
                <ListItemText>{t('labelDefiInvest')}</ListItemText>
              </MenuItem>
              <MenuItem
                disabled={!_allowTrade?.[`${tokenValue}Invest`]?.enable}
                onClick={() => {
                  if (coins.includes(tokenValue)) {
                    history.push(`${RouterPath.invest}/${InvestAssetRouter.LEVERAGEETH}/redeem`)
                  } else {
                    history.push(
                      `${RouterPath.invest}/${InvestAssetRouter.STAKE}/${tokenValue}-null/redeem`,
                    )
                  }
                }}
              >
                <ListItemText>{t('labelDefiRedeem')}</ListItemText>
              </MenuItem>
            </>
          )
        ) : (
          marketList?.map((pair) => {
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
  const { t } = useTranslation('tables')
  const {
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
    isLeverageETH,
    isWebEarn,
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
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const coins = LEVERAGE_ETH_CONFIG.coins[network]
  return (
    <GridStyled
      container
      spacing={1}
      justifyContent={isWebEarn ? 'flex-end' : 'space-between'}
      alignItems={'center'}
      flexWrap={'nowrap'}
    >
      {isMobile ? (
        <>
          {((!isLp && allowTrade?.order?.enable) || isLp || isDefi || isLeverageETH) && (
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
                      if (coins.includes(tokenValue)) {
                        history.push(`${RouterPath.invest}/${InvestAssetRouter.LEVERAGEETH}`)
                      } else {
                        history.push(
                          `${RouterPath.invest}/${InvestAssetRouter.STAKE}/${tokenValue}-null/invest`,
                        )
                      }
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
                      if (coins.includes(tokenValue)) {
                        history.push(`${RouterPath.invest}/${InvestAssetRouter.LEVERAGEETH}/redeem`)
                      } else {
                        history.push(
                          `${RouterPath.invest}/${InvestAssetRouter.STAKE}/${tokenValue}-null/redeem`,
                        )
                      }
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
                    {isWebEarn ? t('labelDeposit') : t('labelReceive')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={'text'}
                    size={'small'}
                    color={'primary'}
                    onClick={() => onSend(tokenValue, isLp)}
                  >
                    {isWebEarn ? t('labelWithdraw') : t('labelSend')}
                  </Button>
                </Grid>
              </>
            )}
          </Box>
          {!isWebEarn && !isLp && !isInvest && allowTrade?.order?.enable && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
          {(isLp || isInvest || isLeverageETH) && (
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
    props: Omit<RawDataAssetsItem, 'smallBalance' | 'tokenValueDollar'> & {
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

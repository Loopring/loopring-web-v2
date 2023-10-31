import {
  BackIcon,
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  PriceTag,
  TokenType,
  TRADE_TYPE,
  VaultRepayData,
} from '@loopring-web/common-resources'
import {
  EmptyDefault,
  SwitchPanel,
  SwitchPanelProps,
  useSettings,
  VaultRepayProps,
} from '@loopring-web/component-lib'
import React from 'react'
import { Box, Typography } from '@mui/material'
import { TradeMenuList, useBasicTrade } from '../components'
import { VaultRepayWrap } from '../components'
import { useTranslation } from 'react-i18next'

export const VaultRepayPanel = <T extends IBData<I>, V extends VaultRepayData<I>, I>({
  walletMap = {},
  coinMap = {},
  _width,
  type = TRADE_TYPE.TOKEN,
  forexMap,
  ...rest
}: VaultRepayProps<T, I, V>) => {
  const { currency } = useSettings()
  const { t, i18n } = useTranslation()
  const { tokenInfo } = rest
  const { onChangeEvent, index, switchData } = useBasicTrade({
    ...rest,
    type,
    walletMap,
    coinMap,
  } as any)
  const props: SwitchPanelProps<'tradeMenuList' | 'trade' | 'confirm'> = {
    index: index, // show default show
    panelList: [
      {
        key: 'tradeMenuList',
        element: React.useMemo(
          () => (
            // @ts-ignore
            <TradeMenuList
              {...{
                className: 'vaultRepay',
                nonZero: true,
                sorted: true,
                t,
                ...rest,
                onChangeEvent: (_index: 0 | 1, data) => {
                  // @ts-ignore
                  onChangeEvent(1 ^ _index, data)
                },
                hasCancel: false,
                selected: switchData.tradeData.belong,
                tradeData: switchData.tradeData,
                walletMap,
                coinMap,
                tokenType: TokenType.vault,
                contentEle: ({ ele }: { ele: any }) => {
                  return (
                    <Typography
                      component={'span'}
                      display={'flex'}
                      flexDirection={'row'}
                      alignItems={'center'}
                    >
                      <Typography
                        variant={'body1'}
                        flexDirection={'column'}
                        display={'flex'}
                        component={'span'}
                        alignItems={'flex-end'}
                        justifyContent={'space-between'}
                        marginRight={1 / 2}
                      >
                        <Typography component='span' color='textPrimary' variant={'body1'}>
                          {ele?.count || ele.count !== '0'
                            ? getValuePrecisionThousand(
                                ele.count,
                                tokenInfo?.precision ?? 6,
                                tokenInfo?.precision ?? 6,
                              )
                            : EmptyValueTag}
                          /
                          {getValuePrecisionThousand(
                            ele.borrowed,
                            tokenInfo?.precision ?? 6,
                            tokenInfo?.precision ?? 6,
                          )}
                        </Typography>
                        <Typography component='span' color='textSecondary' variant={'body2'}>
                          {PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              (ele?.usd ?? 0) * (forexMap[currency] ?? 0),
                              undefined,
                              undefined,
                              2,
                              true,
                              {
                                isFait: true,
                                floor: false,
                                isAbbreviate: true,
                                abbreviate: 6,
                              },
                            )}
                        </Typography>
                      </Typography>
                      <BackIcon
                        sx={{ transform: 'rotate(180deg)', fill: 'var(--color-text-primary)' }}
                      />
                    </Typography>
                  )
                },
              }}
            />
          ),
          [rest, onChangeEvent, switchData.tradeData, walletMap, coinMap],
        ),
        toolBarItem: undefined,
      },
      {
        key: 'trade',
        element: React.useMemo(
          () => (
            <VaultRepayWrap
              key={'trade'}
              {...{
                ...rest,
                type,
                tradeData: switchData.tradeData as any,
                onChangeEvent: (_index: 0 | 1, data) => {
                  // @ts-ignore
                  onChangeEvent(1 ^ _index, data)
                },
                disabled: !!rest.disabled,
                walletMap,
                coinMap,
              }}
            />
          ),
          [rest, switchData.tradeData, onChangeEvent, walletMap, coinMap],
        ),
        toolBarItem: React.useMemo(() => <></>, []),
      },
    ],
  }
  return Reflect.ownKeys(walletMap)?.length ? (
    <SwitchPanel _width={'var(--modal-width)'} {...{ ...rest, i18n, t, tReady: true, ...props }} />
  ) : (
    <Box
      height={'var(--min-height)'}
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
    >
      <EmptyDefault
        height={'100%'}
        message={() => (
          <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            {t('labelNoContent')}
          </Box>
        )}
      />
    </Box>
  )
}

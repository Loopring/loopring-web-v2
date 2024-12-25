import { Box, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { Trans, WithTranslation } from 'react-i18next'
import React from 'react'
import styled from '@emotion/styled'
import { CoinItemProps, CoinMenuProps } from './Interface'
import { CoinInfo, CoinKey, mapSpecialTokenName, TokenType, WalletCoin } from '@loopring-web/common-resources'
import { Virtuoso } from 'react-virtuoso'
import { CoinIcon } from '../form'
import { EmptyDefault } from '../empty'

function _CoinMenu<C, I extends CoinInfo<C>>(
  {
    coinMap = {},
    walletMap = {},
    nonZero,
    sorted,
    filterBy = (ele, filterString) => {
      return filterString && filterString.length
        ? RegExp(filterString).test(ele.simpleName as string)
        : true
    },
    filterString,
    handleSelect,
    allowScroll = true,
    selected = null,
    listProps = {},
    height = '100px',
    tokenType,
    className,
    filterWithBorrowed,
    ...rest
  }: CoinMenuProps<C, I> & WithTranslation,
  _ref: React.Ref<HTMLUListElement>,
) {
  const [select, setSelect] = React.useState<CoinKey<C> | null>(selected as CoinKey<C>)
  const [list, setList] = React.useState<any[]>([])
  const virtuoso = React.useRef(null)
  let rowIndex = 0
  React.useEffect(() => {
    if (select !== selected) {
      setSelect(selected)
    }
  }, [select, selected])

  if (nonZero === undefined) {
    nonZero = false
  }
  if (sorted === undefined) {
    sorted = true
  }
  const update = React.useCallback(() => {
    if (coinMap) {
      setList(
        Object.keys(coinMap)
          .reduce((list: Array<{ walletCoin: WalletCoin<C>; key: string }>, key) => {
            const filter = filterBy(coinMap[key], filterString)
            if (filter) {
              const walletCoin: WalletCoin<C> = walletMap[key]
                ? walletMap[key]
                : { belong: key, count: 0 }
              if ((nonZero && walletMap[key] && (filterWithBorrowed ? walletMap[key].borrowed > 0 : walletMap[key].count > 0) ) || !nonZero) {
                list.push({ walletCoin, key: key })
                if (select === key) {
                  rowIndex = list.length - 1
                }
              }
            }
            return list
          }, [])
          .sort(function (a, b) {
            if (sorted) {
              if (a.walletCoin.count && b.walletCoin.count) {
                return b.walletCoin.count - a.walletCoin.count
              } else if (a.walletCoin.count && !b.walletCoin.count) {
                return -1
              } else if (!a.walletCoin.count && b.walletCoin.count) {
                return 1
              }
              return a.walletCoin.belong.localeCompare(b.walletCoin.belong)
            }
            return 1
          }),
      )
    }
  }, [coinMap, filterString, sorted, walletMap, nonZero])
  const coinMapJSONString = JSON.stringify(coinMap) 
  React.useEffect(() => {
    update()
  }, [coinMapJSONString, filterString, sorted])

  const handleListItemClick = React.useCallback(
    (_event: React.MouseEvent, select: CoinKey<C>) => {
      setSelect(select)
      handleSelect && handleSelect(_event, select)
    },
    [handleSelect],
  )
  return (
    <>
      {list.length ? (
        <Virtuoso<{ walletCoin: WalletCoin<C>; key: string }>
          data={list}
          className={`coin-menu ${className}`}
          style={{ minHeight: '210px', flex: 1 }}
          ref={virtuoso}
          initialTopMostItemIndex={rowIndex}
          itemContent={(index, item) => {
            let { walletCoin, key } = item //list[ index ];
            return (
              <CoinItem<C>
                tokenType={tokenType}
                key={index}
                {...{
                  coinInfo: coinMap[key] ?? ({} as CoinInfo<C>),
                  walletCoin,
                  select: select,
                  handleListItemClick,
                  itemKey: key as CoinKey<C>,
                  ...rest,
                }}
              />
            )
          }}
        />
      ) : (
        <Box flex={1} height={'100%'} width={'100%'}>
          <EmptyDefault
            height={'calc(100% - 35px)'}
            message={() => {
              return <Trans i18nKey='labelNoContent'>Content is Empty</Trans>
            }}
          />
        </Box>
      )}
    </>
  )
}

export const CoinMenu = React.memo(React.forwardRef(_CoinMenu)) as unknown as <C, I = CoinInfo<C>>(
  props: CoinMenuProps<C, I> & WithTranslation & React.RefAttributes<HTMLDivElement>,
) => JSX.Element

const StyledCoinItem = styled(ListItem)`
  && {
    width: 100%;
    display: flex;
    justify-content: stretch;
    justify-items: center;
    height: var(--list-coin-item);
    box-sizing: border-box;
    padding-left: ${({ theme }) => (theme.unit / 2) * 5}px;
    padding-right: ${({ theme }) => (theme.unit / 2) * 5}px;
    align-items: center;
  }

  &.Mui-selected,
  &.Mui-focusVisible {
    background: var(--color-box-hover);

    &:hover {
      background: var(--color-box-hover);
    }
  }

  .MuiListItemIcon-root {
    height: var(--btn-icon-size);
    width: var(--btn-icon-size);
    min-width: var(--btn-icon-size);
    margin-right: ${({ theme }) => theme.unit}px;
    display: flex;
    justify-content: center;
    justify-items: center;
    align-items: center;
    .MuiAvatar-root {
      transform-origin: center;
    }
  }

  .MuiListItemText-multiline {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`

export const CoinItem = React.memo(
  React.forwardRef(
    <C extends any>(
      {
        // t,
        coinInfo,
        walletCoin,
        select,
        itemKey,
        handleListItemClick,
        tokenType,
        contentEle,
      }: CoinItemProps<C> & WithTranslation,
      ref: React.ForwardedRef<any>,
    ) => {
      const { simpleName, erc20Symbol, belongAlice } = coinInfo

      return (
        <StyledCoinItem
          button={false}
          ref={ref}
          key={itemKey as string}
          selected={select === simpleName}
          onClick={(event: React.MouseEvent) => handleListItemClick(event, itemKey)}
        >
          <ListItemIcon>
            <CoinIcon
              type={tokenType}
              tokenImageKey={tokenType == TokenType.vault ? erc20Symbol ?? simpleName : undefined}
              symbol={simpleName}
              size={24}
              lpSize={24}
            />
          </ListItemIcon>
          <ListItemText
            primary={mapSpecialTokenName(belongAlice ?? simpleName)}
            secondary={
              <>
                {contentEle ? (
                  contentEle({ ele: { ...walletCoin } })
                ) : (
                  <Typography
                    sx={{ display: 'block' }}
                    component='span'
                    color='textSecondary'
                    variant={'h5'}
                  >
                    {walletCoin.count}
                  </Typography>
                )}
              </>
            }
          />
        </StyledCoinItem>
      )
    },
  ),
) as unknown as <C>(
  props: CoinItemProps<C> & WithTranslation & React.RefAttributes<any>,
) => JSX.Element

//  <C>(props: CoinItemProps<C> & RefAttributes<HTMLElement>) => JSX.Element;
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;

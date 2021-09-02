import { useRouteMatch } from 'react-router'

import { Box, Typography } from '@material-ui/core'

import { withTranslation, WithTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { PoolsPanel } from './PoolsPanel'
import { CoinPairPanel } from './CoinPairPanel';

import { useAmmPool } from './hook';

const TableWrapperStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    flex: 1;
`

// export const subMenu = subMenuLiquidity

export const LiquidityPage = withTranslation('common', {withRef: true})(({t}: WithTranslation) => {

        // const { ammFee } = useAmmPool('LRC', 'ETH')
        //
        // console.log('--- > ammFee:', ammFee)
        //
        const {ammActivityMap} = useAmmPool();
        let match: any = useRouteMatch(['/liquidity/:item', ':next/']);
        const selected = match?.params.item ?? 'pools'
        let matchPair: any = useRouteMatch(['/liquidity/:item/:next/:symbol']);
        let symbol: any = undefined
        if (matchPair && matchPair?.params?.next && matchPair.params.item === 'pools') {
            if (!matchPair.params.symbol) {
                symbol = 'LRC-ETH';
            } else {
                symbol = matchPair.params.symbol;
            }
        }

        return (
            <>
                {symbol && <Box display={'flex'} flexDirection={'column'} flex={1} alignSelf={'flex-start'}>
                  <CoinPairPanel ammActivityMap={ammActivityMap}/>
                </Box>
                }
                {!symbol && <TableWrapperStyled>
                  <Typography
                    variant={'h2'}
                    component={'div'}
                    fontFamily={'Roboto'}
                    marginTop={2}
                    marginBottom={3}
                  >{t('labelLiquidityPageTitle')}</Typography>
                  <Box minHeight={420} display={'flex'} alignItems={'stretch'}
                       justifyContent={'stretch'} /* flexDirection="column" */ marginTop={0} flex={1} marginBottom={3}>
                      {(selected === 'pools' && !symbol) && <PoolsPanel ammActivityMap={ammActivityMap}/>}
                  </Box>
                </TableWrapperStyled>
                }
            </>
        )

    }
)
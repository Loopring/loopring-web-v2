import { useRouteMatch } from 'react-router'

import { Box, Typography, OutlinedInput, InputAdornment } from '@material-ui/core'
import {
    SubMenu,
    SubMenuList as BasicSubMenuList,
} from '@loopring-web/component-lib'
import { withTranslation, WithTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { subMenuLiquidity, SearchIcon } from '@loopring-web/common-resources'
import { PoolsPanel } from './PoolsPanel'
import { CoinPairPanel } from './CoinPairPanel';
import { AmmMiningView } from './AmmMining';
import { MyLiquidity } from './MyLiquidity'
import { useAmmPool } from './hook';

const TableWrapperStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    flex: 1;
`

export const subMenu = subMenuLiquidity

// const SubMenuList = withTranslation(['layout','common'], { withRef: true })(BasicSubMenuList);
export const LiquidityPage =  withTranslation('common', { withRef: true })(({ t }: WithTranslation) => {

    // const { ammFee } = useAmmPool('LRC', 'ETH')
    //
    // console.log('--- > ammFee:', ammFee)
    //
    const {ammActivityMap} = useAmmPool();
    let match: any = useRouteMatch(['/liquidity/:item',':next/']);
    const selected = match?.params.item ?? 'pools'
    let matchPair: any = useRouteMatch(['/liquidity/:item/:next/:symbol']);
    let symbol:any = undefined
    if (matchPair && matchPair?.params?.next && matchPair.params.item === 'pools') {
       if(!matchPair.params.symbol){
           symbol='LRC-ETH';
       }else{
           symbol=matchPair.params.symbol;
       }
    }
    
    return (
        <>
            { symbol && <Box display={'flex'} flexDirection={'column'}  flex={1} alignSelf={'flex-start'}>
              <CoinPairPanel ammActivityMap={ammActivityMap}/>
            </Box>
            }
            {!symbol && <TableWrapperStyled>  {/* <Box width={'200px'} display={'flex'} justifyContent={'stretch'} marginRight={3} marginBottom={3}>
                    <SubMenu>
                        <SubMenuList selected={selected} subMenu={subMenu as any} />
                    </SubMenu>
                </Box> */}
                <Typography 
                    variant={'h2'} 
                    component={'div'} 
                    fontFamily={'Roboto'}
                    marginTop={2}
                    marginBottom={3}
                >{t('labelLiqudityPageTitle')}</Typography>
                <Box marginBottom={3}>
                    <OutlinedInput // TODO: value && onchange
                        {...{
                            placeholder: t('labelFilter'),
                            // value: filterBy,
                            // onChange: (event: any) => {
                            //     setFilterBy(event.currentTarget?.value);
                            //     handleFilterChange(event.currentTarget?.value);
                            // }
                            }
                        }
                        key={'search'}
                        className={'search'}
                        aria-label={'search'}
                        startAdornment={<InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>}
                    />
                </Box>
                <Box minHeight={420} display={'flex'} alignItems={'stretch'} justifyContent={'stretch'} /* flexDirection="column" */ marginTop={0} flex={1} marginBottom={3}>
                    {(selected === 'pools' && !symbol ) && <PoolsPanel ammActivityMap={ammActivityMap}/>}
                    {/* {(selected === 'amm-mining' && !symbol ) && <AmmMiningView ammActivityMap={ammActivityMap}/>}
                    {(selected === 'my-liquidity' && !symbol ) && <MyLiquidity ammActivityMap={ammActivityMap}/>}
                    {selected === 'orderBook-Mining' && <AmmMiningView ammActivityMap={ammActivityMap}/>} */}
                    {/*{selected === 'orders' && <OrderPanel />}*/}
                </Box>
             </TableWrapperStyled>
            }
        </>
    )

}
)
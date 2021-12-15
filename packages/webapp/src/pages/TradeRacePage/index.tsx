import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { Box, Typography, MenuItem } from '@mui/material'
import styled from '@emotion/styled'
import { TradeRaceTable } from '@loopring-web/component-lib/src/components/tableList'
import { Button, TextField } from '@loopring-web/component-lib'
import { DropDownIcon, myLog } from '@loopring-web/common-resources'
import { useTradeRace } from './hook'
// import { AmmPoolActivityRule } from '@loopring-web/loopring-sdk'
import { useAmmPool } from '../LiquidityPage/hook'
import { useAmmMiningUI } from '../MiningPage/hook'

const LayoutStyled = styled(Box)`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    // justify-content: center;
    align-items: center;
`

const TableWrapperStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    width: 80%;
    max-width: 1200px;
    min-height: 100%;
    background-color: var(--color-box);
    border-radius: 0.4rem;
    margin: 6.4rem 0;
    padding: ${({theme}: any) => theme.unit * 4}px;
`

const StyledTextFiled = styled(TextField)`
    &.MuiTextField-root {
        max-width: initial;
    }
    .MuiInputBase-root {
        width: initial;
        max-width: initial;
    }
`

let order = 1

const FAKE_DATA = [
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
    {
        rank: order++,
        address: '0xffm4h5...89fb',
        tradeVolumne: 35.43,
        profit: 43535,
    },
]

export const TradeRacePage = withTranslation('common')(({ t }: WithTranslation) => {
    const history = useHistory()
    const [currMarketPair, setCurrMarketPair] = React.useState('')

    const {ammActivityMap} = useAmmPool();
    const {
        currPairUserRank,
        currPairRankData,
        getAmmGameRank,
        getAmmGameUserRank,
    } = useTradeRace()
    const {
        ammActivityViewMap,
        ammActivityPastViewMap,
    } = useAmmMiningUI({ammActivityMap});
    const filteredAmmViewMap = ammActivityViewMap.filter(o => o.activity.ruleType === 'SWAP_VOLUME_RANKING').map(o => `${o.coinAInfo.simpleName}-${o.coinBInfo.simpleName}`)

    const handleMarketPairChange = React.useCallback((e: React.ChangeEvent<{ value: string }>) => {
        setCurrMarketPair(e.target.value)
        getAmmGameRank(e.target.value)
        getAmmGameUserRank(e.target.value)
    }, [setCurrMarketPair, getAmmGameUserRank, getAmmGameRank])
    
    React.useEffect(() => {
        if (!currMarketPair && !!filteredAmmViewMap.length) {
            setCurrMarketPair(filteredAmmViewMap[0])
            getAmmGameUserRank(filteredAmmViewMap[0])
            getAmmGameRank(filteredAmmViewMap[0])
        }
    }, [currMarketPair, filteredAmmViewMap, getAmmGameUserRank, getAmmGameRank])

    return (
        <LayoutStyled>
            <TableWrapperStyled>
                <Box textAlign={'right'}>
                    <StyledTextFiled
                            id={'trade-race-market-pair'}
                            select
                            style={{ width: 120, textAlign: 'left' }}
                            value={currMarketPair}
                            onChange={(event: React.ChangeEvent<{ value: string }>) => {
                                handleMarketPairChange(event)
                            }}
                            inputProps={{IconComponent: DropDownIcon}}
                        >{filteredAmmViewMap.map(market => <MenuItem key={market} value={market}>{market}</MenuItem>)}
                    </StyledTextFiled>
                </Box>
                <Typography variant={'h2'} textAlign={'center'} marginBottom={0}>
                    · {t('labelTradeRaceRanking')} ·
                </Typography>
                <Box lineHeight={'24px'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Typography fontSize={16} marginRight={1}>
                        {t('labelTradeRaceYourVolume')}: 
                        {/* TODO: your volume */}
                    </Typography>
                    <Typography fontSize={16}>
                        {t('labelTradeRaceYourRanking')}: 
                        {/* TODO: your ranking */}
                    </Typography >
                    <Button style={{ fontSize: 16 }} variant={'text'} onClick={() => history.push(`/trade/lite/${currMarketPair}`)}>{t('labelTradeRaceGoTrading')} &gt;&gt;</Button>
                </Box>
                <TradeRaceTable {...{t, rawData: /* currPairRankData */ FAKE_DATA}} />
            </TableWrapperStyled>
        </LayoutStyled>
    )
})

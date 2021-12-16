import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { useHistory, useLocation } from 'react-router-dom'
import { Box, Typography, MenuItem } from '@mui/material'
import styled from '@emotion/styled'
import { TradeRaceTable } from '@loopring-web/component-lib/src/components/tableList'
import { Button, TextField, TradeRacePanel } from '@loopring-web/component-lib'
import { DropDownIcon, myLog } from '@loopring-web/common-resources'
import { useTradeRace } from './hook'
import { useAmmPool } from '../LiquidityPage/hook'
import { useAmmMiningUI } from '../MiningPage/hook'

const LayoutStyled = styled(Box)`
    width: 100%;
    // height: 100%;
    display: flex;
    flex-direction: column;
    // justify-content: center;
    align-items: center;
`

const TableWrapperStyled = styled(Box)`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 80%;
    max-width: 1200px;
    min-height: 650px;
    background-color: var(--color-box);
    border-radius: 0.4rem;
    margin-bottom: 2rem;
    padding: ${({theme}: any) => theme.unit * 4}px;
`

const ProjectWrapperStyled = styled(Box)`
    width: 80%;
    max-width: 1200px;
`

const SelectWrapperStyled = styled(Box)`
    position: absolute;
    top: 3.2rem;
    right: 3.2rem;
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

const RulesStyled = styled(Typography)`
    font-size: 1.4rem;
    margin-bottom: 1.6rem;
`

const rawData = [
    {
        project: 'Loopring',
        pair: 'LRC/ETH',
        reward: '50,000 LRC',
    },
    {
        project: 'Loopring',
        pair: 'LRC/USDC',
        reward: '50,000 LRC',
    },
    {
        project: 'Ethereum',
        pair: 'ETH/USDC',
        reward: '50,000 LRC',
    },
    {
        project: 'Ethereum Name Service',
        pair: 'ENS/ETH',
        reward: '50,000 LRC',
    },
    {
        project: 'DAOSquare',
        pair: 'RICE/USDT',
        reward: '40,000 RICE',
    },
    {
        project: 'MOVE Network',
        pair: 'MOVD/ETH',
        reward: '150,000 MOVD',
    },
    {
        project: 'DEAPcoin',
        pair: 'DEP/ETH',
        reward: '1,225,000 MOVD',
    },
]

export const TradeRacePage = withTranslation('common')(({ t }: WithTranslation) => {
    const history = useHistory()
    const { search } = useLocation()
    const [currMarketPair, setCurrMarketPair] = React.useState('')

    const {ammActivityMap} = useAmmPool();
    const {
        currPairUserRank,
        currPairRankData,
        getAmmGameRank,
        getAmmGameUserRank,
    } = useTradeRace()
    const { volume, rank } = currPairUserRank || {}
    const {
        ammActivityViewMap,
    } = useAmmMiningUI({ammActivityMap});
    const filteredAmmViewMap = ammActivityViewMap.filter(o => o.activity.ruleType === 'SWAP_VOLUME_RANKING').map(o => `${o.coinAInfo.simpleName}-${o.coinBInfo.simpleName}`)

    const handleMarketPairChange = React.useCallback((e: React.ChangeEvent<{ value: string }>) => {
        setCurrMarketPair(e.target.value)
        getAmmGameRank(e.target.value)
        getAmmGameUserRank(e.target.value)
    }, [setCurrMarketPair, getAmmGameUserRank, getAmmGameRank])
    
    React.useEffect(() => {
        if (!currMarketPair && !!filteredAmmViewMap.length && !search) {
            setCurrMarketPair(filteredAmmViewMap[0])
            getAmmGameUserRank(filteredAmmViewMap[0])
            getAmmGameRank(filteredAmmViewMap[0])
        }
    }, [currMarketPair, filteredAmmViewMap, getAmmGameUserRank, getAmmGameRank, search])

    React.useEffect(() => {
        if (search) {
            const [_, pair] = search.split('=')
            setCurrMarketPair(pair)
            getAmmGameUserRank(pair)
            getAmmGameRank(pair)
        }
    }, [getAmmGameRank, getAmmGameUserRank, search])

    return (
        <LayoutStyled>
            <Typography whiteSpace={'pre-line'} textAlign={'center'} marginTop={7} fontSize={60}>{t('labelTradeRaceTitle')}</Typography>
            <Typography marginTop={2} marginBottom={5} variant={'h5'}>Activity Period: 2021/12/23 0:00 AM to 2021/12/30 0:00 AM (UTC)</Typography>
            <TableWrapperStyled>
                <SelectWrapperStyled textAlign={'right'}>
                    <StyledTextFiled
                            id={'trade-race-market-pair'}
                            select
                            style={{ width: 150, textAlign: 'left' }}
                            value={currMarketPair}
                            onChange={(event: React.ChangeEvent<{ value: string }>) => {
                                handleMarketPairChange(event)
                            }}
                            inputProps={{IconComponent: DropDownIcon}}
                        >{filteredAmmViewMap.map(market => <MenuItem key={market} value={market}>{market}</MenuItem>)}
                    </StyledTextFiled>
                </SelectWrapperStyled>
                <Typography variant={'h2'} textAlign={'center'} marginTop={1} marginBottom={0}>
                    · {t('labelTradeRaceRanking')} ·
                </Typography>
                <Box lineHeight={'24px'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Typography fontSize={16} marginRight={2}>
                        {t('labelTradeRaceYourVolume')}: {volume || '--'}
                    </Typography>
                    <Typography fontSize={16}>
                        {t('labelTradeRaceYourRanking')}: {rank || '--'}
                    </Typography >
                    <Button style={{ fontSize: 16 }} variant={'text'} onClick={() => history.push(`/trade/lite/${currMarketPair}`)}>{t('labelTradeRaceGoTrading')} &gt;&gt;</Button>
                </Box>
                <TradeRaceTable {...{t, rawData: currPairRankData}} />
            </TableWrapperStyled>
            <ProjectWrapperStyled>
                <Typography marginBottom={1} variant={'h4'}>Rewards</Typography>
                <Box width={'50%'} minWidth={600}>
                    <TradeRacePanel rawData={rawData} />
                </Box>
            </ProjectWrapperStyled>
            <ProjectWrapperStyled marginTop={2}>
                <Typography marginBottom={2} variant={'h4'}>Activity Rules</Typography>
                <RulesStyled>
                1. {t('labelTradeRaceRulesOne')}
                </RulesStyled>
                <RulesStyled>
                2. {t('labelTradeRaceRulesTwo')}
                </RulesStyled>
                <RulesStyled>
                3. {t('labelTradeRaceRulesThree')}
                </RulesStyled>
                <RulesStyled>
                4. {t('labelTradeRaceRulesFour')}
                </RulesStyled>
                <RulesStyled>
                5. {t('labelTradeRaceRulesFive')}
                </RulesStyled>
            </ProjectWrapperStyled>
        </LayoutStyled>
    )
})

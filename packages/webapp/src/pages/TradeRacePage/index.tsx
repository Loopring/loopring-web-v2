import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { Box, Typography, MenuItem } from '@mui/material'
import styled from '@emotion/styled'
import { TradeRaceTable } from '@loopring-web/component-lib/src/components/tableList'
import { Button, TextField, TradeRacePanel } from '@loopring-web/component-lib'
import { DropDownIcon, myLog } from '@loopring-web/common-resources'
import { useTradeRace } from './hook'
// import { AmmPoolActivityRule } from '@loopring-web/loopring-sdk'
import { useAmmPool } from '../LiquidityPage/hook'
import { useAmmMiningUI } from '../MiningPage/hook'
import { FAKE_DATA } from './data'


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
    const { volume, rank } = currPairUserRank || {}
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
            <Typography whiteSpace={'pre-line'} textAlign={'center'} marginTop={7} fontSize={60}>{t('labelTradeRaceTitle')}</Typography>
            <Typography marginTop={2} marginBottom={5} variant={'h5'}>Activity Period: 2021/12/23 0:00 AM to 2021/12/30 0:00 AM (UTC)</Typography>
            <TableWrapperStyled>
                <SelectWrapperStyled textAlign={'right'}>
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
                </SelectWrapperStyled>
                <Typography variant={'h2'} textAlign={'center'} marginTop={1} marginBottom={0}>
                    · {t('labelTradeRaceRanking')} ·
                </Typography>
                <Box lineHeight={'24px'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Typography fontSize={16} marginRight={2}>
                        {t('labelTradeRaceYourVolume')}: {volume || 0}
                    </Typography>
                    <Typography fontSize={16}>
                        {t('labelTradeRaceYourRanking')}: {rank || '--'}
                    </Typography >
                    <Button style={{ fontSize: 16 }} variant={'text'} onClick={() => history.push(`/trade/lite/${currMarketPair}`)}>{t('labelTradeRaceGoTrading')} &gt;&gt;</Button>
                </Box>
                <TradeRaceTable {...{t, rawData: currPairRankData /* FAKE_DATA */}} />
            </TableWrapperStyled>
            <ProjectWrapperStyled>
                <Typography marginBottom={1} variant={'h4'}>Rewards</Typography>
                <Box width={'50%'} minWidth={600}>
                    <TradeRacePanel rawData={rawData} />
                </Box>
            </ProjectWrapperStyled>
            <ProjectWrapperStyled>
                <Typography marginBottom={1} variant={'h4'}>Activity Rules</Typography>
                <RulesStyled>
                1. All Loopring L2 or Smart Wallet users that trade the above 6 trading pairs are eligible for the trading competition. We will rank the top 100 addresses in terms of volume (AMM+Orderbook) per pair, and provide them with a total of $600,000 rewards. If you use the Loopring mobile Smart Wallet to trade, your volume will be weighted an extra 50% higher. (i.e., Smart Wallet users will receive a 1.5x multiplier in trading volume)
                </RulesStyled>
                <RulesStyled>
                2. The rewards of the top 25 traders in first 4 flagship pairs will be as follows, 1st place will be rewarded with 10,000 LRC;The users ranked 26-100 will each be rewarded with 100 LRC.
                </RulesStyled>
                <RulesStyled>
                3. For RICE/USDT and MOVD/ETH, the actual size of the reward will scale based on the total reward, but maintain the same function.
e.g. RICE/USDT, the rewards of the top 25 traders will be as follows, 1st place will be rewarded with 8,000 RICE;The users ranked 26-100 will each be rewarded with 80 RICE.
e.g. MOVD/ETH, the rewards of the top 25 traders will be as follows, 1st place will be rewarded with 30,000 MOVD;The users ranked 26-100 will each be rewarded with 300 MOVD.
                </RulesStyled>
                <RulesStyled>
                    4. Rewards will be directly distributed to winners’ Layer 2 accounts before December 31.
                </RulesStyled>
                <RulesStyled>
                    5. Loopring reserves the right of final decision and interpretation of the rules of the swap tournament.
                </RulesStyled>
            </ProjectWrapperStyled>
        </LayoutStyled>
    )
})

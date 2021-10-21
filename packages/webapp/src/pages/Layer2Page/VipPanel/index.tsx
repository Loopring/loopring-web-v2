import styled from '@emotion/styled';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { useAccount } from 'stores/account';
import { LoopringAPI } from '../../../api_wrapper';
import { SoursURL } from '@loopring-web/common-resources';
import { VipPanel as VipView } from '@loopring-web/component-lib'

const StylePaper = styled(Grid)`
  width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`

const rawData = [
    {
        level: 'VIP 0',
        tradeVolume: '< 75 ETH',
        rule: 'or',
        balance: '>= 0 LRC',
        maker: '-0.02%',
        taker: '0.3%'
    },
    {
        level: 'VIP 1',
        tradeVolume: '>= 75 ETH',
        rule: 'or',
        balance: '>= 25,000 LRC',
        maker: '-0.02%',
        taker: '0.25%'
    },
    {
        level: 'VIP 2',
        tradeVolume: '>= 750 ETH',
        rule: 'and',
        balance: '>= 50,000 LRC',
        maker: '-0.02%',
        taker: '0.2%'
    },
    {
        level: 'VIP 3',
        tradeVolume: '>= 3750 ETH',
        rule: 'and',
        balance: '>= 125,000 LRC',
        maker: '-0.02%',
        taker: '0.15%'
    },
    {
        level: 'VIP 4',
        tradeVolume: '>= 7500 ETH',
        rule: 'and',
        balance: '>= 250,000 LRC',
        maker: '-0.02%',
        taker: '0.1%'
    },
];



export const VipPanel = withTranslation(['common', 'layout'])(({t}: & WithTranslation) => {
    const {account: {level}} = useAccount()

    const [vipTable, setVipTable] = React.useState<string[][]>([]);
    const [userFee, setUserFee] = React.useState<{
        maker: string,
        taker: string
    }>({
        maker: '0',
        taker: '0.0025%'
    })

    const getImagePath = React.useMemo(() => {
        const path = SoursURL + `images/vips/${level.toUpperCase().replace('_', '')}`
        return <img alt="VIP" style={{verticalAlign: 'text-bottom', width: '32px', height: '16px'}}
                    src={`${path}.webp`}
            // srcSet={`${path}.webp 1x, ${path}.png 1x`}
        />
        // <>
        //     <picture>
        //     <source srcSet={path+'.webp'} type="image/webp"/>
        //     <source srcSet={path+'.png'} />
        //     <img alt="VIP" style={{verticalAlign: 'text-bottom', width: '32px', height: '16px'}}
        //          src={'https://static.loopring.io/assets/images/vips/VIP4.png'}/>
        // </picture>
        //
        // </>
    }, [level])
    const result = React.useCallback(async () => {
        if (LoopringAPI.exchangeAPI) {
            const {
                // orderbookTradingFeesStablecoin,
                orderbookTradingFees,
                // ammTradingFees,
                // otherFees,
            } = await LoopringAPI.exchangeAPI.getExchangeFeeInfo();
            // debugger
            // if() {
            //     level = 'vip_4'
            // }
            const _level = level === 'super_vip' ? 'vip_4' : level === '' ? 'default' : level;
            if (orderbookTradingFees[ _level ]) {
                setUserFee({
                    maker: (orderbookTradingFees[ _level ].makerRate / 10000).toString() + '%',
                    taker: (orderbookTradingFees[ _level ].takerRate / 10000).toString() + '%',
                })
            }


            // orderbookTradingFeesStablecoin: VipFeeRateInfoMap;
            // orderbookTradingFees: VipFeeRateInfoMap;
            // ammTradingFees: VipFeeRateInfoMap;
            // otherFees: {
            //     [key: string]: string;
            // };
            // raw_data: any;
            // raw_data.
            //setVipTable(raw_data)
        }

        // setUserFee(userFee)


    },[setVipTable,level])
    React.useEffect(()=>{
        result()
    },[])

    return <>
        <StylePaper flex={1} container className={'MuiPaper-elevation2'} padding={4} marginBottom={1}>
            <Grid item xs={12}>
                <Typography variant={'h5'} component={'h3'} marginY={1} display={'flex'} flexDirection={'column'}>
                    <Typography component={'p'} flexDirection={'row'} display={'flex'} alignSelf={'flex-start'}>
                        <Typography component={'h3'} variant={'h4'} color={'text.primary'} paddingRight={1}>
                            {t('labelTradeFeeLevel')}
                        </Typography>

                        {/*{getImagePath}*/}
                        {/*<VipStyled component={'span'} variant={'body2'} > {'VIP 1'} </VipStyled>*/}
                        <Typography variant={'body1'} component={'span'} display={'flex'} flexDirection={'row'}
                                    alignItems={'center'}>
                            <Typography component={'span'} variant={'body1'}>
                                {level ? getImagePath : 'Basic'}
                            </Typography>
                        </Typography>
                    </Typography>
                    <Typography variant={'h5'} component={'p'} color={'var(--color-text-secondary)'} marginTop={2}>
                        Upgrade to VIP 1 by either trading {10} ETH on our spot exchange and/or increase your LRC holdings by {100} LRC
                    </Typography>
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Grid container>
                    <Grid item xs={6}>
                        <Typography fontWeight={400} variant={'h6'} component={'p'} color={'var(--color-text-secondary)'}>
                            Spot Trade Volume (30d in ETH)
                        </Typography>
                        <Typography variant={'h4'} component={'p'} marginTop={0.5}>
                            Currently {} ETH
                        </Typography>

                    </Grid>
                    <Grid item xs={6}>
                        <Typography fontWeight={400} variant={'h6'} component={'p'} color={'var(--color-text-secondary)'}>
                            LRC Balance
                        </Typography>
                        <Typography variant={'h4'} component={'p'} marginTop={0.5}>
                            Currently {} LRC
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h6'} component={'p'} fontWeight={400} color={'var(--color-text-secondary)'}>
                    The cumulative 30-day trading volume ( in ETH ) and 24-hour LRC balance are updated at 0:00 (UTC+0) each day. After the update, you can access the corresponding fee discount in the table below.
                </Typography>
            </Grid>
            {/* <Grid item xs={6} justifyContent={'flex-end'} display={'flex'}>
                <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} justifyContent={'flex-end'} marginRight={6}>
                    <Typography component={'h5'} variant={'h5'} color={'text.secondary'}>{t('labelMaker')}</Typography>
                    <Typography component={'p'} variant={'h3'} color={'text.primary'} marginTop={1/2}>{userFee.maker}</Typography>
                </Box>
            </Grid>
            <Grid item xs={6} justifyContent={'flex-start'} display={'flex'} >
                <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} marginLeft={6} >
                    <Typography component={'h5'} variant={'h5'}
                                color={'text.secondary'}> {t('labelTaker')}  </Typography>
                    <Typography component={'p'} variant={'h3'} color={'text.primary'}  marginTop={1/2}>{userFee.taker}</Typography>
                </Box>
            </Grid> */}

        </StylePaper>

        <StylePaper container className={'MuiPaper-elevation2'} marginTop={1} padding={4} marginBottom={2}>
            <Grid item xs={12}>
                {/* <Trans i18nKey={''}>
                    <Typography component={'p'} variant={'body1'} color={'text.secondary'}>Loopring Exchange charges
                        different fees for each type of service. Each service has a base fee and a proportional fee. For
                        proportional fees, there is also a minimum proportional fee setting for each service. The actual
                        fee calculation formula is: basic fee + max (minimum proportional fee, proportional fee *
                        amount).</Typography>
                    <br/>
                    <Typography component={'p'} variant={'body1'} color={'text.secondary'}>The basic fee and the minimum
                        proportional fee are the same for all users. VIPs enjoy different proportional fee
                        discounts.</Typography>
                </Trans> */}
                {/* <Box marginTop={2} flex={1}> */}
                <Typography component={'h3'} variant={'h4'} color={'text.secondary'}>Fee List</Typography>
                <Box marginTop={3} flex={1}>
                    <VipView rawData={rawData}/>
                </Box>
                
                    {/* <Typography component={'h6'} variant={'h1'} padding={3} textAlign={'center'}>
                        Coming soon
                    </Typography> */}
                {/* </Box> */}
            </Grid>

        </StylePaper>
    </>
})

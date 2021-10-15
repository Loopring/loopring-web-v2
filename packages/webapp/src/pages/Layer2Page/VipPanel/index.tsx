import styled from '@emotion/styled';
import { Box, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { VipPanel as VipView } from '@loopring-web/component-lib';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { useAccount } from '../../../stores/account';
import { LoopringAPI } from '../../../api_wrapper';
import { VipFeeRateInfoMap } from 'loopring-sdk/dist/defs/loopring_defs';
import { SoursURL } from '@loopring-web/common-resources';

const StylePaper = styled(Grid)`
  width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`



const vipDefault: string[][] = [
    ['VIP 0', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 1', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 2', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 3', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 4', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
];
export const VipPanel = withTranslation(['common', 'layout'])(({t}: & WithTranslation) => {
    const {account: {level}} = useAccount()
    const getImagePath = React.useCallback(() => {
        const path = SoursURL + `images/vips/${level.toUpperCase().replace('_','')}.png`
        return path
    }, [level])
    const [vipTable,setVipTable] =React.useState<string[][]>(vipDefault);
    const [userFee,setUserFee] =React.useState<{
        maker: string,
        taker: string
    }>({
        maker: '0',
        taker: '0.0025%'
    })
    const result = React.useCallback(async ()=>{
        if(LoopringAPI.exchangeAPI){
            const {orderbookTradingFeesStablecoin,
                orderbookTradingFees,
                ammTradingFees,
                otherFees,
            } = await LoopringAPI.exchangeAPI.getExchangeFeeInfo();
            // debugger
            // if() {
            //     level = 'vip_4'
            // }
            const  _level = level === 'super_vip'?'vip_4':level === ''? 'default': level;
            if(orderbookTradingFees[_level]){
                setUserFee({
                    maker: (orderbookTradingFees[_level].makerRate/10000).toString()+'%' ,
                    taker: (orderbookTradingFees[_level].takerRate/10000).toString()+'%' ,
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
        <StylePaper container className={'MuiPaper-elevation2'} padding={4} marginBottom={1}>
            <Grid item xs={12}>
                <Typography variant={'h5'} component={'h3'} marginY={1} display={'flex'} flexDirection={'row'}
                            alignItems={'center'} justifyContent={'space-between'}>
                    <Typography component={'p'} flexDirection={'row'} display={'flex'} alignSelf={'flex-end'}>
                        <Typography component={'h3'} variant={'h4'} color={'text.secondary'} paddingRight={1}>
                            {t('labelTradeFeeLevel')}
                        </Typography>
                        {/*{getImagePath}*/}
                        {/*<VipStyled component={'span'} variant={'body2'} > {'VIP 1'} </VipStyled>*/}
                        <Typography variant={'body1'} component={'span'} display={'flex'} flexDirection={'row'}
                                    alignItems={'center'} paddingRight={1}>
                            <Typography component={'span'} variant={'body1'}>
                                {level ?
                                    <img alt="VIP" style={{verticalAlign: 'text-bottom', width: '32px', height: '16px'}}
                                         src={getImagePath()}/> : 'Basic'}
                            </Typography>
                        </Typography>
                    </Typography>
                </Typography>
            </Grid>

            <Grid item xs={6} justifyContent={'flex-end'} display={'flex'}>
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
            </Grid>

        </StylePaper>
        <StylePaper flex={1} container className={'MuiPaper-elevation2'} marginY={1} padding={4} >
            <Grid item xs={12}>
                <Typography component={'h3'} variant={'h4'} color={'text.secondary'}>Fee List</Typography>
                <Box marginTop={2} flex={1}>
                    {/*<VipView rawData={vipTable}/>*/}
                    <Typography component={'h6'} variant={'h1'} padding={3} textAlign={'center'}>
                        Coming soon
                    </Typography>
                </Box>
            </Grid>
            {/*<Grid item xs={12} marginTop={2} flex={1}>*/}
            {/*   */}
            {/*</Grid>*/}

        </StylePaper>
        <StylePaper container className={'MuiPaper-elevation2'} marginTop={1} padding={4} marginBottom={2}>
            <Grid item xs={12}>
                <Trans i18nKey={''}>
                    <Typography component={'p'} variant={'body1'} color={'text.secondary'}>Loopring Exchange charges
                        different fees for each type of service. Each service has a base fee and a proportional fee. For
                        proportional fees, there is also a minimum proportional fee setting for each service. The actual
                        fee calculation formula is: basic fee + max (minimum proportional fee, proportional fee *
                        amount).</Typography>
                    <br/>
                    <Typography component={'p'} variant={'body1'} color={'text.secondary'}>The basic fee and the minimum
                        proportional fee are the same for all users. VIPs enjoy different proportional fee
                        discounts.</Typography>
                </Trans>
            </Grid>

        </StylePaper>
    </>
})

import { Avatar, Box, Card, CardActions, CardContent, Divider } from '@material-ui/core';
import { Typography } from '@material-ui/core/';
import {  Button } from '../';
import React from 'react';
import moment from 'moment';
import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AmmCardProps,
    AvatarCoinStyled,
    Currency,
    EmptyValueTag,
    getThousandFormattedNumbers,
    PriceTag
} from '@loopring-web/common-resources';
import { useSettings } from '../../stores';
import styled from '@emotion/styled';

// const BoxStyled = styled(Card)`
//
// `

const BoxStyled = styled(Box)`
` as typeof Box
// const BoxBg = styled(Box)`
//   ${({theme}) => boxLiner({theme})}
//   ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1 / 2})};
// ` as typeof Box

const DetailWrapperStyled = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({theme}) => theme.unit}px;
`

const DividerWrapperStyled = styled(Box)``

export const AmmCard = withTranslation('common', {withRef: true})(
    React.memo(React.forwardRef(<T extends { [ key: string ]: any }>(
        {
            t,
            coinAInfo,
            coinBInfo,
            amountDollar,
            amountYuan,
            // isNew,
            APY,
            activity: {duration, myRewards, rewardToken, isPass},
            handleClick,
            ...rest
        }: AmmCardProps<T> & WithTranslation, ref: React.ForwardedRef<any>) => {
        const { rewardValue, rewardValue2 } = rest
        // const coinAIconHasLoaded = useImage(coinAInfo?.icon ? coinAInfo?.icon : '').hasLoaded;
        // const coinBIconHasLoaded = useImage(coinBInfo?.icon ? coinBInfo?.icon : '').hasLoaded;
        const {coinJson} = useSettings();
        const coinAIcon: any = coinJson[ coinAInfo.simpleName ];
        const coinBIcon: any = coinJson[ coinBInfo.simpleName ];
        const pair = `${coinAInfo.simpleName} / ${coinBInfo.simpleName}`
        const {currency} = useSettings();

        return <Card ref={ref}>
            <CardContent>
                <BoxStyled display={'flex'} flexDirection={'row'} justifyContent={'space-between'}
                           alignItems={'center'}>
                    <Typography variant={'h3'} component={'span'} color={'textPrimary'} fontFamily={'Roboto'}>
                        {pair}
                    </Typography>
                    <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'} marginRight={-1}>
                        <Box className={'logo-icon'} height={'var(--chart-title-coin-size)'} position={'relative'}
                             zIndex={20}
                             width={'var(--chart-title-coin-size)'} alignItems={'center'} justifyContent={'center'}>
                            {coinAIcon ?
                                <AvatarCoinStyled imgx={coinAIcon.x} imgy={coinAIcon.y}
                                                  imgheight={coinAIcon.height}
                                                  imgwidth={coinAIcon.width} size={28}
                                                  variant="circular" alt={coinAInfo?.simpleName as string}
                                    // src={sellData?.icon}
                                                  src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                                : <Avatar variant="circular" alt={coinAInfo?.simpleName as string} style={{
                                    height: 'var(--chart-title-coin-size)',
                                    width: 'var(--chart-title-coin-size)'
                                }}
                                    // src={sellData?.icon}
                                          src={'static/images/icon-default.png'}/>
                            }</Box>

                        <Box className={'logo-icon'} height={'var(--chart-title-coin-size)'} position={'relative'}
                             zIndex={18} left={-8}
                             width={'var(--chart-title-coin-size)'} alignItems={'center'}
                             justifyContent={'center'}>{coinBIcon ?
                            <AvatarCoinStyled imgx={coinBIcon.x} imgy={coinBIcon.y} imgheight={coinBIcon.height}
                                              imgwidth={coinBIcon.width} size={28}
                                              variant="circular" alt={coinBInfo?.simpleName as string}
                                // src={sellData?.icon}
                                              src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                            : <Avatar variant="circular" alt={coinBInfo?.simpleName as string} style={{
                                height: 'var(--chart-title-coin-size)',
                                width: 'var(--chart-title-coin-size)'
                            }}
                                // src={sellData?.icon}
                                      src={'static/images/icon-default.png'}/>} </Box>
                        {/* <Typography display={'flex'} flexDirection={'column'} marginLeft={1} component={'div'}>
                            <Typography variant={'body1'} component={'h3'} color={'textPrimary'} title={'sell'}>
                                <Typography component={'span'} className={'next-coin'}>
                                    {coinAInfo?.simpleName}
                                </Typography>
                                <Typography component={'i'}>/</Typography>
                                <Typography component={'span'} title={'buy'}>
                                    {coinBInfo?.simpleName}
                                </Typography>
                            </Typography>
                            <Typography variant={'body2'} component={'span'} color={'textSecondary'}>
                                {t('labelLiquidity') + ' ' +
                                amountDollar === undefined ? EmptyValueTag : currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(amountDollar as number)
                                    : PriceTag.Yuan + getThousandFormattedNumbers(amountYuan as number)}
                            </Typography>
                        </Typography> */}
                        {/*{isNew ? <NewTagIcon/> : undefined}*/}
                    </Box>
                </BoxStyled>
                <Typography display={'flex'} flexDirection={'column'} component={'span'} justifyContent={'center'} alignItems={'center'} marginTop={7}>
                    <Typography component={'span'} variant={'h1'} fontFamily={'Roboto'}> {APY || EmptyValueTag}%
                    </Typography>
                    <Typography component={'span'} color={'textPrimary'} variant={'h6'} marginTop={1}
                                style={{textTransform: 'uppercase'}}>{t('labelAPY')}</Typography>
                </Typography>

                <DividerWrapperStyled marginTop={3} marginBottom={2}>
                    <Divider />
                </DividerWrapperStyled>

                <DetailWrapperStyled>
                    <Typography component={'span'} color={'textSecondary'} variant={'h6'}>
                        {t('labelMiningActiveDate')}
                    </Typography>
                    <Typography component={'span'} color={'textPrimary'} variant={'h6'}>
                        {' ' + moment(duration.from).format('YYYY/MM/DD')} - {moment(duration.to).format('MM/DD')}
                    </Typography>
                </DetailWrapperStyled>


                <DetailWrapperStyled>
                    <Typography component={'span'} color={'textSecondary'} variant={'h6'}>
                        {t('labelMiningLiquidity')}
                    </Typography>
                    <Typography component={'span'} color={'textPrimary'} variant={'h6'}>
                        {t('labelLiquidity') + ' ' +
                                amountDollar === undefined ? EmptyValueTag : currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(amountDollar as number)
                                    : PriceTag.Yuan + getThousandFormattedNumbers(amountYuan as number)}
                    </Typography>
                </DetailWrapperStyled>


                <DetailWrapperStyled>
                    <Typography component={'span'} color={'textSecondary'} variant={'h6'}>
                        {t('labelMiningActivityReward')}
                    </Typography>
                    <Typography component={'span'} color={'textPrimary'} variant={'h6'}>
                        ${getThousandFormattedNumbers((rewardValue && Number.isFinite(rewardValue) ? rewardValue : 0) + (rewardValue2 && Number.isFinite(rewardValue2) ? rewardValue2 : 0))}
                    </Typography>
                </DetailWrapperStyled>


                <DetailWrapperStyled>
                    <Typography component={'span'} color={'textSecondary'} variant={'h6'}>
                        {t('labelMiningMyShare')}
                    </Typography>
                    <Typography component={'span'} color={'textPrimary'} variant={'h6'}>
                        $300
                    </Typography>
                </DetailWrapperStyled>


                <DetailWrapperStyled>
                    <Typography component={'span'} color={'textSecondary'} variant={'h6'}>
                        {t('labelMiningMyReward')}
                    </Typography>
                    <Typography component={'span'} color={'textPrimary'} variant={'h6'}>
                        {myRewards === 0
                            ? EmptyValueTag
                            : getThousandFormattedNumbers(myRewards, 6)}
                        {' ' + rewardToken?.simpleName}
                    </Typography>
                </DetailWrapperStyled>


                {/* <BoxBg display={'flex'} flexDirection={'column'} alignItems={'stretch'} marginTop={2} padding={1}>
                    <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                        <Typography display={'flex'} flexDirection={'column'} component={'div'}>
                            <Typography variant={'body2'} component={'h5'} color={'textSecondary'}>
                                {t('labelReward')}
                            </Typography>
                            <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                                {getThousandFormattedNumbers(totalRewards, 2)}
                                {' ' + rewardToken?.simpleName}
                            </Typography>
                        </Typography>
                        <Typography display={'flex'} flexDirection={'column'} alignItems={'flex-end'} component={'div'}>
                            <Typography variant={'body2'} component={'h5'} color={'textSecondary'}>
                                {t('labelMyReward')}
                            </Typography>
                            <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                                {myRewards==0?EmptyValueTag:getThousandFormattedNumbers(myRewards, 6)}
                                {' ' + rewardToken?.simpleName}
                            </Typography>
                        </Typography>
                    </Box>
                    <Typography alignSelf={'flex-start'} variant={'body2'} color={'textSecondary'} component="span"
                                marginTop={1}>
                        {t('labelDate')}:
                        {' ' + moment(duration.from).format('L')} - {moment(duration.to).format('L')}
                    </Typography>
                </BoxBg> */}
            </CardContent>
            <CardActions>
                <Button fullWidth variant={'contained'} size={'medium'} disabled={!!isPass}
                        color={'primary'}
                        onClick={handleClick}>{t(isPass ? 'labelEndLiquidityBtn' : 'labelAddLiquidityBtn')}</Button>
            </CardActions>
        </Card>
    }))) as <T>(props: AmmCardProps<T> & React.RefAttributes<any>) => JSX.Element;

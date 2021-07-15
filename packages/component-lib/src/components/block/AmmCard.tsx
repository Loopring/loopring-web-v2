import { Avatar, Box, Card, CardActions, CardContent } from '@material-ui/core';
import { Typography } from '@material-ui/core/';
import { AvatarIconPair, Button, useImage } from '../';
import React from 'react';
import moment from 'moment';
import { WithTranslation, withTranslation } from 'react-i18next';
import { AmmCardProps, Currency, EmptyValueTag, getThousandFormattedNumbers, PriceTag } from 'static-resource';
import { useSettings } from '../../stores';
import styled from '@emotion/styled';

// const BoxStyled = styled(Card)`
//
// `

const BoxStyled = styled(Box)`
  ${({theme}) => AvatarIconPair({theme})}
` as typeof Box
const BoxBg = styled(Box)`
  background-color: ${({theme}) => theme.colorBase.background().outline};
  ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1 / 2})};
` as typeof Box


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
            activity: {duration, totalRewards, myRewards, rewardToken, isPass},
            handleClick,
            // ...rest
        }: AmmCardProps<T> & WithTranslation, ref: React.ForwardedRef<any>) => {

        const coinAIconHasLoaded = useImage(coinAInfo?.icon ? coinAInfo?.icon : '').hasLoaded;
        const coinBIconHasLoaded = useImage(coinBInfo?.icon ? coinBInfo?.icon : '').hasLoaded;
        const {currency} = useSettings();

        return <Card ref={ref}>
            <CardContent>
                <BoxStyled display={'flex'} flexDirection={'row'} justifyContent={'space-between'}
                           alignItems={'center'}>
                    <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                        <Avatar variant="square" alt={coinAInfo?.simpleName}
                            // src={sellData?.icon}
                                src={coinAIconHasLoaded ? coinAInfo?.icon : 'static/images/icon-default.png'}/>
                        <Avatar variant="square" alt={coinBInfo?.simpleName} className={'icon-next'}
                            // src={buyData?.icon}
                                src={coinBIconHasLoaded ? coinBInfo?.icon : 'static/images/icon-default.png'}/>

                        <Typography display={'flex'} flexDirection={'column'} marginLeft={1} component={'div'}>
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
                        </Typography>
                        {/*{isNew ? <NewTagIcon/> : undefined}*/}
                    </Box>
                    <Typography display={'flex'} flexDirection={'column'} component={'span'} alignItems={'flex-end'}>
                        <Typography component={'span'} color={'textSecondary'} variant={'body2'}
                                    style={{textTransform: 'uppercase'}}>{t('labelAPY')}</Typography>
                        <Typography component={'span'} variant={'body1'}> {APY}%
                        </Typography>
                    </Typography>
                </BoxStyled>

                <BoxBg display={'flex'} flexDirection={'column'} alignItems={'stretch'} marginTop={2} padding={1}>
                    <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                        <Typography display={'flex'} flexDirection={'column'} component={'div'}>
                            <Typography variant={'body2'} component={'h5'} color={'textSecondary'}>
                                {t('labelReward')}
                            </Typography>
                            <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                                {getThousandFormattedNumbers(totalRewards, 2)}
                                {rewardToken?.simpleName}
                            </Typography>
                        </Typography>
                        <Typography display={'flex'} flexDirection={'column'} alignItems={'flex-end'} component={'div'}>
                            <Typography variant={'body2'} component={'h5'} color={'textSecondary'}>
                                {t('labelMyReward')}
                            </Typography>
                            <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                                {getThousandFormattedNumbers(myRewards, 6)}
                                {rewardToken?.simpleName}
                            </Typography>
                        </Typography>
                    </Box>
                    <Typography alignSelf={'flex-start'} variant={'body2'} color={'textSecondary'} component="span"
                                marginTop={1}>
                        {t('labelDate')}:
                        {moment(duration.from).format('L')} - {moment(duration.to).format('L')}
                    </Typography>
                </BoxBg>
            </CardContent>
            <CardActions>
                <Button fullWidth variant={'contained'} size={'medium'} disabled={isPass ? true : false}
                        color={'primary'} onClick={handleClick}>{t('labelAddLiquidityBtn')}</Button>
            </CardActions>
        </Card>
    }))) as <T>(props: AmmCardProps<T> & React.RefAttributes<any>) => JSX.Element;

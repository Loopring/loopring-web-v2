import { IBData } from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../Interface';
import { Trans, WithTranslation } from 'react-i18next';
import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Button } from '../../basic-lib';
import { ResetViewProps } from './Interface';
import { BasicACoinTrade } from './BasicACoinTrade';
import { TypographyStrong } from '../../../index';


export const ResetWrap = <T extends IBData<I>,
    I>({
           t, disabled, walletMap, tradeData, coinMap,
           //  onTransferClick,
           resetBtnStatus,
           onResetClick,
           fee,
           ...rest
       }: ResetViewProps<T, I> & WithTranslation) => {
    const inputBtnRef = React.useRef();
    const getDisabled = () => {
        if (disabled || tradeData === undefined || walletMap === undefined || coinMap === undefined) {
            return true
        } else {
            return false
        }
    };
    const inputButtonDefaultProps = {
        label: t('restLabelEnterToken'),
    }
    return <Grid className={walletMap ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item>
            <Typography component={'h4'} height={36} textAlign={'center'} variant={'h2'} marginBottom={2}>
                {t('resetTitle')}
            </Typography>
            <Typography component={'p'} variant="body1">
                <Trans i18nKey="resetDescription">
                    Create a new signing key for layer-2 authentication (no backup needed). This will
                    <TypographyStrong component={'span'}>cancel all your pending orders</TypographyStrong>.
                </Trans>
            </Typography>

        </Grid>
        <Grid item marginTop={2}>
            <Typography component={'p'} variant="body1" height={20}>
                {t('resetFee', {count: fee?.count, price: fee?.price})}
            </Typography>
        </Grid>
        <Grid item marginTop={2} alignSelf={"stretch"}>
            <BasicACoinTrade {...{
                ...rest,
                t,
                disabled,
                walletMap,
                tradeData,
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef: inputBtnRef,
            }} />
        </Grid>
        <Grid item marginTop={2} alignSelf={"center"}>
            <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                onResetClick(tradeData)
            }}
                    style={{width: '200px'}}
                    loading={!getDisabled() && resetBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || resetBtnStatus === TradeBtnStatus.DISABLED || resetBtnStatus === TradeBtnStatus.LOADING ? true : false}
            >{t(`resetLabelBtn`)}
            </Button>
        </Grid>
    </Grid>
}




import { IBData } from 'static-resource';
import { TradeBtnStatus } from '../../Interface';
import { Trans, WithTranslation } from 'react-i18next';
import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Button } from '../../../../index';
import { DepositViewProps } from '../Interface';
import { BasicACoinTrade } from './BasicACoinTrade';
import { TypographyGood } from '../Styled';


//SelectReceiveCoin
export const DepositWrap = <T extends IBData<I>,
    I>({
           t, disabled, walletMap, tradeData, coinMap,
           //  onTransferClick,
           title, description,
           depositBtnStatus,
           onDepositClick,
           ...rest
       }: DepositViewProps<T, I> & WithTranslation) => {
    const inputBtnRef = React.useRef();
    const getDisabled = () => {
        if (disabled || tradeData === undefined || walletMap === undefined || coinMap === undefined) {
            return true
        } else {
            return false
        }
    };
    const inputButtonDefaultProps = {
        label: t('depositLabelEnterToken'),
    }
    return <Grid className={walletMap ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item>
            <Typography component={'h4'} height={36} textAlign={'center'} variant={'h4'}>
                {title ? title : t('depositTitle')}
            </Typography>
            <Typography component={'p'} variant="body1">
                <Trans i18nKey={description ? description : 'depositDescription'}>
                    Once your deposit is <TypographyGood component={'span'}>confirmed on Ethereum</TypographyGood>, it
                    will be added to your balance within <TypographyGood component={'span'}>2 minutes</TypographyGood>.
                </Trans>
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
        <Grid item marginTop={2} alignSelf={'center'}>
            <Button variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                onDepositClick(tradeData)
            }}
                    style={{width: '200px'}}
                    loading={!getDisabled() && depositBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || depositBtnStatus === TradeBtnStatus.DISABLED || depositBtnStatus === TradeBtnStatus.LOADING ? true : false}
            >{t(`depositLabelBtn`)}
            </Button>

        </Grid>
    </Grid>
}


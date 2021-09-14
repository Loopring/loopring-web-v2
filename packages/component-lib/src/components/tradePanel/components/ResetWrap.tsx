import { IBData } from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../Interface';
import { Trans, WithTranslation } from 'react-i18next';
import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Button } from '../../basic-lib';
import { ResetViewProps } from './Interface';
import { TypographyStrong } from '../../../index';

export const ResetWrap = <T extends object>({
           t,
           resetBtnStatus,
           onResetClick,
           chargeFeeToken,
           chargeFeeTokenList,
       }: ResetViewProps<T> & WithTranslation) => {
    const inputBtnRef = React.useRef();

    const inputButtonDefaultProps = {
        label: t('restLabelEnterToken'),
    }

    const getDisabled = React.useCallback(() => {
        return false
    }, [])

    return <Grid className={''} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item>
            <Typography component={'h4'} textAlign={'center'} variant={'h3'} marginBottom={2}>
                {t('resetTitle')}
            </Typography>
            <Typography component={'p'} variant="body1">
                <Trans i18nKey="resetDescription">
                    Create a new signing key for layer-2 authentication (no backup needed). This will
                    <TypographyStrong component={'span'}>cancel all your pending orders</TypographyStrong>.
                </Trans>
            </Typography>
        </Grid>

        <Grid item marginTop={2} alignSelf={"center"}>
            <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                if (onResetClick) {
                    onResetClick()
                }
            }}
                    style={{width: '200px'}}
                    loading={!getDisabled() && resetBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || resetBtnStatus === TradeBtnStatus.DISABLED || resetBtnStatus === TradeBtnStatus.LOADING ? true : false}
            >{t(`resetLabelBtn`)}
            </Button>
        </Grid>
    </Grid>
}




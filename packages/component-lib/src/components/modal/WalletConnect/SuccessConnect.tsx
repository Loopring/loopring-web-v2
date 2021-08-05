import { Box, Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import { CheckedIcon } from '@loopring-web/common-resources';
import { useTheme } from '@emotion/react';

export const SuccessConnect = ({t, providerName}: WithTranslation & { providerName: string }) => {
    const theme = useTheme();
    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}
                flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>
            {t('labelSuccessConnect', {providerName})}
            {/*<Trans i18nKey={'labelSuccessConnect'}>*/}
            {/*    */}
            {/*</Trans>*/}
        </Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <CheckedIcon style={{width: 60, height: 60, color: theme.colorBase.success}}/>
        </Typography>
        <Typography component={'p'} marginTop={2}>
            <Trans i18nKey={'labelSuccessConnectDescribe'}>
                Congratulation, Success Connected!
            </Trans>
        </Typography>

    </Box>


}

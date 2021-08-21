import { Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import { CompletedBasic } from '../ModalPanelBase';
import React from 'react';

export const SuccessConnect = ({
                                   t,
                                   providerName,
                                   onClose,
                                   ...rest
                               }: WithTranslation & { onClose: (e: any) => void, providerName: string }) => {
    // const theme = useTheme();

    const describe = React.useMemo(() => {
        return <>
            <Typography component={'p'} marginTop={2}>
                <Trans i18nKey={'labelSuccessConnectDescribe'}>
                    Congratulation, Success Connected!
                </Trans>
            </Typography>
        </>

    }, [])
    return <CompletedBasic {...{...rest, t}} label={t('labelSuccessConnect', {providerName})} describe={describe}
                           onClose={onClose}/>


}

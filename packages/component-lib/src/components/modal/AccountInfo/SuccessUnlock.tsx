import { Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import React from 'react';
import { CompletedBasic } from '../ModalPanelBase';

export const SuccessUnlock = ({t, providerName,onClose, ...rest}: WithTranslation & { onClose: (e: any) => void, providerName: string }) => {

    const describe = React.useMemo(() => {
        return <>
            <Typography component={'p'} marginTop={2}>
                <Trans i18nKey={'labelSuccessUnlockDescribe'}>
                    Congratulation, Success Connected!
                </Trans>
            </Typography>
        </>
    }, [])
    return <CompletedBasic {...{...rest,t , label:t('labelUnLockLayer2') as any, onClose, describe}}/>
}





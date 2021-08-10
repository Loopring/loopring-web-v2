import { Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
// import { CheckedIcon } from '@loopring-web/common-resources';
// import { useTheme } from '@emotion/react';
// import { Button } from '../../basic-lib';
import { SuccessBasic } from '../SuccessBasic';
import React from 'react';

export const SuccessConnect = ({t, providerName,onClose, ...rest  }: WithTranslation & {onClose:(e:any)=>void, providerName: string }) => {
    // const theme = useTheme();

    const describe = React.useMemo(()=>{
        return    <>
            <Typography component={'p'} marginTop={2}>
                <Trans i18nKey={'labelSuccessConnectDescribe'}>
                    Congratulation, Success Connected!
                </Trans>
            </Typography>
        </>

    },[])
    return   <SuccessBasic {...{...rest,t}} label={t('labelSuccessConnect', {providerName})} describe={describe} onClose={onClose}  />




}

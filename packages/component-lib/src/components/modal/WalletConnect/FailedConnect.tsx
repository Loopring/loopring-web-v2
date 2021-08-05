import { Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import { Link } from '@material-ui/core/';
import { FailedBasic } from '../FailedBasic';
import React from 'react';


export const FailedConnect = ({onRetry,...rest}: { onRetry:(event:any)=>void } & WithTranslation)=>{
    const describe = React.useMemo(()=>{
        return <Typography component={'p'} marginTop={2} >
            <Trans i18nKey={'labelRejectOrError'}>
                Rejected, Please<Link onClick={onRetry}>retry</Link>
            </Trans>
        </Typography>
    },[])
    return  <FailedBasic label={'labelFailedConnect'} onRetry={onRetry} describe={describe} {...rest}/>
}

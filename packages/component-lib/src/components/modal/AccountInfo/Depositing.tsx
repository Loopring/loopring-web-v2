import {  Typography } from '@material-ui/core';
import { LinkIcon } from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import { Link } from '@material-ui/core/';
import React from 'react';
import { CompletedBasic } from '../ModalPanelBase';

export const Depositing = ({
                               t,
                               label,
                               etherscanLink,
                               count = 30,
                               onClose,
                               ...rest
                           }: WithTranslation & {
    onClose: (e: any) => void,
    label?: string,
    etherscanLink: string, count?: number
}) => {
    const describe = React.useMemo(() => {
        return <>
            <Typography color={'textSecondary'} component={'span'}
                        paddingY={1}>{t('labelDepositingProcessing', {count})}</Typography>
            <Link target='_blank' href={etherscanLink} display={'inline-block'} marginTop={1 / 2}>
                <Typography variant={'body2'}> <LinkIcon fontSize={'small'}
                                                         style={{verticalAlign: 'middle'}}/> {'Etherscan'} </Typography>
            </Link>
        </>
    }, [])
    return <CompletedBasic {...{...rest, label:label as any, onClose, describe, t}}/>
}

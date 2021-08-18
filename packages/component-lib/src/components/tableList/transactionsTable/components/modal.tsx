import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next';
import styled from '@emotion/styled'
import { Box } from '@material-ui/core';

export enum TxnDetailStatus {
    processed = 'PROCESSED',
    processing = 'PROCESSING',
    received = 'RECEIVED',
    failed = 'FAILED',
}

export type TxnDetailProps = {
    hash: string;
    status: keyof typeof TxnDetailStatus;
    time: string;
    from: string;
    to: string;
    amount: string;
    fee: string;
    memo?: string;
}

const ContentWrapperStyled = styled(Box)`
    position: relative;
    width: 80%;
    height: 594px;
    background: var(--color-box);
    box-shadow: 0px ${({theme}) => theme.unit / 2}px ${({theme}) => theme.unit / 2}px rgba(0, 0, 0, 0.25);
    border-radius: ${({theme}) => theme.unit}px;
`

const HeaderStyled = styled(Box)`
    position: absolute;
    top: 0;
    z-index: 22;
    width: 100%;
    height: ${({theme}) => theme.unit * 7.5}px;
    box-shadow: 0px ${({theme}) => theme.unit / 4}px ${({theme}) => theme.unit}px rgba(0, 0, 0, 0.25);
    border-radius: ${({theme}) => theme.unit}px ${({theme}) => theme.unit}px 0px 0px;
`

export const TxnDetailPanel = withTranslation('common')((
    {
        t,
        hash,
        status,
        time,
        from,
        to,
        amount,
        fee,
        memo,
        ...rest
    }: TxnDetailProps & WithTranslation) => {
    const content = <ContentWrapperStyled>
        <HeaderStyled>{t('labelTxnDetailHeader')}</HeaderStyled>
        test
        </ContentWrapperStyled>
    return content
})
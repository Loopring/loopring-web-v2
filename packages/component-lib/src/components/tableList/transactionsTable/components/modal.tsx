import { WithTranslation, withTranslation } from 'react-i18next';
import styled from '@emotion/styled'
import { Box, Grid, Typography } from '@material-ui/core';
import moment from 'moment'
import { EmptyValueTag } from '@loopring-web/common-resources';

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
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    min-width: ${({theme}) => theme.unit * 87.5}px;
    height: 60%;
    background-color: var(--color-box);
    box-shadow: 0px ${({theme}) => theme.unit / 2}px ${({theme}) => theme.unit / 2}px rgba(0, 0, 0, 0.25);
    border-radius: ${({theme}) => theme.unit}px;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
`

const HeaderStyled = styled(Box)`
    position: absolute;
    top: 0;
    z-index: 22;
    width: 100%;
    height: ${({theme}) => theme.unit * 7.5}px;
    box-shadow: 0px ${({theme}) => theme.unit / 4}px ${({theme}) => theme.unit}px rgba(0, 0, 0, 0.25);
    border-radius: ${({theme}) => theme.unit}px ${({theme}) => theme.unit}px 0px 0px;
    display: flex;
    align-items: center;
`

const GridContainerStyled = styled(Grid)`
    margin-top: ${({theme}) => theme.unit * 7.5}px;
    flex-direction: column;
    width: auto;
`

const GridItemStyled = styled(Grid)`
    display: flex;
    align-items: baseline;
    margin-bottom: ${({theme}) => theme.unit * 3}px;
`

const TypographyStyled = styled(Typography)`
    color: var(--color-text-secondary);
    width: ${({theme}) => theme.unit * 20}px;
`

const InfoValueStyled = styled(Box)`
    max-width: ${({theme}) => theme.unit * 32}px;
    word-break: break-all;
    font-size: 1.4rem;
    color: ${(props: any) => props.hash ? 'var(--color-secondary)' : 'var(--color-text-primary)'}
` as any

export const TxnDetailPanel = withTranslation('common', { withRef: true })((
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
        const StatusStyled = styled(Typography)`
            color: ${({theme}) => status === 'processed' 
                ? theme.colorBase.success 
                : status === 'processing' 
                    ? theme.colorBase.warning
                    : status === 'failed' 
                        ? theme.colorBase.error
                        : theme.colorBase.secondaryHover }
        `
        return <ContentWrapperStyled>
            <HeaderStyled>
                <Typography variant={'h4'} marginLeft={4}>
                    {t('labelTxnDetailHeader')}
                </Typography>
            </HeaderStyled>
            <GridContainerStyled container flexDirection={'column'}>
                <GridItemStyled item>
                    <TypographyStyled>{t('labelTxnDetailHash')}</TypographyStyled>
                    <InfoValueStyled>{hash}</InfoValueStyled>
                </GridItemStyled>
                <GridItemStyled item>
                    <TypographyStyled>{t('labelTxnDetailStatus')}</TypographyStyled>
                    <StatusStyled>{status.toUpperCase()}</StatusStyled>
                </GridItemStyled>
                <GridItemStyled item>
                    <TypographyStyled>{t('labelTxnDetailTime')}</TypographyStyled>
                    <InfoValueStyled>{moment(time).format('YYYY-MM-DD HH:mm:ss')}</InfoValueStyled>
                </GridItemStyled>
                <GridItemStyled item>
                    <TypographyStyled>{t('labelTxnDetailFrom')}</TypographyStyled>
                    <InfoValueStyled hash={from}>{from || EmptyValueTag}</InfoValueStyled>
                </GridItemStyled>
                <GridItemStyled item>
                    <TypographyStyled>{t('labelTxnDetailTo')}</TypographyStyled>
                    <InfoValueStyled hash={to}>{to || EmptyValueTag}</InfoValueStyled>
                </GridItemStyled>
                <GridItemStyled item>
                    <TypographyStyled>{t('labelTxnDetailAmount')}</TypographyStyled>
                    <InfoValueStyled>{amount}</InfoValueStyled>
                </GridItemStyled>
                <GridItemStyled item>
                    <TypographyStyled>{t('labelTxnDetailFee')}</TypographyStyled>
                    <InfoValueStyled>{fee}</InfoValueStyled>
                </GridItemStyled>
                <GridItemStyled item>
                    <TypographyStyled>{t('labelTxnDetailMemo')}</TypographyStyled>
                    <InfoValueStyled>{memo || EmptyValueTag}</InfoValueStyled>
                </GridItemStyled>
            </GridContainerStyled>
        </ContentWrapperStyled>
    }
)

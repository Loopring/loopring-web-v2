import { Box, Link, Typography } from '@mui/material';
import styled from '@emotion/styled';
import React from 'react';
// import { connectProvides } from '@loopring-web/web3-provider';
import { WithTranslation } from 'react-i18next';
import {
    ChainHashInfos,
    CompleteIcon,
    EmptyIcon,
    getFormattedHash,
    WaitingIcon,
    WarningIcon
} from '@loopring-web/common-resources';

const BoxStyled = styled(Box)`
  background: var(--color-global-bg);
  position: relative;

  &:before {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 1px;
    box-shadow: ${({theme}) => theme.colorBase.shadowHeader};
  }
` as typeof Box

export const DepositRecorder = ({
                                    t,
                                    accAddress,
                                    chainInfos,
                                    etherscanUrl,
                                    // updateDepositHash
                                }: WithTranslation &
    {
        accAddress: string,
        etherscanUrl: string,
        chainInfos: ChainHashInfos,
        // updateDepositHash: (depositHash: string, accountAddress: string, status?: 'success' | 'failed') => void
    }) => {

    const depositView = React.useMemo(() => {
        return <>{
            (chainInfos && chainInfos?.depositHashes && chainInfos?.depositHashes[ accAddress ]) ? <>
                <Typography component={'h6'} variant={'body2'} color={'text.secondary'}
                            paddingBottom={1}>
                    {t('labelDepositHash')}
                </Typography>
                {chainInfos?.depositHashes[ accAddress ].map((txInfo) => {
                    return <Typography key={txInfo.hash} display={'inline-flex'} justifyContent={'space-between'}
                                       fontSize={'h5'} paddingY={1 / 2}>
                        {/*{depoistView}*/}
                        <Link fontSize={'inherit'} textAlign={'center'}
                              onClick={() => window.open(`${etherscanUrl}tx/${txInfo.hash}`)}>
                            {getFormattedHash(txInfo.hash)}
                        </Link>
                        <Typography fontSize={'inherit'} component={'span'}>{
                            txInfo.status === 'pending' ?
                                <WaitingIcon fontSize={'large'}/> : txInfo.status === 'success' ?
                                    <CompleteIcon fontSize={'large'}/> : <WarningIcon fontSize={'large'}/>
                        }</Typography>
                    </Typography>
                })}
            </> : <Typography display={'flex'} flex={1} alignItems={'center'} justifyContent={'center'}
                              flexDirection={'column'}>
                <EmptyIcon htmlColor={'var(--color-text-third)'} style={{height: '42px', width: '42px'}}/>
                <Typography component={'h6'} variant={'body2'} textAlign={'center'} color={'text.secondary'}>
                    {t('labelDepositHash')}
                </Typography>
            </Typography>
        } </>
    }, [chainInfos?.depositHashes[ accAddress ]])


    return <BoxStyled minHeight={80}
                      maxHeight={180}
                      overflow={'scroll'}
                      component={'div'} display={'flex'}
                      paddingX={5}
                      paddingY={1} flex={1}

                      flexDirection={'column'} alignSelf={'flex-end'}>

        {depositView}
    </BoxStyled>


}
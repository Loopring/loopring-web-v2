import { Box, Link, Typography } from '@mui/material';
import styled from '@emotion/styled';
import React from 'react';
// import { connectProvides } from '@loopring-web/web3-provider';
import { WithTranslation } from 'react-i18next';
import {
    AccountHashInfo,
    CompleteIcon,
    // EmptyIcon,
    getFormattedHash, LinkIcon,
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
                                    clear,
                                    // updateDepositHash
                                }: WithTranslation &
    {
        accAddress: string,
        etherscanUrl: string,
        chainInfos: AccountHashInfo,
        clear:()=>void,
        // updateDepositHash: (depositHash: string, accountAddress: string, status?: 'success' | 'failed') => void
    }) => {

    const depositView = React.useMemo(() => {
        return <>{
            (chainInfos && chainInfos?.depositHashes && chainInfos?.depositHashes[ accAddress ] && chainInfos?.depositHashes[ accAddress ].length) ? <>
                <Typography display={'inline-flex'} justifyContent={'space-between'}
                            paddingY={1 / 2} >
                    <Typography component={'h6'} variant={'body2'} color={'text.primary'}
                                paddingBottom={1}>
                        {t('labelDepositHash')}
                    </Typography>
                    <Link  variant={'body2'}
                                paddingBottom={1} onClick={()=> {clear()}}>
                        {t('labelClearAll')}
                    </Link>
                </Typography>
                {chainInfos?.depositHashes[ accAddress ].map((txInfo) => {
                    return <Typography key={txInfo.hash} display={'inline-flex'} justifyContent={'space-between'}
                                       fontSize={'h5'} paddingY={1 / 2} >
                        {/*{depoistView}*/}
                        <Link fontSize={'inherit'} alignItems={'center'}  display={'inline-flex'}
                              onClick={() => window.open(`${etherscanUrl}tx/${txInfo.hash}`)}>
                            {txInfo.symbol ?
                                <Typography component={'span'} color={'text.secondary'}>
                                    {t('labelDepositRecord', {
                                        symbol: txInfo.symbol,
                                        value: txInfo.value
                                    })}  </Typography>
                                : getFormattedHash(txInfo.hash)}
                            <LinkIcon style={{marginLeft:'8px'}}fontSize={'small'}/>
                        </Link>
                        <Typography fontSize={'inherit'} component={'span'}>{
                            txInfo.status === 'pending' ?
                                <WaitingIcon fontSize={'large'}/> : txInfo.status === 'success' ?
                                <CompleteIcon fontSize={'large'}/> : <WarningIcon fontSize={'large'}/>
                        }</Typography>
                    </Typography>
                })}
            </> : <Typography display={'flex'} flex={1}  justifyContent={'center'}
                              flexDirection={'column'}>
                <Typography component={'h6'} variant={'body1'}  color={'text.secondary'}>
                    {t('labelDepositHashEmpty')}
                </Typography>
            </Typography>
        } </>
    }, [chainInfos?.depositHashes[ accAddress ]])


    return <BoxStyled minHeight={60}
                      maxHeight={180}
                      overflow={'scroll'}
                      component={'div'} display={'flex'}
                      paddingX={5}
                      paddingY={1} flex={1}

                      flexDirection={'column'} alignSelf={'flex-end'}>

        {depositView}
    </BoxStyled>


}
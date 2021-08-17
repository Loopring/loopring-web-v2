import { Box, Typography } from '@material-ui/core';
import { LinkIcon, SubmitIcon } from '@loopring-web/common-resources';
import {  WithTranslation } from 'react-i18next';
import { Link } from '@material-ui/core/';
import { Button } from '../../basic-lib';
import { useTheme } from '@emotion/react';

export const Depositing = ({
                               t,
                               label = 'depositTitleAndActive',
                               etherscanLink,
                               count = 30,
                               onClose,
                           }: WithTranslation & {
    onClose: (e: any) => void,
    label?: string,
    etherscanLink: string, count?: number
}) => {
    const theme = useTheme();
    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
                flexDirection={'column'}>
        <Typography component={'h3'} variant={'h3'} marginBottom={3}>
            {t(label)}
        </Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <SubmitIcon style={{width: 60, height: 60, color: theme.colorBase.secondary}}/>
        </Typography>

        <Typography color={'textSecondary'} component={'span'}
                    paddingY={1}>{t('labelDepositingProcessing', {count})}</Typography>
        <Link target='_blank' href={etherscanLink} display={'inline-block'} marginTop={1 / 2}>
            <Typography variant={'body2'}> <LinkIcon fontSize={'small'}
                                                     style={{verticalAlign: 'middle'}}/> {'Etherscan'} </Typography>
        </Link>
        <Box marginTop={2} alignSelf={'stretch'} paddingX={5}>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={onClose}>{t('labelClose')} </Button>
        </Box>
    </Box>
}

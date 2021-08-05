import { Box, Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import React from 'react';

export const SuccessConnect =({t, providerName }:WithTranslation & {providerName:string})=>{
    return   <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
      <Typography component={'h3'} variant={'h2'} marginBottom={3}>
          {t('labelSuccessConnect', {providerName})}
          {/*<Trans i18nKey={'labelSuccessConnect'}>*/}
          {/*    */}
          {/*</Trans>*/}
      </Typography>
      <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
        <img width={60} height={60} src={loadingSvg}
             alt={'loading'} />
        <Typography component={'span'}>{t('labelProcessing')}</Typography>
      </Typography>
      <Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >
          {t('labelMetaMaskProcessDescribe')}
      </Typography>


    </Box>


}

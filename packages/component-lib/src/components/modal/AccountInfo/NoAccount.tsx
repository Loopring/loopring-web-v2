import { AccountBase } from './AccountBase';
import { AccountBaseProps } from './Interface';
import { Box, Typography } from '@material-ui/core/';
import { Button } from '../../../index';
import styled from '@emotion/styled';
import { WithTranslation, withTranslation } from 'react-i18next';

const AnimationArrow = styled(Box)`
  &.arrowCta {
    transform-origin: center;
    display: block;
    height: 12px;
    width: 12px;
    border: 9px solid transparent;
    transform: rotate(45deg) scale(.5);                           
    position: relative;
    //margin: 25vh auto;
  }

  &.arrowCta:after,
  &.arrowCta:before {
    content: "";
    display: block;
    height: inherit;
    width: inherit;
    position: absolute;
    top: 0;
    left: 0;
  }

  &.arrowCta:after {
    border-bottom: 3px solid white;
    border-right: 3px solid white;
    top: 0;
    left: 0;
    opacity: 1;
    animation: bottom-arrow 1.65s infinite;
  }

  @keyframes bottom-arrow {
    0% {
      opacity: 1;
      transform: translate(0, 0);
    }
    45% {
      opacity: 0;
      transform: translate(12px, 12px);
    }
    46% {
      opacity: 0;
      transform: translate(-16px, -16px);
    }
    90% {
      opacity: 1;
      transform: translate(-6px, -6px);
    }
    100% {
      opacity: 1;
      transform: translate(-6px, -6px);
    }
  }

  &.arrowCta:before {
    top: 0;
    left: 0;
    border-bottom: 3px solid white;
    border-right: 3px solid white;
    animation: top-arrow 1.65s infinite;
  }

  @keyframes top-arrow {
    0% {
      transform: translate(-6px, -6px);
    }
    35% {
      transform: translate(0, 0);
    }
    90% {
      opacity: 1;
      transform: translate(0, 0);
    }
    100% {
      opacity: 1;
      transform: translate(0, 0);
    }
  }
` as typeof Box
export const NoAccount =  withTranslation('common')(({goDeposit,t,...props}:WithTranslation & AccountBaseProps & { goDeposit:()=>void }) => {
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
        <AccountBase {...props} t={t}/>
        <Box display={'flex'} marginTop={3} flexDirection={'column'} alignItems={'center'}>
            <Typography variant={'body2'} marginBottom={1}>
                {t('labelActivatedAccountDeposit')}
            </Typography>
            
            <AnimationArrow className={'arrowCta'}/>
        </Box>
        <Box width={120} marginTop={2}>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={() => {
                goDeposit();
            }}>{t('depositLabelBtn')} </Button>
        </Box>

    </Box>

})
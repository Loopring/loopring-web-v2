import styled from '@emotion/styled';
import { IconButton, LinearProgress, linearProgressClasses, Typography } from '@material-ui/core';

export const TypographyStrong = styled(Typography)`
  color: ${({theme}) => theme.colorBase.secondary};
` as typeof Typography
export const TypographyGood = styled(Typography)`
  color: ${({theme}) => theme.colorBase.success};
` as typeof Typography
export const BorderLinearProgress = styled(LinearProgress)(({theme}) => ({
    height: 10,
    borderRadius: 5,
    [ `&.${linearProgressClasses.colorPrimary}` ]: {
        backgroundColor: theme.colorBase.textSecondary, //theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [ `& .${linearProgressClasses.bar}` ]: {
        borderRadius: 5,
        backgroundColor: theme.colorBase.primaryLight,
    },
}));
export const IconClearStyled = styled(IconButton)`
  position: absolute;
  top: 30px;
  right: 4px;
`

export const IconButtonStyled = styled(IconButton)`
  .MuiToolbar-root &.MuiButtonBase-root{
    svg {
      font-size: ${({theme}) => theme.fontDefault.h4};
      height: 24px;
      width: 24px;
    }

    &.outline {
      background-color: ${({theme}) => theme.colorBase.textDisable};
      margin: 0 ${({theme}) => theme.unit / 2}px;
      ${({theme}) => theme.border.defaultFrame({c_key: 'transparent'})};

      &:last-child {
        margin-right: 0;

      }
    }

  }
}
`;
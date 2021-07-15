import { withTranslation, WithTranslation } from "react-i18next";
import styled from "@emotion/styled";
import React from 'react';
import { EmptyIcon } from '@loopring-web/common-resources';
import { Typography } from '@material-ui/core/';


export type EmptyProps = {
    height?: number | string,
    defaultPic?: string | React.ReactElement, //PATH or element
    message: () => React.ElementType<any> | JSX.Element,
}
const EmptyIconStyle = styled(EmptyIcon)`
  && {
    height: var(--empty-size);
    width: var(--empty-size);
  }

  opacity: .3;
  font-size: ${({theme}) => theme.fontDefault.h1};
  color: ${({theme}) => theme.colorBase.textHint};
` as typeof EmptyIcon
const WrapStyled = styled.div<{ height: number | undefined | string }>`
  display: flex;
  flex-direction: column;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  height: ${props => (props.height ? typeof props.height == 'number' ? props.height + 'px' : props.height : `${350 - 35}px`)};

`;
export const EmptyDefault = withTranslation('layout')(({
                                                           t,
                                                           defaultPic = <EmptyIconStyle fontSize={'large'}/>,
                                                           height,
                                                           message
                                                       }: EmptyProps & WithTranslation) => {

    const renderPic = !defaultPic || typeof defaultPic === 'string' ?
        <img src={defaultPic} alt={t('Empty')}/> : defaultPic
    return <WrapStyled height={height}>
        {renderPic}
        <Typography component={'span'} color={'textSecondary'} fontSize={'h6'} marginTop={1}>
            {message()}
        </Typography>
    </WrapStyled>
})






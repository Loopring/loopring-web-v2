import { withTranslation, WithTranslation } from "react-i18next";
import styled from "@emotion/styled";
import React from 'react';


export type EmptyProps = {
    height?: number | string,
    defaultPic?: string | React.ReactElement, //PATH or element
    message: () => React.ElementType<any> | JSX.Element,
}
export const EmptyDefault = withTranslation('layout')(({
                                                           t,
                                                           defaultPic,
                                                           height,
                                                           message
                                                       }: EmptyProps & WithTranslation) => {
    const WrapStyled = styled.div<{ height: number | undefined | string }>`
      display: flex;
      flex-direction: column;
      flex-flow: column wrap;
      justify-content: center;
      align-items: center;
      height: ${props => (props.height ? typeof props.height == 'number' ? props.height + 'px' : props.height : `${350 - 35}px`)};

      .messageWrapper {
        margin-top: 20px;
      }
    `;
    const renderPic = !defaultPic || typeof defaultPic === 'string' ?
        <img src={defaultPic} alt={t('Empty')}/> : defaultPic
    return <WrapStyled height={height}>
        {renderPic}
        <div className="messageWrapper">
            {message()}
        </div>
    </WrapStyled>
})






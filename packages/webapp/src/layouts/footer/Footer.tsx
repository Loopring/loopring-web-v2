import styled from '@emotion/styled/macro'

const FooterDiv = styled.div`
    text-align: center;
    height: 100px;
    width: 100%;
    div {
        & .footer_internal {
            text-align: center;
            color: white;
            width: 1280px
            margin: 0 auto;
            line-height: 35px;
        }

        @media screen and (max-width: 1280px) {
        
          .footer_internal {
            width: 100%;
          }
        
        }
    }
`

const Footer = () => {

    return (
        <FooterDiv>
            <div>
                <div className={'footer_internal'}>Copyright (c) 2017-{new Date().getFullYear()}. </div>
                <div className={'footer_internal'}>All Rights Reversed by Loopring.</div>
            </div>
        </FooterDiv>
    )

}

export default Footer

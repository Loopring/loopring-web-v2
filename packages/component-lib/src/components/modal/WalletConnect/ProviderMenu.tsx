import {
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Link,
  Typography,
} from "@mui/material";
import { Trans, WithTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { ProviderMenuProps } from "./Interface";
import { Button } from "../../basic-lib";
import {
  CheckBoxIcon,
  CheckedIcon,
  ConnectProviders,
  GatewayItem,
} from "@loopring-web/common-resources";
import React from "react";
import { shake } from "../../styled";

const CheckboxStyled = styled(Checkbox)`
  &.shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  ${shake}
` as typeof Checkbox;

const ProviderBtnStyled = styled(Button)`
  font-size: 1.4rem;
  background: var(--opacity);
  color: var(--color-text-secondary);
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.unit * 3}px;
  text-indent: 0.5em;

  &:hover {
    background: var(--provider-hover);
    border-color: var(--opacity);
    color: var(--color-text-button-select);
  }

  //.MuiButton-label {
  //  display: flex;
  //
  //  justify-content: space-between;
  //  align-items: center;
  //  margin-left: 1em;
  //}

  &.selected {
    position: relative;
    background: var(--provider-hover);
    border-color: var(--opacity);
    color: var(--color-text-button-select);

    &:after {
      position: absolute;
      content: "\u25CF";
      text-indent: 0em;
      color: var(--color-success);
      //width: 100%;
      display: flex;
      left: 0;
      padding-left: ${({ theme }) => (theme.unit * 3) / 2}px;
      //justify-content: ;
      align-items: center;
      font-size: ${({ theme }) => theme.fontDefault.h5};
    }
  }
` as typeof Button;
// ${({ theme }) =>{
//   if(theme.palette.mode === ThemeType.light){
//     return`
//        &:hover {
//       }
//     `
//   }
//   return ``
// }}
//${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1 / 2, d_W:1})};
//padding: 0 ${({theme}) => theme.unit * 5 / 3}px;
const BoxStyle = styled(Box)`
  ${({ theme }) =>
    theme.border.defaultFrame({ c_key: "blur", d_R: 1 / 2, d_W: 0 })};
  background: var(--provider-agree);

  .MuiFormControlLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.h6};
    align-items: flex-start;

    .MuiTypography-root {
      padding: ${({ theme }) => theme.unit}px 0;
    }
  }
` as typeof Box;
// const WalletConnectPanelStyled = styled(Box)`
//   height: 100%;
//   //width: var(--transfer-modal-width);
// ` as typeof Box;

export const ProviderMenu = ({
  t,
  gatewayList,
  termUrl,
  handleSelect,
  providerName = ConnectProviders.unknown,
}: ProviderMenuProps & WithTranslation) => {
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [isShake, setIsShake] = React.useState(false);
  // const theme = useTheme();
  React.useEffect(() => {
    const isAgreed = localStorage.getItem("userTermsAgreed");
    setCheckboxValue(isAgreed === "true");
    setIsShake(false);
  }, []);
  const handleCheckboxChange = React.useCallback(
    (_event: any, state: boolean) => {
      setCheckboxValue(state);
      localStorage.setItem("userTermsAgreed", String(state));
    },
    []
  );
  const _handleSelect = React.useCallback(
    (
      event,
      key: string,
      handleSelect?: (event: React.MouseEvent, key: string) => void
    ) => {
      if (handleSelect && checkboxValue) {
        handleSelect(event, key);
        setIsShake(false);
      } else if (!checkboxValue) {
        setIsShake(true);
        setTimeout(() => {
          if (isShake) {
            setIsShake(false);
          }
        }, 80);
      }
    },
    [checkboxValue, isShake]
  );
  // const  !==  ConnectProviders.unknown
  return (
    <Box
      flex={1}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexDirection={"column"}
    >
      <Typography component={"h3"} variant={"h3"} marginBottom={3}>
        {t("labelConnectWallet")}
      </Typography>
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        flex={1}
        alignItems={"stretch"}
        alignSelf={"stretch"}
        className="modalContent"
        paddingX={10}
      >
        <BoxStyle
          paddingX={5 / 3}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"stretch"}
          alignItems={"flex-start"}
        >
          <MuiFormControlLabel
            control={
              <CheckboxStyled
                className={isShake ? "shake" : ""}
                checked={checkboxValue}
                onChange={handleCheckboxChange}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
              />
            }
            label={
              <Trans i18nKey="labelProviderAgree">
                I have read, understand, and agree to the
                <Link
                  component={"a"}
                  href={termUrl}
                  onClick={(event) => {
                    //@ts-ignore
                    window?._iub?.badges["0"].linkA.dispatchEvent(
                      new Event("click")
                    );
                    event.preventDefault();
                    // set
                    // window?._iub?.loadPPContent({...e, path: termUrl});
                  }}
                  target={"_blank"}
                >
                  Terms of Service
                </Link>
                .
              </Trans>
            }
          />
        </BoxStyle>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        flex={1}
        alignItems={"stretch"}
        alignSelf={"stretch"}
        className="modalContent"
        marginTop={3}
        paddingX={10}
      >
        <>
          {" "}
          {gatewayList.map((item: GatewayItem) => (
            <Box key={item.key} marginTop={1.5}>
              <ProviderBtnStyled
                variant={"outlined"}
                size={"large"}
                className={providerName === item.key ? "selected" : ""}
                fullWidth
                endIcon={<img src={item.imgSrc} alt={item.key} height={36} />}
                onClick={(e) => {
                  _handleSelect(
                    e,
                    item.key,
                    item.handleSelect ? item.handleSelect : handleSelect
                  );
                }}
              >
                {t(item.key)}
              </ProviderBtnStyled>
            </Box>
          ))}
        </>
      </Box>
    </Box>
  );
  {
    /*</WalletConnectPanelStyled>*/
  }
};

// export const ModalWalletConnect = withTranslation('swap', {withRef: true})((
//     {
//         t,
//         open,
//         onClose,
//         ...rest
//     }: ModalWalletConnectProps & WithTranslation) => {
//
//     return <Modal
//         open={open}
//         onClose={onClose}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//     >
//         <ModalContentStyled style={{boxShadow: '24'}}>
//             <WalletConnectPanel {...{...rest, t}} />
//         </ModalContentStyled>
//     </Modal>
// })

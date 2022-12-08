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
import {
  CheckBoxIcon,
  CheckedIcon,
  GatewayItem,
} from "@loopring-web/common-resources";
import React from "react";
import { MenuBtnStyled, shake } from "../../styled";
import { ConnectProviders } from "@loopring-web/web3-provider";
import { useSettings } from "../../../stores";

const CheckboxStyled = styled(Checkbox)`
  &.shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  ${shake}
` as typeof Checkbox;

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

export const ProviderMenu = ({
  t,
  gatewayList,
  termUrl,
  handleSelect,
  providerName = ConnectProviders.Unknown,
}: ProviderMenuProps & WithTranslation) => {
  const { isMobile } = useSettings();
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [isShake, setIsShake] = React.useState(false);

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
  // const  !==  ConnectProviders.Unknown
  return (
    <Box
      flex={1}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexDirection={"column"}
    >
      <Typography
        component={"h3"}
        variant={isMobile ? "h4" : "h3"}
        whiteSpace={"pre"}
        marginBottom={3}
      >
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
        paddingX={isMobile ? 7 : 10}
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
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    //@ts-ignore
                    window?._iub?.badges["0"].linkA.dispatchEvent(
                      new Event("click")
                    );
                    event.preventDefault();
                    // set
                    // window?._iub?.loadPPContent({...e, path: termUrl});
                  }}
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
        paddingX={isMobile ? 7 : 10}
        paddingBottom={4}
      >
        {gatewayList.map((item: GatewayItem) => (
          <Box key={item.key} marginTop={1.5}>
            <MenuBtnStyled
              variant={"outlined"}
              size={"large"}
              className={`${isMobile ? "isMobile" : ""} ${
                providerName === item.key ? "selected provider " : "provider"
              }`}
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
              {t(item.keyi18n)}
            </MenuBtnStyled>
          </Box>
        ))}
      </Box>
    </Box>
  );
  {
    /*</WalletConnectPanelStyled>*/
  }
};

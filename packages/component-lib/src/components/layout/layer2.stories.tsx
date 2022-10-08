import styled from "@emotion/styled";
import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import {
  Box,
  Collapse,
  Container,
  CssBaseline,
  GlobalStyles,
  Grid,
  IconButton,
  Paper,
  Toolbar,
} from "@mui/material";
import { Header, HideOnScroll } from "../header";
import { css, Theme, useTheme } from "@emotion/react";
import { Button, SubMenu, SubMenuList as BasicSubMenuList } from "../basic-lib";
import {
  // AmmExitData,
  // AmmInData,
  globalCss,
  headerMenuData,
  headerToolBarData,
  HideIcon,
  // IBData,
  PriceTag,
  subMenuLayer2,
  // VendorProviders,
  ViewIcon,
} from "@loopring-web/common-resources";
import { withTranslation } from "react-i18next";
import { OrderHistoryTable as OrderHistoryTableUI } from "../tableList/orderHistoryTable";
import { AssetTitleProps } from "../block";
import React from "react";
import { AssetTitle } from "../block";
import { AccountBasePanel, AccountBaseProps } from "../";

import { Typography } from "@mui/material";

const Style = styled.div``;
const SubMenuList = withTranslation("layout", { withRef: true })(
  BasicSubMenuList
);
const OrderHistoryTable = withTranslation("common", { withRef: true })(
  OrderHistoryTableUI
);

const AssetTitleWrap = (rest: any) => {
  const assetTitleProps: AssetTitleProps = {
    onShowReceive: () => {},
    onShowSend: () => {},
    accountId: 0,
    setHideL2Assets: () => undefined,
    hideL2Assets: false,
    assetInfo: {
      totalAsset: 123456.789,
      priceTag: PriceTag.Dollar,
    },
  };

  return (
    <>
      <Grid item xs={12}>
        <AssetTitle
          {...{
            ...rest,
            ...assetTitleProps,
          }}
        />
      </Grid>
    </>
  );
};

const Layer2Wrap = withTranslation("common")(({ t, ...rest }: any) => {
  const selected = "assets";
  const StylePaper = styled(Box)`
    width: 100%;
    height: 100%;
    flex: 1;
    background: var(--color-box);
    border-radius: ${({ theme }) => theme.unit}px;
    padding: ${({ theme }) => theme.unit * 3}px;

    .tableWrapper {
      ${({ theme }) => theme.border.defaultFrame({ c_key: "default", d_R: 1 })};
      // margin-top:  ${({ theme }) => theme.unit * 3}px;
      // border: 1px solid #252842;
      // border-radius: ${({ theme }) => theme.unit}px;
      // padding: 26px;
    }
  ` as typeof Paper;
  const accountInfoProps: AccountBaseProps = {
    __timer__: -1,
    frozen: false,
    keySeed: "",
    qrCodeUrl: "",
    accAddress: "0x123567243o24o242423098784",
    accountId: 0,
    apiKey: "",
    connectName: "unknown" as any,
    eddsaKey: undefined,
    etherscanUrl: "https://material-ui.com/components/material-icons/",
    keyNonce: undefined,
    nonce: undefined,
    publicKey: undefined,
    readyState: "unknown",
    level: "VIP 1",
    mainBtn: (
      <Button
        variant={"contained"}
        size={"small"}
        color={"primary"}
        onClick={() => console.log("my event")}
      >
        My button
      </Button>
    ),
  };
  const hasAccount = true;
  const [showAccountInfo, setShowAccountInfo] = React.useState(hasAccount);
  const handleClick = (_event: React.MouseEvent) => {
    if (showAccountInfo) {
      setShowAccountInfo(false);
    } else {
      setShowAccountInfo(true);
    }
    _event.stopPropagation();
  };
  headerMenuData["layer2"].extender = hasAccount ? (
    <IconButton
      disabled={!hasAccount}
      onClick={handleClick}
      aria-label={t("labelShowAccountInfo")}
      color="primary"
    >
      {showAccountInfo ? <HideIcon /> : <ViewIcon />}
    </IconButton>
  ) : undefined;

  return (
    <>
      <CssBaseline />
      <HideOnScroll>
        <Header
          {...{ ...rest }}
          headerMenuData={{ ...headerMenuData }}
          headerToolBarData={{ ...headerToolBarData }}
          selected={"markets"}
        />
      </HideOnScroll>
      <Toolbar />
      {hasAccount ? (
        <Collapse in={showAccountInfo}>
          <Container maxWidth="lg">
            <Box marginTop={3}>
              <AccountBasePanel {...{ ...accountInfoProps, t, ...rest }} />
            </Box>
          </Container>
        </Collapse>
      ) : undefined}
      <Container maxWidth="lg">
        {/*style={{height: '100%' }}*/}
        <Box
          flex={1}
          display={"flex"}
          alignItems={"stretch"}
          flexDirection="row"
          marginTop={3}
          minWidth={800}
        >
          <Box width={200} display={"flex"} justifyContent={"stretch"}>
            <SubMenu>
              <SubMenuList selected={selected} subMenu={subMenuLayer2 as any} />
            </SubMenu>
          </Box>
          <Box flex={1} marginLeft={4} height={1600} flexDirection="column">
            <Box marginBottom={3}>
              <AssetTitleWrap />
            </Box>
            <StylePaper>
              <Typography variant={"h5"} component={"h3"}>
                Orders
              </Typography>
              <Box marginTop={2} className="tableWrapper">
                <OrderHistoryTable rawData={[]} pageSize={0} {...rest} />
              </Box>
            </StylePaper>
          </Box>
        </Box>
      </Container>
      {/*<Footer></Footer>*/}
    </>
  );
});

const Template: Story<any> = () => {
  const theme: Theme = useTheme();
  console.log(theme.mode);
  return (
    <>
      <MemoryRouter initialEntries={["/"]}>
        <GlobalStyles
          styles={css`
  ${globalCss({ theme })};

  body:before {
    ${
      theme.mode === "dark"
        ? `
            color: ${theme.colorBase.textPrimary};        
           
            background: var(--color-global-bg);
       `
        : ""
    }
  }
}
`}
        />
        <Style>
          <Layer2Wrap />
        </Style>
      </MemoryRouter>
    </>
  );
};

export default {
  title: "components/Layout/Layer2",
  component: Layer2Wrap,
  argTypes: {},
} as Meta;

export const Layer2Story = Template.bind({});
// SwitchPanel.args = {}

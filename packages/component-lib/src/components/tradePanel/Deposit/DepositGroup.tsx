import { DepositGroupProps, DepositPanelType } from "./Interface";
import { IBData } from "@loopring-web/common-resources";
import { PanelContent } from "../../basic-lib";
import { DepositPanel } from "../../modal/ModalPanels/DepositPanel";
import { VendorMenu } from "./VendorMenu";
import { Box, BoxProps, Toolbar, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { DepositTitleGroup, DepositTitleNewGroup } from "./DepositTitle";
import React from "react";
import SwipeableViews from "react-swipeable-views";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../stores";

const ToolbarStyle = styled(Toolbar)`
  .MuiTabs-root {
    flex: 1;
    .MuiTab-root {
      display: inline-flex;
      flex-direction: row;
    }
  }
`;
const BoxStyle = styled(Box)<BoxProps & { isMobile: boolean | undefined }>`
  .trade-panel {
    width: 100%;
    height: 240px;
  }
  .isNew .trade-panel {
    height: 308px;
  }

  .react-swipeable-view-container {
    .trade-panel .react-swipeable-view-container {
      & > div {
        padding: 0;
        & > .MuiGrid-container {
          padding: 0;
        }
      }
      padding: 0;
    }
  }

  .way-content > div:first-of-type {
    position: relative;
    font-size: ${({ theme }) => theme.fontDefault.body1};

    ${({ isMobile, theme }) =>
      isMobile
        ? `
        padding-bottom:  ${10 * theme.unit}px;
         &:before {
          display: block;
          content: " ";
          position: absolute;
          bottom:  0px;
          left:0;          
          right:0;
          bottom: ${6 * theme.unit}px;
          margin: 0 ${2 * theme.unit}px;
          color: var(--color-text-third);
          border: 1px solid var(--color-text-third);
          opacity: 0.4;
       }
      &:after {
        display: block;
        content: "OR";
        position: absolute;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        left:50%;
        margin-left: -16px;
        bottom: ${2 * theme.unit}px;
        background: ${theme.colorBase.box};
        color: var(--color-text-third);
      }`
        : ` 
        &:before {
          display: block;
          content: " ";
          position: absolute;
          right: ${-theme.unit}px;
          bottom: 0;
          top:0;
          height: 100%;
          color: var(--color-text-third);
          border-right: 1px solid var(--color-divide);
       }
      &:after {
        display: block;
        content: "OR";
        position: absolute;
        bottom: 50%;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        right: ${-3 * theme.unit}px;
        background: ${theme.colorBase.box};
        color: var(--color-text-third);
      }`}
  }
  padding-left: 0;
  padding-right: 0;
` as (props: BoxProps & { isMobile: boolean | undefined }) => JSX.Element;

export const DepositGroup = <T extends IBData<I>, I>({
  depositProps,
  vendorMenuProps,
  tabIndex = DepositPanelType.Deposit,
}: // onTabChange,
DepositGroupProps<T, I>) => {
  const theme = useTheme();
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const [_tabIndex, setTabIndex] = React.useState<DepositPanelType>(
    tabIndex ?? DepositPanelType.Deposit
  );

  React.useEffect(() => {
    setTabIndex(tabIndex);
  }, [tabIndex]);

  const panelList: Pick<
    PanelContent<"Deposit" | "Vendor">,
    "key" | "element"
  >[] = [
    {
      key: "Deposit",
      element: <DepositPanel {...{ ...depositProps }} />,
    },
    {
      key: "Vendor",
      element: <VendorMenu {...{ ...vendorMenuProps }} />,
    },
  ];

  return (
    <BoxStyle
      isMobile={isMobile}
      display={"flex"}
      height={"auto"}
      flexDirection={"column"}
      flexWrap={"nowrap"}
      paddingX={3}
      marginTop={-4}
      paddingBottom={3}
    >
      <Box marginBottom={3} marginTop={isMobile ? 0 : 3}>
        <Typography
          component={"h4"}
          variant={"h4"}
          marginRight={1}
          textAlign={"center"}
        >
          {depositProps.isNewAccount
            ? t("labelCreateLayer2Title", { layer2: "Layer 2" })
            : t("labelAddAsset")}
        </Typography>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"center"}
        alignItems={"center"}
        marginBottom={2}
      >
        {depositProps.isNewAccount ? (
          <Box
            minWidth={"320px"}
            width={
              isMobile
                ? "auto"
                : `calc(2 *  var(--modal-width) - ${(theme.unit * 5) / 2}px)`
            }
            display={"flex"}
          >
            <Box
              className={"content way-content isNew"}
              display={"flex"}
              flex={1}
              flexDirection={isMobile ? "column" : "row"}
              justifyContent={"space-around"}
            >
              {panelList.map((panel, index) => {
                return (
                  <Box
                    width={isMobile ? "auto" : "48%"}
                    key={index}
                    minHeight={isMobile ? "320" : "280"}
                  >
                    <Box
                      flex={1}
                      display={"flex"}
                      flexDirection={"row"}
                      justifyContent={"space-around"}
                      marginBottom={2}
                      paddingLeft={4}
                    >
                      {DepositTitleNewGroup()[index]}
                    </Box>
                    {panel.element}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box
            minHeight={240}
            width={`calc(var(--swap-box-width) + ${theme.unit * 5}px)`}
          >
            <ToolbarStyle className={"large"} variant={"regular"}>
              <DepositTitleGroup
                onTabChange={(index) => {
                  setTabIndex(index);
                }}
                tabIndex={_tabIndex}
              />
            </ToolbarStyle>
            <SwipeableViews
              axis={theme.direction === "rtl" ? "x-reverse" : "x"}
              index={_tabIndex}
            >
              {panelList.map((panel, index) => {
                return (
                  <React.Fragment key={index}>{panel.element}</React.Fragment>
                );
              })}
            </SwipeableViews>
          </Box>
        )}
      </Box>
    </BoxStyle>
  );
};

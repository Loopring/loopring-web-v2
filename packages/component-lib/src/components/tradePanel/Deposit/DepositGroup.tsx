import { DepositGroupProps, DepositPanelType } from "./Interface";
import { IBData } from "@loopring-web/common-resources";
import { PanelContent } from "../../basic-lib";
import { DepositPanel } from "./DepositPanel";
import { VendorMenu } from "./VendorMenu";
import { Box, Toolbar, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { DepositTitleGroup, DepositTitleNewGroup } from "./DepositTitle";
import React from "react";
import SwipeableViews from "react-swipeable-views";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
const ToolbarStyle = styled(Toolbar)`
  .MuiTabs-root {
    flex: 1;
    .MuiTab-root {
      display: inline-flex;
      flex-direction: row;
    }
  }
`;
const BoxStyle = styled(Box)`
  .trade-panel {
    width: 100%;
    height: 240px;
  }
  .isNew .trade-panel {
    height: 280px;
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

  .depositWrap {
    justify-content: space-around;
  }
  .way-content > div:first-of-type {
    position: relative;
    font-size: ${({ theme }) => theme.fontDefault.body1};
    &:before {
      display: block;
      content: " ";
      position: absolute;
      right: ${({ theme }) => -theme.unit}px;
      bottom: 0;
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
      right: ${({ theme }) => -3 * theme.unit}px;
      background: ${({ theme }) => theme.colorBase.box};
      color: var(--color-text-third);
    }
  }
  padding-left: 0;
  padding-right: 0;
` as typeof Box;

export const DepositGroup = <T extends IBData<I>, I>({
  depositProps,
  vendorMenuProps,
  tabIndex = DepositPanelType.Deposit,
}: // onTabChange,
DepositGroupProps<T, I>) => {
  const theme = useTheme();
  const { t } = useTranslation(["common"]);
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
      display={"flex"}
      height={"auto"}
      flexDirection={"column"}
      flexWrap={"nowrap"}
      paddingX={3}
      marginTop={-3}
      paddingBottom={3}
    >
      <Box marginBottom={3}>
        <Typography
          component={"h4"}
          variant={"h4"}
          marginRight={1}
          textAlign={"center"}
        >
          {depositProps.isNewAccount
            ? t("labelCreateLayer2Title")
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
            width={`calc(2 *  var(--modal-width) - ${(theme.unit * 5) / 2}px)`}
          >
            <DepositTitleNewGroup />
            <Box
              className={"content way-content isNew"}
              display={"flex"}
              flex={1}
              flexDirection={"row"}
              justifyContent={"space-around"}
            >
              {panelList.map((panel, index) => {
                return (
                  <Box width={"48%"} key={index} minHeight={280}>
                    {panel.element}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box
            minHeight={240}
            maxWidth={`calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`}
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

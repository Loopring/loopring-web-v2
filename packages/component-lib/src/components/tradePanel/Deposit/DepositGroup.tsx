import { DepositGroupProps, DepositPanelType } from "./Interface";
import { IBData } from "@loopring-web/common-resources";
import { PanelContent } from "../../basic-lib";
import { DepositPanel } from "./DepositPanel";
import { VendorMenu } from "./VendorMenu";
import { Box, Toolbar } from "@mui/material";
import { useTheme } from "@emotion/react";
import { DepositTitleGroup } from "./DepositTitle";
import React from "react";
import SwipeableViews from "react-swipeable-views";
import styled from "@emotion/styled";
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
    .react-swipeable-view-container {
      & > div {
        padding: 0;
        & > .MuiGrid-container{
          padding: 0;
        }
\      }
      padding: 0;
    }
  }
  .depositWrap {
    justify-content: space-around;
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
      width={`calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`}
      height={"auto"}
      marginTop={-5}
      flexDirection={"column"}
      flexWrap={"nowrap"}
    >
      <ToolbarStyle className={"large"} variant={"regular"}>
        <DepositTitleGroup
          onTabChange={(index) => {
            setTabIndex(index);
          }}
          tabIndex={_tabIndex}
          description={depositProps.description}
          title={depositProps.title}
        />
      </ToolbarStyle>

      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={_tabIndex}
      >
        {panelList.map((panel, index) => {
          return <React.Fragment key={index}>{panel.element}</React.Fragment>;
        })}
      </SwipeableViews>
    </BoxStyle>
  );
};

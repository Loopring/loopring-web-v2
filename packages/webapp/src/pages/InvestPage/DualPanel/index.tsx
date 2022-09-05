import { WithTranslation, withTranslation } from "react-i18next";
import { Box } from "@mui/material";
import styled from "@emotion/styled";

import React from "react";

import { useHistory, useRouteMatch } from "react-router-dom";
import { DualListPanel } from "./DualListPanel";
import { DualWrap, Toast } from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/common-resources";
import { useDualTrade, useToast } from "@loopring-web/core";

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const StylePaper = styled(Box)`
  width: 100%;
  //height: 100%;
  flex: 1;
  padding-bottom: ${({ theme }) => theme.unit}px;

  .rdg {
    flex: 1;
  }
` as typeof Box;

export const DualPanel = withTranslation("common")(({ t }: WithTranslation) => {
  const match: any = useRouteMatch("/invest/:dual/:product?");
  const history = useHistory();

  // const dualProps = useDualTrade({ setToastOpen });
  return (
    <Box flex={1}>
      {/*{match?.params?.product ? : <DualWrap />}*/}
      <DualListPanel />
    </Box>
  );
});

import { WithTranslation, withTranslation } from "react-i18next";

import { IBData } from "@loopring-web/common-resources";
import React from "react";
import { ClaimProps } from "../../tradePanel";
import { Box } from "@mui/material";

export const ClaimWithdrawPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <T extends IBData<I>, I>({
    ..._rest
  }: ClaimProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    return <Box></Box>;
  }
) as <T, I>(props: ClaimProps<T, I> & React.RefAttributes<any>) => JSX.Element;

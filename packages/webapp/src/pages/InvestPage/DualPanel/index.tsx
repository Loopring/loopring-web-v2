import { WithTranslation, withTranslation } from "react-i18next";
import { Box } from "@mui/material";

import React from "react";

import { DualListPanel } from "./DualListPanel";

export const DualPanel = withTranslation("common")(({ t }: WithTranslation) => {
  return (
    <Box flex={1}>
      <DualListPanel />
    </Box>
  );
});

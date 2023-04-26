import { WithTranslation, withTranslation } from "react-i18next";

import { Box, Divider, Typography } from "@mui/material";

export const StopLimitInfo = withTranslation("common")(
  ({ t }: WithTranslation) => {
    return (
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"stretch"}
        height={"100%"}
      >
        <Box component={"header"} width={"100%"} paddingX={2}>
          <Typography variant={"body1"} lineHeight={"44px"}>
            {t(`labelStopLimitWhatIs`)}
          </Typography>
        </Box>
        <Divider style={{ marginTop: "-1px" }} />
        <Box flex={"1"} display={"flex"}>
          xxxxx
        </Box>
      </Box>
    );
  }
);

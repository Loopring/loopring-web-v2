import { Trans, WithTranslation, withTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";

import React from "react";
import { useOverview } from "./hook";

import { useSettings, InvestOverviewTable } from "@loopring-web/component-lib";
import { useHistory } from "react-router-dom";
import {
  BackIcon,
  ammAdvice,
  defiAdvice,
  myLog,
} from "@loopring-web/common-resources";

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  .MuiCard-root {
    padding: ${({ theme }) => 2 * theme.unit}px;
    background: var(--color-pop-bg);
    .MuiCardContent-root {
      padding: 0;
    }
    :hover {
      background: var(--color-box-hover);
    }
  }
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

export const OverviewPanel = withTranslation("common")(
  ({ t }: WithTranslation & {}) => {
    const { filteredData, sortMethod, filterValue, getFilteredData } =
      useOverview();
    const { coinJson } = useSettings();
    const showLoading = filteredData && !filteredData.length;
    const history = useHistory();
    const investAdviceList = [ammAdvice, defiAdvice];
    return (
      <>
        <WrapperStyled marginBottom={3}>
          <Grid container spacing={2} padding={3}>
            {investAdviceList.map((item, index) => {
              return (
                <Grid item xs={6} md={4} lg={3} key={item.type + index}>
                  <Card onClick={() => history.push(item.router)}>
                    <CardContent>
                      <Box
                        display={"flex"}
                        flexDirection={"row"}
                        alignItems={"center"}
                      >
                        <Avatar
                          variant="circular"
                          style={{
                            height: "var(--svg-size-huge)",
                            width: "var(--svg-size-huge)",
                          }}
                          src={item.banner}
                        />
                        <Box
                          flex={1}
                          display={"flex"}
                          flexDirection={"column"}
                          paddingLeft={1}
                        >
                          <Typography variant={"h5"}>
                            {t(item.titleI18n, { ns: "layout" })}
                          </Typography>
                          <Typography
                            variant={"body2"}
                            textOverflow={"ellipsis"}
                            whiteSpace={"pre"}
                            overflow={"hidden"}
                            color={"var(--color-text-third)"}
                          >
                            {t(item.desI18n, { ns: "layout" })}
                          </Typography>
                        </Box>
                        <BackIcon
                          fontSize={"small"}
                          htmlColor={"var(--color-text-third)"}
                          sx={{
                            transform: "rotate(180deg)",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          <Box flex={1} marginBottom={1}>
            <InvestOverviewTable
              showLoading={showLoading}
              sortMethod={sortMethod}
              filterValue={filterValue}
              getFilteredData={getFilteredData}
              // hideSmallBalances={hideSmallBalances}
              // setHideSmallBalances={setHideSmallBalances}
              coinJson={coinJson}
              rawData={filteredData}
            />
          </Box>
        </WrapperStyled>
      </>
    );
  }
);

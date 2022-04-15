import { withTranslation, WithTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { EmptyIcon } from "@loopring-web/common-resources";
import { Box, Typography } from "@mui/material";
import { BoxProps } from "@mui/material";

export type EmptyProps = {
  height?: number | string;
  defaultPic?: string | JSX.Element; //PATH or element
  message: () => JSX.Element;
};
const EmptyIconStyle = styled(EmptyIcon)`
  && {
    height: var(--empty-size);
    width: var(--empty-size);
  }

  opacity: 0.3;
  font-size: ${({ theme }) => theme.fontDefault.h1};
  color: var(--color-text-disable);
` as typeof EmptyIcon;
const WrapStyled = styled(Box)<{ height: number | undefined | string }>`
  display: flex;
  flex-direction: column;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  height: ${(props) =>
    props.height
      ? typeof props.height == "number"
        ? props.height + "px"
        : props.height
      : `${350 - 35}px`};
` as typeof Box;
export const EmptyDefault = withTranslation(["layout", "common"])(
  ({
    t,
    i18n,
    tReady,
    defaultPic = <EmptyIconStyle fontSize={"large"} />,
    height,
    message,
    ...rest
  }: EmptyProps & BoxProps & WithTranslation) => {
    const renderPic =
      !defaultPic || typeof defaultPic === "string" ? (
        <img src={defaultPic as string} alt={t("Empty")} />
      ) : (
        defaultPic
      );
    return (
      <WrapStyled height={height} {...rest}>
        {renderPic}
        <Typography
          component={"span"}
          color={"textSecondary"}
          fontSize={"h6"}
          marginTop={1}
        >
          {message()}
        </Typography>
      </WrapStyled>
    );
  }
) as (props: EmptyProps & BoxProps) => JSX.Element;

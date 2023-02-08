import styled from "@emotion/styled";
import { Box, Card, CardProps } from "@mui/material";

export * from "./SwitchPanel";
export * from "./SubMenu";
export * from "./Interface";
export * from "./IPFSSourceUpload";

export const CardNFTStyled = styled(Card)`
  display: flex;
  padding: 0;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  width: var(--nft-card);
`;

export const CardStyleItem = styled(Card)<
  CardProps & { contentheight?: number; size: "large" | "medium" | "small" }
>`
  background: var(--color-global-bg);
  width: 100%;
  cursor: pointer;
  height: 0;
  padding: 0 0
    calc(
      100% + ${({ contentheight }) => `${contentheight ? contentheight : 80}px`}
    );
  position: relative;
  .boxLabel {
    overflow: hidden;
  }

  &.collection {
    padding: 0 0 calc(140%);
    .boxLabel {
      ${({ size, theme }) =>
        size === "small"
          ? `
            padding: ${1 * theme.unit}px;
            margin:0;
          `
          : `
              .content{
                width:60%;
              }
              padding: ${2 * theme.unit}px;
              margin: ${2 * theme.unit}px;`}
    }
  }
  &.nft-item {
    .MuiRadio-root,
    .MuiCheckbox-root {
      &:hover {
        background-color: rgba(65, 105, 255, 0.05);
        color: var(--color-text-secondary);
      }
      &.Mui-checked {
        box-shadow: inset 0px 0px 60px var(--color-global-bg-opacity);
      }
      position: absolute;
      right: ${({ theme }) => theme.unit}px;
      top: ${({ theme }) => theme.unit}px;
      transform: scale(1.5);
    }
  }

  img {
    object-fit: contain;
  }
` as (
  props: CardProps & {
    contentheight?: number;
    size: "large" | "medium" | "small";
  }
) => JSX.Element;

export const ImageUploadWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .MuiFormControlLabel-root {
    align-items: flex-start;

    .MuiFormControlLabel-label {
      color: var(--color-text-secondary);
    }
  }
` as typeof Box;

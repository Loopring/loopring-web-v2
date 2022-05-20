import {
  ButtonProps,
  TypographyProps,
  Box,
  FormControl,
  FormHelperText,
  Typography,
  IconButton,
  Link,
} from "@mui/material";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import styled from "@emotion/styled";
import {
  CloseIcon,
  ErrorIcon,
  ImageIcon,
  SoursURL,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import React from "react";
import { NftImage } from "../media";

const BoxStyle = styled(Box)`
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: theme.colorBase.divide,
      d_W: 0,
      d_R: 1,
    })};
  background: ${({ theme }) => theme.colorBase.globalBg};
  width: 100%;
  height: 100%;
  border-style: dashed;
  .MuiFormHelperText-sizeMedium {
    font-size: ${({ theme }) => theme.fontDefault.body2};
    color: var(--color-error);
  }
  opacity: 0.8;
  &.focused,
  &:hover {
    opacity: 0.95;
  }
` as typeof Box;
const LinkStyle = styled(Link)`
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: theme.colorBase.divide,
      d_W: 0,
      d_R: 1,
    })};
` as typeof Link;

export type IpfsFile = {
  file: File;
  isProcessing: boolean;
  error:
    | {
        [key: string]: any;
      }
    | undefined;
  uniqueId: string;
  isUpdateIPFS: boolean;
  cid?: string;
  localSrc?: string;
  fullSrc?: string;
};
export const IPFS_INIT: Partial<IpfsFile> = {
  file: undefined,
  isProcessing: false,
  error: undefined,
  isUpdateIPFS: false,
};

export const IPFSSourceUpload = ({
  value,
  onChange,
  width,
  height,
  fullSize = false,
  title = "labelLoadDes",
  buttonText = "labelUpload",
  typographyProps,
  buttonProps,
  disabled,
  maxSize,
  onDelete,
  types = ["jpeg", "jpg", "gif", "png"],
  ...options
}: Omit<DropzoneOptions, "onDrop" | "onDropAccepted"> & {
  // sx?: SxProps<Theme>;
  fullSize?: boolean;
  width?: number;
  height?: number;
  typographyProps?: TypographyProps;
  buttonProps?: Omit<ButtonProps, "onClick">;
  title?: string;
  buttonText?: string;
  value: IpfsFile | undefined;
  types?: string[];
  onDelete: () => void;
  onChange: (files: IpfsFile) => void;
}) => {
  const { t } = useTranslation();
  // const

  const onDropAccepted = React.useCallback(
    (file: File[]) => {
      onChange({
        file: file[0],
        isProcessing: true,
        error: undefined,
        localSrc: URL.createObjectURL(file[0]),
        isUpdateIPFS: false,
        uniqueId: Date.now().toString() + file[0].lastModified,
      });
    },
    [onChange]
  );
  const { fileRejections, getRootProps, getInputProps, open, isFocused } =
    useDropzone({
      ...options,
      disabled,
      maxSize,
      accept: types
        ?.map((item) => {
          return `image/${item}`;
        })
        .join(", "),
      onDropAccepted,
      noClick: true,
      noKeyboard: true,
    });

  const isFileTooLarge =
    maxSize !== undefined &&
    fileRejections.length > 0 &&
    fileRejections[0].file.size > maxSize;
  const close = React.useMemo(
    () => (
      <IconButton
        size={"medium"}
        aria-label={t("labelClose")}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          background: "var(--color-global-bg)",
        }}
        color={"inherit"}
        onClick={onDelete}
      >
        <CloseIcon />
      </IconButton>
    ),
    [onDelete, t]
  );
  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Box
        // display={"flex"}
        overflow={"hidden"}
        position={"relative"}
        style={{
          paddingBottom: height ?? "100%",
          width: width ?? "100%",
        }}
      >
        <ImageIcon
          // fontSize={"large"}
          style={{
            position: "absolute",
            opacity: 1,
            height: 48,
            width: 48,
            top: "50%",
            left: "50%",
            transform: "translateY(-50%) translateX(-50%)",
            zIndex: 60,
          }}
        />

        <Box
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            height: "100%",
            width: "100%",
            zIndex: 99,
          }}
        >
          {value ? (
            value.isProcessing ? (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                height={"100%"}
                justifyContent={"center"}
              >
                <img
                  className="loading-gif"
                  width="36"
                  alt={"loading"}
                  src={`${SoursURL}images/loading-line.gif`}
                />
                {close}
              </Box>
            ) : value.error ? (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                height={"100%"}
                justifyContent={"center"}
              >
                <ErrorIcon style={{ height: 36, width: 36 }} />
                {close}
              </Box>
            ) : (
              <>
                <LinkStyle
                  alignSelf={"stretch"}
                  flex={1}
                  display={"flex"}
                  style={{ background: "var(--color-box-secondary)" }}
                  height={"100%"}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={value.fullSrc}
                >
                  <NftImage
                    alt={value?.file?.name}
                    title={value.cid}
                    onError={() => undefined}
                    src={value.localSrc}
                  />
                </LinkStyle>
                {close}
              </>
            )
          ) : (
            <BoxStyle
              {...getRootProps()}
              paddingTop={1}
              display={"flex"}
              className={isFocused ? "focused" : ""}
            >
              <FormControl
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  width: "100%",
                  height: "100%",
                }}
                onClick={open}
                error={isFileTooLarge}
              >
                <input {...getInputProps()} />
                {/*<img alt={"ipfs"} height={36} src={SoursURL + "svg/ipfs.svg"} />*/}
                <Typography
                  variant={"h6"}
                  textAlign="center"
                  paddingX={2}
                  paddingBottom={1}
                  {...typographyProps}
                >
                  {t(title, { types: types?.join(", ") })}
                </Typography>
                <FormHelperText>
                  {fileRejections[0]?.errors[0]?.message}
                </FormHelperText>
              </FormControl>
            </BoxStyle>
          )}
        </Box>
      </Box>
    </Box>
  );
};

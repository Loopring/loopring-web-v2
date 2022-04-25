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
// import { FileListItem } from "../lists";
import styled from "@emotion/styled";
import { CloseIcon, ErrorIcon, SoursURL } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import React from "react";
import { NftImage } from "../media";

// ${({ theme }) =>
//   theme.border.defaultFrame({
//     c_key: theme.colorBase.divide,
//     d_W: 2,
//     d_R: 1,
//   })};
const BoxStyle = styled(Box)`
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: theme.colorBase.divide,
      d_W: 0,
      d_R: 1,
    })};
  background: ${({ theme }) => theme.colorBase.fieldOpacity};
  width: 100%;
  height: 100%;
  border-style: dashed;
`;
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
      // myLog("onDropAccepted", _value);
      // const ipfsFile: IpfsFile =;
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
  const { fileRejections, getRootProps, getInputProps, open } = useDropzone({
    ...options,
    disabled,
    maxSize,
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
        flex={1}
        display={"flex"}
        position={"relative"}
        width={width ?? "auto"}
        minHeight={200}
      >
        <img
          style={{
            opacity: 0.1,
            width: "100%",
            padding: 16,
            height: "100%",
            display: "block",
          }}
          alt={"ipfs"}
          src={SoursURL + "svg/ipfs.svg"}
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
                  alt={""}
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
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                height={"100%"}
                justifyContent={"center"}
              >
                <Box>
                  <NftImage
                    alt={value?.file.name}
                    title={value.cid}
                    onError={() => undefined}
                    src={value.localSrc}
                  />
                </Box>
                {close}
              </Box>
            )
          ) : (
            <BoxStyle {...getRootProps()} paddingTop={1} display={"flex"}>
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
                  padding={1}
                  {...typographyProps}
                >
                  {t(title, { types: types })}
                </Typography>
                <FormHelperText>
                  {fileRejections[0]?.errors[0]?.message}
                </FormHelperText>
              </FormControl>
            </BoxStyle>
          )}
        </Box>
      </Box>
      {value && value.cid && (
        <Typography color={"textSecondary"} marginY={1}>
          CID:
          {/*Created Success*/}
          <Link
            variant={"body2"}
            marginLeft={1}
            whiteSpace={"pre-line"}
            style={{ wordBreak: "break-all" }}
            href={value.fullSrc}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value.cid}
          </Link>
        </Typography>
      )}
    </Box>
  );
};

import {
  ButtonProps,
  TypographyProps,
  Box,
  FormControl,
  FormHelperText,
  Typography,
  backdropClasses,
} from "@mui/material";
import { DropzoneOptions, useDropzone } from "react-dropzone";
// import { FileListItem } from "../lists";
import styled from "@emotion/styled";
import { ErrorIcon, hexToRGB, SoursURL } from "@loopring-web/common-resources";
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
  fullSrc?: string;
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
  value: IpfsFile | null;
  types?: string[];
  onDelete: (index: number) => void;
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
        isUpdateIPFS: false,
        uniqueId: Date.now().toString() + file[0].lastModified,
      });
      // _value.reduce((prev, file) => {
      //   const ipfsFile: IpfsFile = {
      //     file,
      //     isProcessing: true,
      //     error: undefined,
      //     isUpdateIPFS: false,
      //     uniqueId: Date.now().toString() + file.lastModified,
      //   };
      //   prev.push(ipfsFile);
      //   return prev;
      // }, [] as IpfsFile)
    },
    [value]
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
  // const files = value?.map((file, i) => (
  //   <FileListItem {...file} index={i} onDelete={() => onDelete(i)} />
  // ));

  return (
    <Box
      flex={1}
      alignItems={"column"}
      display={"flex"}
      sx={{
        width: width ?? "auto",
        position: "relative",
      }}
    >
      <img
        style={{ opacity: 0.1, width: "100%", padding: 16 }}
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
              height={"100%"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <img
                className="loading-gif"
                width="36"
                src={`${SoursURL}images/loading-line.gif`}
              />
            </Box>
          ) : value.error ? (
            <Box
              flex={1}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <ErrorIcon style={{ height: 36, width: 36 }} />
            </Box>
          ) : (
            <Box display={"flex"} flexDirection={"column"}>
              <NftImage
                alt={value?.file.name}
                title={value.cid}
                onError={() => undefined}
                src={value.fullSrc}
              />
              <Typography variant={"body2"} color={"textSecondary"}>
                {value.cid}
              </Typography>
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
                paddingY={1}
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

      {/*<Box*/}
      {/*  height={RowConfig.rowHeight}*/}
      {/*  component="ul"*/}
      {/*  display={"flex"}*/}
      {/*  justifyContent={"center"}*/}
      {/*  flexWrap={"wrap"}*/}
      {/*  style={{ listStyle: "none" }}*/}
      {/*  margin={0}*/}
      {/*  padding={1 / 2}*/}
      {/*>*/}
      {/*  <FileListItem {...value} />*/}
      {/*</Box>*/}
    </Box>
  );
};

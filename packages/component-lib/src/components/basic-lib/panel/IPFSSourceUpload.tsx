import {
  ButtonProps,
  TypographyProps,
  Box,
  FormControl,
  FormHelperText,
  Typography,
} from "@mui/material";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { FileListItem } from "../lists";
import styled from "@emotion/styled";
import { SoursURL } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import React from "react";

const BoxStyle = styled(Box)`
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: theme.colorBase.divide,
      d_W: 2,
      d_R: 1,
    })};
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
};

export const IPFSSourceUpload = ({
  value,
  onChange,
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
  typographyProps?: TypographyProps;
  buttonProps?: Omit<ButtonProps, "onClick">;
  title?: string;
  buttonText?: string;
  value: IpfsFile[];
  types?: string[];
  onDelete: (index: number) => void;
  onChange: (files: IpfsFile[]) => void;
}) => {
  const { t } = useTranslation();
  // const

  const onDropAccepted = React.useCallback(
    (_value: File[]) => {
      // myLog("onDropAccepted", _value);
      onChange(
        _value.reduce((prev, file) => {
          const ipfsFile: IpfsFile = {
            file,
            isProcessing: true,
            error: undefined,
            isUpdateIPFS: false,
            uniqueId: Date.now().toString() + file.lastModified,
          };
          prev.push(ipfsFile);
          return prev;
        }, [] as IpfsFile[])
      );
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
  const files = value?.map((file, i) => (
    <FileListItem
      isError={false}
      {...file}
      index={i}
      onDelete={() => onDelete(i)}
    />
  ));

  return (
    <BoxStyle {...getRootProps()} paddingTop={1}>
      <FormControl
        onClick={open}
        error={isFileTooLarge}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <img alt={"ipfs"} height={36} src={SoursURL + "svg/ipfs.svg"} />
        <Typography
          variant={"h6"}
          textAlign="center"
          paddingY={1}
          {...typographyProps}
        >
          {t(title, { types: types })}
        </Typography>
        {/*<Button*/}
        {/*  variant="contained"*/}
        {/*  onClick={open}*/}
        {/*  size={"small"}*/}
        {/*  disabled={disabled}*/}
        {/*  sx={{ marginBottom: 1 }}*/}
        {/*>*/}
        {/*  {t(buttonText)}*/}
        {/*</Button>*/}
        <FormHelperText>{fileRejections[0]?.errors[0]?.message}</FormHelperText>
      </FormControl>
      <Box
        component="ul"
        display={"flex"}
        justifyContent={"center"}
        flexWrap={"wrap"}
        style={{ listStyle: "none" }}
        margin={0}
        padding={1 / 2}
      >
        {files}
      </Box>
    </BoxStyle>
  );
};

import {
  ButtonProps,
  TypographyProps,
  Box,
  Button,
  FormControl,
  FormHelperText,
  Typography,
} from "@mui/material";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { FileListItem } from "../lists";
import styled from "@emotion/styled";
import { SoursURL } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";

const BoxStyle = styled(Box)`
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: theme.colorBase.divide,
      d_W: 2,
      d_R: 1,
    })};
  border-style: dashed;
`;

export const IPFSSourceUpload = ({
  value,
  onChange,
  title = "labelLoadDes",
  buttonText = "labelUpload",
  typographyProps,
  buttonProps,
  disabled,
  maxSize,
  types = ["jpeg", "jpg", "gif", "png"],
  ...options
}: Omit<DropzoneOptions, "onDrop" | "onDropAccepted"> & {
  // sx?: SxProps<Theme>;
  typographyProps?: TypographyProps;
  buttonProps?: Omit<ButtonProps, "onClick">;
  title?: string;
  buttonText?: string;
  value: File[];
  types?: string[];
  onChange: (files: File[]) => void;
}) => {
  const { t } = useTranslation();
  const { fileRejections, getRootProps, getInputProps, open } = useDropzone({
    ...options,
    disabled,
    maxSize,
    onDropAccepted: onChange,
    noClick: true,
    noKeyboard: true,
  });
  const onDelete = (index: number) => {
    const files = [...value];
    files.splice(index, 1);
    onChange(files);
  };
  const isFileTooLarge =
    maxSize !== undefined &&
    fileRejections.length > 0 &&
    fileRejections[0].file.size > maxSize;
  const files = value?.map((file, i) => (
    <FileListItem
      key={file.name}
      name={file.name}
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
        {/*<Avatar component={"img"} >*/}
        <Typography
          variant={"h6"}
          textAlign="center"
          paddingY={1}
          // style={{textDecoration}}
          // sx={{ paddingY: 1 }}
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

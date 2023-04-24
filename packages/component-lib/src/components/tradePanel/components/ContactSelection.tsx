import { Avatar, Box, Grid, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import {
  SearchIcon,
  CloseIcon,
  SoursURL,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { createImageFromInitials } from "@loopring-web/core";

type SingleContactProps = {
  editing: boolean, 
  name:string, 
  address:string, 
  avatarURL:string,
  onSelect: (address: string) => void
}

export const SingleContact = (props: SingleContactProps) => {
  const { editing, name, address, avatarURL, onSelect } = props;
  return <Box 
    style={{cursor: "pointer"}} 
    paddingY={2} 
    display={"flex"} 
    justifyContent={"space-between"}
    onClick={() => {
      onSelect(address)
    }}
    // onCl
    >
    <Box display={"flex"}>
      <Avatar sizes={"32px"} src={avatarURL}></Avatar>
      <Box marginLeft={1}>
        {
          editing
            ? <OutlinedInput size={"small"} value={name} />
            : <Typography>{name}</Typography>
        }
        <Typography>{address}</Typography>
      </Box>
    </Box>
  </Box>
}

const CloseIconStyled = styled(CloseIcon)`
  position: absolute;
  top: 55%;
  transform: translateY(-50%);
  right: ${({ theme }) => theme.unit}px;
  cursor: pointer;
`;


// OutlinedInput
type ContactSelectionProps = {
  onSelect: (address: string) => void
  contacts: {
    name: string,
    address: string,
  }[] | undefined
}
export const ContactSelection = (props: ContactSelectionProps) => {
  // const { t } = useTranslation();
  const { onSelect, contacts } = props
  const { isMobile } = useSettings();
  const theme = useTheme()
  const displayContacts = contacts && contacts.map(x => {
    return {
      name: x.name,
      address: x.address,
      avatarURL: createImageFromInitials(32, x.name, "#FFC178")!, // todo
      editing: false
    }
  })

  const [inputValue, setInputValue] = useState('')
  const filteredContacts = displayContacts && displayContacts.filter(x => {
    return inputValue
      ? x.address.toLowerCase().includes(inputValue.toLowerCase()) || x.name.toLowerCase().includes(inputValue.toLowerCase())
      : true
  })
  
  const normalView = <>
    <Grid item xs={12} width={"100%"}>
      <OutlinedInput
        style={{
          background: theme.colorBase.box,
          borderColor: theme.colorBase.border
        }}
        fullWidth
        className={"search"}
        aria-label={"search"}
        placeholder={"Search"}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon color={"inherit"} />
          </InputAdornment>
        }
        value={inputValue}
        endAdornment={
          <CloseIconStyled
            htmlColor={"var(--color-text-third)"}
            style={{ visibility: inputValue ? "visible" : "hidden" }}
            onClick={() => {
              setInputValue('')
            }}
          />
        }
        onChange={(e) => {
          setInputValue(e.target.value)
        }}
      ></OutlinedInput>
      {filteredContacts && filteredContacts.map(c => {
        return <SingleContact
          name={c.name}
          address={c.address}
          avatarURL={c.avatarURL}
          editing={false}
          onSelect={onSelect}
        />
      })}
    </Grid>
  </>
  const loadingView =
    <Box height={"100%"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
      <img
        className="loading-gif"
        alt={"loading"}
        width="36"
        src={`${SoursURL}images/loading-line.gif`}
      />
    </Box>
  const emptyView =
    <Box height={"100%"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
      <Typography color={"var(--color-text-third)"}>
        No Contact
      </Typography>
    </Box>
  
  return (
    <Grid
      container
      paddingLeft={isMobile ? 2 : 5}
      paddingRight={isMobile ? 2 : 5}
      direction={"column"}
      alignItems={"stretch"}
      flex={1}
      height={"100px"}
      minWidth={240}
      flexWrap={"nowrap"}
      spacing={2}
    >
      <Grid item >
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          marginBottom={2}
        >
          <Typography
            component={"h4"}
            variant={isMobile ? "h4" : "h3"}
            whiteSpace={"pre"}
            marginRight={1}
          >
            Select the Recipient
          </Typography>
        </Box>
      </Grid>
      {
        contacts === undefined
          ? loadingView
          : contacts.length === 0
            ? emptyView
            : normalView
      }
    </Grid>
  );
};

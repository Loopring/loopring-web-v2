import { Avatar, Box, Button, OutlinedInput, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { InputSearch, Toast } from "@loopring-web/component-lib";
import { EditIcon, TOAST_TIME } from "@loopring-web/common-resources";
import { Add } from "./add";
import { Delete } from "./delete";
import { Send } from "./send";
import { useContact } from "./hooks";
import { useHistory } from "react-router";

const ContactPageStyle = styled(Box)`
  background: var(--color-box);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;
  border-radius: ${({ theme }) => theme.unit}px;
`;

const Line = styled("div")`
  border-radius: ${({ theme }) => theme.unit / 2}px;
  height: 1px;
  margin-top: ${({ theme }) => theme.unit * 2}px;
  background: var(--color-divide);
`;

export const ContactPage = () => {
  const {
    setAddOpen,
    addOpen,
    addLoading,
    submitAddContact,
    // add,
    contacts,
    searchValue,
    onChangeSearch,
    onClickEditing,
    onClickDelete,
    onChangeInput,
    onInputBlue,
    toastInfo,

    deleteInfo,
    onCloseDelete,

    submitDeleteContact,
    deleteLoading,

    onClickSend,
    onCloseSend,
    sendInfo,
    onCloseToast,
  } = useContact();
  let totastText = "";
  if (toastInfo.isSuccess) {
    switch (toastInfo.type) {
      case "Add":
        totastText = "Add Contact Succeed";
        break;
      case "Delete":
        totastText = "Delete Contact Succeed";
        break;
      case "Edit":
        totastText = "Edit Contact Succeed";
        break;
      case "Send":
        totastText = "Send Succeed";
        break;
    }
  } else {
    switch (toastInfo.type) {
      case "Add":
        totastText = "Add Contact Failed";
        break;
      case "Delete":
        totastText = "Delete Contact Failed";
        break;
      case "Edit":
        totastText = "Edit Contact Failed";
        break;
      case "Send":
        totastText = "Send Failed";
        break;
    }
  }
  const history = useHistory();
  return (
    <ContactPageStyle
      className={"MuiPaper-elevation2"}
      paddingX={4}
      paddingY={3}
    >
      <Toast
        alertText={totastText}
        severity={toastInfo.isSuccess ? "success" : "error"}
        open={toastInfo.open}
        autoHideDuration={TOAST_TIME}
        onClose={() => onCloseToast()}
      />
      <Add
        loading={addLoading}
        submitAddingContact={submitAddContact}
        addOpen={addOpen}
        setAddOpen={setAddOpen}
      />
      <Delete
        deleteInfo={deleteInfo}
        onCloseDelete={onCloseDelete}
        submitDeleteContact={submitDeleteContact}
        loading={deleteLoading}
      />
      <Send sendInfo={sendInfo} onCloseSend={onCloseSend} />
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant={"h2"}>Contacts</Typography>
        <Box display={"flex"}>
          <InputSearch
            value={searchValue}
            onChange={(e) => {
              onChangeSearch(e as unknown as string);
            }}
          />
          <Box marginLeft={2}>
            <Button
              variant={"contained"}
              size={"small"}
              onClick={() => {
                setAddOpen(true);
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Box>
      <Box className="table-divide">
        <Line />
        {contacts.map((data) => {
          const { editing, name, address, avatarURL, addressType } = data;
          return (
            <Box
              key={address}
              paddingY={2}
              display={"flex"}
              justifyContent={"space-between"}
            >
              <Box display={"flex"}>
                <Avatar sizes={"32px"} src={avatarURL}></Avatar>
                <Box marginLeft={1}>
                  {editing ? (
                    <OutlinedInput
                      size={"small"}
                      value={name}
                      onChange={(e) => {
                        onChangeInput(address, e.target.value);
                      }}
                      onBlur={() => {
                        onInputBlue(address);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  ) : (
                    <Typography>
                      {name}
                      <EditIcon onClick={() => onClickEditing(address)} />
                      {/* todo color */}
                    </Typography>
                  )}
                  <Typography>{address}</Typography>
                </Box>
              </Box>
              <Box display={"flex"}>
                <Box marginRight={2}>
                  <Button
                    onClick={() => onClickSend(address, name, addressType)}
                    variant={"contained"}
                    size={"small"}
                  >
                    Send
                  </Button>
                </Box>
                <Box marginRight={2}>
                  <Button
                    variant={"outlined"}
                    size={"medium"}
                    onClick={() => {
                      history.push("/contact/transactions/" + address);
                    }}
                  >
                    Transactions
                  </Button>
                </Box>
                <Button
                  variant={"outlined"}
                  size={"medium"}
                  onClick={() => {
                    onClickDelete(address, name);
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    </ContactPageStyle>
  );
};

import { Avatar, Box, Button, IconButton, OutlinedInput, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { InputSearch, Toast } from "@loopring-web/component-lib";
import { CopyIcon, EditIcon, SoursURL, TOAST_TIME } from "@loopring-web/common-resources";
import { Add } from "./add";
import { Delete } from "./delete";
import { Send } from "./send";
import { useContact, useContactAdd } from "./hooks";
import { useHistory } from "react-router";
import { ViewAccountTemplate, WalletConnectL2Btn } from "@loopring-web/core";
import { useTranslation } from "react-i18next";

const ContactPageStyle = styled(Box)`
  background: var(--color-box);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  /* padding-bottom: 5%  */
  width: 100%;
  border-radius: ${({ theme }) => theme.unit}px;
`

const Line = styled('div')`
  border-radius: ${({theme}) => theme.unit / 2}px;
  height: 1px;
  margin-top: ${({theme}) => theme.unit * 2}px;;
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
    setToastInfo,
    onScroll
  } = useContact()
  const {t} = useTranslation()
  let totastText = ''
  if (toastInfo.isSuccess) {
    switch (toastInfo.type) {
      case 'Add':
        totastText = t("labelContactsAddSuccess")
        break
      case 'Delete':
        totastText = t("labelContactsDeleteSuccess")
        break
      case 'Edit':
        totastText = t("labelContactsEditSuccess")
        break
      case 'Send':
        totastText = t("labelContactsSendSuccess") 
        break
      case 'Copy':
        totastText = t("labelContactsCopySuccess") 
        break
    }
  } else {
    switch (toastInfo.type) {
      case 'Add':
        totastText = t("labelContactsAddFailed")
        break
      case 'Delete':
        totastText = t("labelContactsDeleteFailed")
        break
      case 'Edit':
        totastText = t("labelContactsEditFailed")
        break
      case 'Send':
        totastText = t("labelContactsSendFailed")
        break
    }
  }
  const history = useHistory();

  const noContact = <Box height={"80vh"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
    <Typography color={"var(--color-text-third)"}>No Contact</Typography>
  </Box>
  const loadingView = <Box height={"80vh"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
    <img
      className="loading-gif"
      alt={"loading"}
      width="36"
      src={`${SoursURL}images/loading-line.gif`}
    />
  </Box>
  const normalView = contacts && contacts.map(data => {
    const { editing, name, address, avatarURL, addressType } = data;
    return <Box key={address} paddingY={2} display={"flex"} justifyContent={"space-between"}>
      <Box display={"flex"}>
        <Avatar sizes={"32px"} src={avatarURL}></Avatar>
        <Box marginLeft={1}>
          {
            editing
              ? <OutlinedInput
                size={"small"}
                value={name}
                onChange={e => {
                  onChangeInput(address, e.target.value)
                }}
                onBlur={() => {
                  onInputBlue(address)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  }
                }}
              />
              : <Typography>
                {name}
                <EditIcon onClick={() => onClickEditing(address)} />
              </Typography>
          }
          <Typography>
            {address}
            <IconButton onClick={() => {
              navigator.clipboard.writeText(address);
              setToastInfo({
                open: true,
                isSuccess: true,
                type: 'Copy'
              })
              setTimeout(() => {
                setToastInfo({
                  open: false,
                  isSuccess: undefined,
                  type: undefined
                })
              }, 3 * 1000);
            }}>
              <CopyIcon></CopyIcon>
            </IconButton>
          </Typography>
        </Box>
      </Box>
      <Box display={"flex"}>
        <Box marginRight={2}>
          <Button
            onClick={() => onClickSend(address, name, addressType)}
            variant={"contained"}
            size={"small"}>
            {t("labelContactsSend")}
          </Button>
        </Box>
        <Box marginRight={2}>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={() => {
              history.push('/contact/transactions/' + address)
            }}
          >
            {t("labelContactsTransactions")}
          </Button>
        </Box>
        <Button
          variant={"outlined"}
          size={"medium"}
          onClick={() => {
            onClickDelete(address, name)
          }}
        >
          {t("labelContactsDeleteContactBtn")}
        </Button>
      </Box>
    </Box>
  })
  
  const activeView = <ContactPageStyle
    className={"MuiPaper-elevation2"}
    paddingX={4}
    paddingY={3}
  >
    <Toast
      alertText={totastText}
      severity={toastInfo.isSuccess ? 'success' : 'error'}
      open={toastInfo.open}
      autoHideDuration={TOAST_TIME}
      onClose={() => onCloseToast()}
    />
    <Add
      loading={addLoading}
      submitAddingContact={(address, name, cb) => {
        submitAddContact(address, name, cb)
      }}
      addOpen={addOpen}
      setAddOpen={setAddOpen}
    />
    <Delete
      deleteInfo={deleteInfo}
      onCloseDelete={onCloseDelete}
      submitDeleteContact={submitDeleteContact}
      loading={deleteLoading}
    />
    <Send
      sendInfo={sendInfo}
      onCloseSend={onCloseSend}
    />
    <Box display={"flex"} justifyContent={"space-between"}>
      <Typography variant={"h2"}>{t("labelContacts")}</Typography>
      <Box display={"flex"}>
        <InputSearch
          value={searchValue}
          onChange={(e) => {
            onChangeSearch(e as unknown as string)
          }}
        />
        <Box marginLeft={2}>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={() => {
              setAddOpen(true)
            }}
          >
            {t("labelContactsAddContactBtn")}
          </Button>
        </Box>
      </Box>
    </Box>
    <Box className="table-divide" >
      <Line />
      <Box height={"calc(100vh - 200px)"} overflow={"scroll"} onScroll={e => onScroll(e.currentTarget)}>
      {
        contacts === undefined
          ? loadingView
          : contacts.length === 0
            ? noContact
            : normalView
      }
      </Box>
    </Box>
  </ContactPageStyle>
  return <ViewAccountTemplate unlockWording={"Unlock your account to view your contacts."} activeViewTemplate={activeView} />
};
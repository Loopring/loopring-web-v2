import React, { useCallback, useEffect, useState } from "react";
import {
  LoopringAPI,
  store,
  useAccount,
  volumeToCount,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import { utils } from "ethers";
import { RawDataTransactionItem, TransactionStatus, useOpenModals } from "@loopring-web/component-lib";
import { createImageFromInitials } from "./genAvatar";
import { AddressType } from "@loopring-web/loopring-sdk";
import { useTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import { useRouteMatch } from "react-router";
import { SDK_ERROR_MAP_TO_UI } from "@loopring-web/common-resources";


export type Contact = {
  name: string,
  address: string,
  addressType?: AddressType
  // id: string
}
type Network = 'L1' | 'L2'

export const useContact = () => {
  const [addOpen, setAddOpen] = React.useState(false);
  const [deleteInfo, setDeleteInfo] = React.useState({
    open: false,
    selected: undefined as Contact | undefined
  });
  const [sendInfo, setSendInfo] = React.useState({
    open: false,
    selected: undefined as Contact | undefined
  });
  type DisplayContact = {
    name: string
    address: string
    avatarURL: string
    editing: boolean
    addressType: AddressType

  }
  const [searchValue, setSearchValue] = React.useState('');
  const [contacts, setContacts] = React.useState([] as DisplayContact[]);
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const loadContacts = () => {
    LoopringAPI.contactAPI!.getContacts({
      isHebao: false,
      accountId
    }, apiKey)
    .then(x => {
      const displayContacts = x.contacts.map(xx => {
        return {
          name: xx.contactName,
          address: xx.contactAddress,
          avatarURL: createImageFromInitials(32, xx.contactName, '#FFC178'),
          editing: false,
          addressType: xx.addressType
        } as DisplayContact
      })
      setContacts(displayContacts)
    })
  }
  useEffect(loadContacts, [])
  
  const onChangeSearch = React.useCallback((input: string) => {
    setSearchValue(input)
  },[])
  const onClearSearch = React.useCallback(() => {
    setSearchValue('')
  },[])
  const onClickEditing = React.useCallback((address: string) => {
    setContacts(
      contacts.map(x => {
        return {
          ...x,
          editing: x.address === address
        }
      })
    )
  },[contacts])
  const onClickDelete = React.useCallback((address: string, name: string) => {
    setDeleteInfo({
      open: true,
      selected: {
        address,
        name
      }
    })
  },[])
  const onCloseDelete = React.useCallback(() => {
    setDeleteInfo({
      open: false,
      selected: undefined
    })
  },[])
  
  const onClickSend = React.useCallback((address: string, name: string, addressType: AddressType) => {
    setSendInfo({
      open: true,
      selected: {
        address,
        name,
        addressType
      }
    })
  },[])
  const onCloseSend = React.useCallback(() => {
    setSendInfo({
      open: false,
      selected: undefined
    })
  },[])
  const [toastInfo, setToastInfo] = React.useState({
    open: false,
    isSuccess: undefined as boolean | undefined,
    type: undefined as 'Add' | 'Delete' | 'Edit' | 'Send' | undefined,
  });
  
  const onInputBlue = React.useCallback((address: string) => {
    setContacts(
      contacts.map(x => {
        return {
          ...x,
          editing: false
        }
      })
    )
    const found = contacts.find(x => x.address === address)!
    LoopringAPI.contactAPI!.updateContact({
      contactAddress: address,
      isHebao: false, // todo
      contactName: found.name,
      accountId,
    }, apiKey)
    .then(x => {
      setToastInfo({
        open: true,
        isSuccess: true,
        type: 'Edit'
      })
      // alert(JSON.stringify(x))
    })
    // found?.name
  },[contacts])
  const onChangeInput = React.useCallback((address: string, inputValue) => {
    setContacts(
      contacts.map(x => {
        return {
          ...x,
          name: x.address === address 
            ? inputValue
            : x.name
        }
      })
    )
  },[contacts])
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  

  const onCloseToast = React.useCallback(() => {
    setToastInfo({
      open: false,
      isSuccess: undefined,
      type: undefined
    })
  }, [])
  const submitDeleteContact = React.useCallback((address: string, name: string) => {
    setDeleteLoading(true)
    LoopringAPI.contactAPI!.deleteContact({
      accountId,
      isHebao: false,//todo
      contactAddress: address,
      contactName: name,
    }, apiKey)
    .then(() => {
      loadContacts()
      setToastInfo({
        open: true,
        isSuccess: true,
        type: 'Delete'
      })
      setDeleteInfo({
        open: false,
        selected: undefined
      })

    })
    .finally(() => {
      setDeleteLoading(false)
    })
   
  }, [])
  const [addLoading, setAddLoading] = React.useState(false);
  const submitAddContact = React.useCallback((address: string, name: string) => {
    setAddLoading(true)
    LoopringAPI.contactAPI!.createContact({
      accountId,
      isHebao: false,//todo
      contactAddress: address,
      contactName: name,
    }, apiKey)
    .then(() => {
      loadContacts()
      setToastInfo({
        open: true,
        isSuccess: true,
        type: 'Add'
      })
      setAddOpen(false)
    })
    .finally(() => {
      setAddLoading(false)
    })
   
  }, [])
  return {
    contacts: contacts.filter(x => {
      return searchValue !== ''
        ? x.address.toLowerCase().includes(searchValue.toLowerCase()) || x.name.toLowerCase().includes(searchValue.toLowerCase())
        : true
    }),
    onClickEditing,
    onChangeInput,
    onInputBlue,
    onChangeSearch,
    onClearSearch,
    searchValue,
    toastInfo,
    onCloseToast,
    
    onClickDelete,
    deleteInfo,
    onCloseDelete,
    submitDeleteContact,
    deleteLoading,

    addOpen, 
    setAddOpen,
    addLoading,
    submitAddContact,

    onClickSend,
    onCloseSend,
    sendInfo,
  }
}
export const useContactAdd = () => {
  const [addLoading, setAddLoading] = React.useState(false);
  const [addAddress, setAddAddress] = React.useState('');
  const [addName, setAddName] = React.useState('');
  const [toastStatus, setToastStatus] = React.useState('Succuss' as 'Succuss' | 'Error' | 'Init');
  const addShowInvalidAddress = addAddress !== ''
    ? !utils.isAddress(addAddress)
    : false
  const addButtonDisable = !utils.isAddress(addAddress) || addName === ''
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const submitAddingContact = React.useCallback((address: string, name: string) => {
    setAddLoading(true)
    LoopringAPI.contactAPI!.createContact({
      accountId,
      isHebao: false,//todo
      contactAddress: address,
      contactName: name,
    }, apiKey)
    .then(x => {
      setToastStatus("Succuss")
      // todo 隐藏弹窗
    })
    .finally(() => {
      setAddLoading(false)
    })
  }, [])

  return {
    addLoading,
    setAddLoading,
    addAddress,
    setAddAddress,
    addName,
    setAddName,
    toastStatus,
    setToastStatus,
    addShowInvalidAddress,
    addButtonDisable,
    submitAddingContact,
  }
};
// export const useContactDelete = () => {
//   const [loading, setLoading] = React.useState(false);
//   const [toastStatus, setToastStatus] = React.useState('Succuss' as 'Succuss' | 'Error' | 'Init');
//   const {
//     account: { accountId, apiKey },
//   } = useAccount();
//   const submitDeleteContact = React.useCallback((address: string, name: string) => {
//     setLoading(true)
//     LoopringAPI.contactAPI!.deleteContact({
//       accountId,
//       isHebao: false,//todo
//       contactAddress: address,
//       contactName: name,
//     }, apiKey)
//     .then(x => {
//       setToastStatus("Succuss")
//       // todo 隐藏弹窗
//     })
//     .finally(() => {
//       setLoading(false)
//     })
   
//   }, [])
//   return {
//     loading,
//     toastStatus, 
//     setToastStatus,
//     submitDeleteContact    
//   }
// };

export const useContactSend = () => {
  const [sendNetwork, setSendNetwork] = React.useState('L1' as Network);
  const { setShowTransfer, setShowWithdraw } = useOpenModals()
  const submitSendingContact = React.useCallback((contact: Contact, network: Network) => {
    if (network === 'L1') {
      setShowWithdraw({
        isShow: true,
        address: contact.address,
        name: contact.name,
        symbol: "ETH"
      })
    } else {
      setShowTransfer({
        isShow: true,
        address: contact.address,
        name: contact.name,
        symbol: "ETH"
      })
    }
  }, [])


  return {

    submitSendingContact,
    sendNetwork, 
    setSendNetwork
  }
};

type TxsFilterProps = {
  // accountId: number;
  tokenSymbol?: string;
  start?: number;
  end?: number;
  offset?: number;
  limit?: number;
  types?: sdk.UserTxTypes[] | string;
};

export function useTransactions() {
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const { tokenMap } = store.getState().tokenMap;
  const { t } = useTranslation(["error"]);
  const [txs, setTxs] = useState<RawDataTransactionItem[]>([]);
  const [txsTotal, setTxsTotal] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  // const [showLoading, setShowLoading] = user(false);
  const routeMatch = useRouteMatch()
  // routeMatch.params[0]
  // debugger

  const getTxnStatus = (status: string) =>
    status === ""
      ? TransactionStatus.processing
      : status === "processed"
      ? TransactionStatus.processed
      : status === "processing"
      ? TransactionStatus.processing
      : status === "received"
      ? TransactionStatus.received
      : TransactionStatus.failed;

  const getUserTxnList = useCallback(
    async ({
      tokenSymbol,
      start,
      end,
      limit,
      offset,
      types,
    }: TxsFilterProps) => {

      const address = routeMatch.params[0]
      const tokenId = tokenSymbol ? tokenMap[tokenSymbol!].tokenId : undefined
      const response = await LoopringAPI.userAPI!.getUserBills({
        accountId,
        tokenSymbol,
        tokenId,
        fromAddress: address,
        transferAddress: address,
        start,
        end,
        limit,
        offset,
        // @ts-ignore
        billType: '1,2,4'
      }, apiKey)
      if (
        (response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message
      ) {
        const errorItem =
          SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
        // setToastOpen({
        //   open: true,
        //   type: "error",
        //   content:
        //     "error : " + errorItem
        //       ? t(errorItem.messageKey)
        //       : (response as sdk.RESULT_INFO).message,
        // });
      } else {
        const formattedList: RawDataTransactionItem[] = (response as any).raw_data.bills.map(
          (o: any) => {
            const feePrecision = tokenMap
              ? tokenMap[o.tokenF].precision
              : undefined;
            return {
              ...o,
              txType: o.billType,
              side: o.billType as any,
              amount: {
                unit: o.token || "",
                value: Number(volumeToCount(o.token, o.amount)),
              },
              fee: {
                unit: o.tokenF || "",
                value: Number(
                  volumeToCountAsBigNumber(o.tokenF, o.amountF || 0)
                ),
              },
              memo: o.memo || "",
              time: o.timestamp,
              txnHash: o.hash,
              status: getTxnStatus(o.status),
              feePrecision: feePrecision,
              receiverAddress: o.to,
              senderAddress: o.from,
            } as RawDataTransactionItem;
          }
        );
        setTxs(formattedList);
        
        setTxsTotal(response.totalNum);
        setShowLoading(false);
      }
      // .then(x => {
        
      //   debugger
      // })
      // .catch(x => {
      //   debugger
      // })

      // if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
      //   setShowLoading(true);
      //   const response = await LoopringAPI.userAPI.getUserTxs(
      //     {
      //       accountId,
      //       limit,
      //       tokenSymbol,
      //       start,
      //       end,
      //       offset,
      //       types,
      //     },
      //     apiKey
      //   );
      //   if (
      //     (response as sdk.RESULT_INFO).code ||
      //     (response as sdk.RESULT_INFO).message
      //   ) {
      //     const errorItem =
      //       SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
      //     setToastOpen({
      //       open: true,
      //       type: "error",
      //       content:
      //         "error : " + errorItem
      //           ? t(errorItem.messageKey)
      //           : (response as sdk.RESULT_INFO).message,
      //     });
      //   } else {
      //     const formattedList: RawDataTransactionItem[] = response.userTxs.map(
      //       (o) => {
      //         const feePrecision = tokenMap
      //           ? tokenMap[o.feeTokenSymbol].precision
      //           : undefined;
      //         return {
      //           ...o,
      //           side: o.txType as any,
      //           amount: {
      //             unit: o.symbol || "",
      //             value: Number(volumeToCount(o.symbol, o.amount)),
      //           },
      //           fee: {
      //             unit: o.feeTokenSymbol || "",
      //             value: Number(
      //               volumeToCountAsBigNumber(o.feeTokenSymbol, o.feeAmount || 0)
      //             ),
      //           },
      //           memo: o.memo || "",
      //           time: o.timestamp,
      //           txnHash: o.hash,
      //           status: getTxnStatus(o.status),
      //           feePrecision: feePrecision,
      //         } as RawDataTransactionItem;
      //       }
      //     );
      //     setTxs(formattedList);
      //     setTxsTotal(response.totalNum);
      //     setShowLoading(false);
      //   }
      // }
    },
    [accountId, apiKey, t, tokenMap]
  );

  return {
    txs,
    txsTotal,
    showLoading,
    getUserTxnList,
  };
}

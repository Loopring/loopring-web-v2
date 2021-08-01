// export async function connect(accounts:Array<string>,provider:Web3Provider){
//    // store.getState()
//    const accAddress =  accounts[0];
//    // store.dispatch()
//     // @ts-ignore
//     const  accInfo = (await LoopringAPI.exchangeAPI.getAccount({
//         owner: accAddress
//     })).accInfo
//    return  {
//             accAddress: accAddress,
//             readyState: AccountStatus,
//             accountId: '',
//             apiKey: '',
//             eddsaKey: '',
//             connectName: ConnectProviders.UnKnow,
//             status: 'UNSET',
//             errorMessage: null,
//     }
// }
// export function useConnect() {
//
//     // const {
//     //     activate,
//     // } = useActiveWeb3React()
//     //
//     // const { sendEvent } = useStateMachine()
//     //
//     // const dispatch = useDispatch()
//
//     // const [activatingConnector, setActivatingConnector] = useState<any>()
//
//     const connect = useCallback((item_name: ConnectorNames, isSwitch: boolean = false) => {
//
//         if (isSwitch) {
//             myLog('try Connecting... isSwitch Reset')
//             // sendEvent(store.getState().account, StatusChangeEvent.Reset)
//         }
//
//         const newConnector: any = connectorsByName[item_name]
//         myLog('newConnector:', newConnector)
//         setActivatingConnector(newConnector)
//         activate(newConnector)
//         // dispatch(setConnectNameTemp(item_name))
//
//         //sendEvent(store.getState().account, StatusChangeEvent.Connecting)
//
//         myLog('store.getState().account.status:', store.getState().account.status)
//
//     }, [activate, dispatch, sendEvent])
//
//     return {
//         connect,
//         activatingConnector,
//     }
//
// }
//
// export function useDisconnect() {
//
//     const {
//         deactivate,
//     } = useActiveWeb3React()
//
//     const dispatch = useDispatch()
//
//     const disconnect = useCallback(() => {
//         deactivate()
//         dispatch(reset(undefined))
//     }, [deactivate, dispatch])
//
//     return {
//         disconnect,
//     }
//
// }
//
// export function useUnlock() {
//
//     const dispatch = useDispatch()
//
//     const { chainId } = useWeb3Account()
//
//     const { connector, } = useWeb3Account()
//
//     const { sendEvent } = useStateMachine()
//
//     const { resetLayer2 } = useWalletLayer2()
//
//     const lock = useCallback(async (account: Lv2Account) => {
//         resetLayer2()
//         sendEvent(account, StatusChangeEvent.Lock)
//     }, [sendEvent, resetLayer2])
//
//     const exchangeInfo = useSelector((state: RootState) => state.system.exchangeInfo)
//
//     const unlock = useCallback(async (account: Lv2Account) => {
//
//             if (!LoopringAPI.userAPI || !LoopringAPI.exchangeAPI || !connector
//                 || !account.accountId || !exchangeInfo?.exchangeAddress
//                 || !chainId
//                 || account.status !== AccountStatus.LOCKED) {
//                 return
//             }
//
//             if (account.status !== AccountStatus.LOCKED) {
//                 throw Error('unexpected status:' + account.status)
//             }
//
//             myLog('try to unlock!', account)
//
//             let event = undefined
//             let sk = undefined
//             let apikey: any = undefined
//
//             const provider = await connector.getProvider()
//             const web3 = new Web3(provider as any)
//
//             try {
//
//                 const nonce = account.nonce - 1 < 0 ? 0 : account.nonce - 1
//                 myLog('try to unlock! nonce:', nonce)
//
//                 if (!account.eddsaKey) {
//                     const eddsaKey = await sign_tools
//                         .generateKeyPair(
//                             web3,
//                             account.accAddr,
//                             exchangeInfo?.exchangeAddress,
//                             nonce,
//                             account.connectName,
//                         )
//                     sk = eddsaKey.sk
//                 } else {
//                     sk = account.eddsaKey
//                 }
//
//                 myLog('useUnlock account:', account, ' sk:', sk)
//
//                 apikey = await LoopringAPI.userAPI.getUserApiKey({
//                     accountId: account.accountId
//                 }, sk)
//
//                 event = StatusChangeEvent.Unlock
//
//             } catch (reason) {
//                 myLog('got :', reason)
//                 dumpError400(reason)
//                 if (reason?.response?.data?.resultInfo?.code === 100001) {
//
//                     try {
//
//                         // const req: GetOffchainFeeAmtRequest = {
//                         //     accountId: account.accountId,
//                         //     requestType: OffchainFeeReqType.UPDATE_ACCOUNT,
//                         // }
//
//                         // const response = await userApi.getOffchainFeeAmt(req, account.apiKey)
//
//                         const feeMap = {
//                             'ETH': '529000000000000',
//                             'LRC': '34000000000000000000',
//                             'USDT': '7850000',
//                             'DAI': '98100000000000000000',
//                         }
//
//                         const eddsaKey = await sign_tools
//                             .generateKeyPair(
//                                 web3,
//                                 account.accAddr,
//                                 exchangeInfo?.exchangeAddress,
//                                 account.nonce,
//                                 account.connectName,
//                             )
//
//                         const request: UpdateAccountRequestV3 = {
//                             exchange: exchangeInfo?.exchangeAddress,
//                             owner: account.accAddr,
//                             accountId: account.accountId,
//                             publicKey: { x: eddsaKey.formatedPx, y: eddsaKey.formatedPy },
//                             maxFee: { tokenId: 0, volume: feeMap['ETH'] },
//                             validUntil: VALID_UNTIL,
//                             nonce: account.nonce,
//                         }
//
//                         const updateAccountResponse = await LoopringAPI.userAPI.updateAccount(request, web3,
//                             chainId, account.connectName, false)
//
//                         myLog('updateAccountResponse:', updateAccountResponse)
//
//                         await sleep(1000)
//
//                     } catch (reason2) {
//                         dumpError400(reason2)
//                     }
//                 }
//                 event = StatusChangeEvent.Reset
//             }
//
//             if (sk) {
//                 dispatch(setEddsaKey(sk))
//             }
//
//             if (apikey?.apiKey) {
//                 dispatch(setApikey(apikey.apiKey))
//             }
//
//             if (event) {
//                 sendEvent(account, event)
//             }
//
//         }
//         , [dispatch, sendEvent, connector, chainId, exchangeInfo?.exchangeAddress])
//
//     return {
//         lock,
//         unlock,
//     }
// }

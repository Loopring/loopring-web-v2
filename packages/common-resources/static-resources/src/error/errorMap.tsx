import { Trans } from 'react-i18next'
import { Link } from '@mui/material'

export const ErrorMap = {
  ERROR_UNKNOWN: {
    id: 'ERROR_UNKNOWN',
    messageKey: 'errorUnknown',
  },
  ERROR_ON_FROM_SUBMIT: {
    id: 'ERROR_ON_FROM_SUBMIT',
    messageKey: 'errorOnFromSubmit',
  },
  ERROR_WRONG_ACCOUNT: {
    id: 'ERROR_WRONG_ACCOUNT',
    messageKey: 'errorWrongAccount',
  },
  ERROR_WRONG_TOKEN: {
    id: 'ERROR_WRONG_TOKEN',
    messageKey: 'errorWrongToken',
  },
  ERROR_WRONG_APIKEY: {
    id: 'ERROR_WRONG_APIKEY',
    messageKey: 'errorWrongApikey',
  },
  ERROR_WRONG_BALANCE: {
    id: 'ERROR_WRONG_BALANCE',
    messageKey: 'errorWrongBalance',
  },
  ERROR_WRONG_MIN: {
    id: 'ERROR_WRONG_BALANCE',
    messageKey: 'errorWrongBalance',
  },
  ERROR_MINIMUM_ORDER: {
    id: 'ERROR_MINIMUM_ORDER',
    messageKey: 'errorMinimumOrder',
  },
  ERROR_MAXIMUM_ORDER: {
    id: 'ERROR_MAXIMUM_ORDER',
    messageKey: 'errorMaximumOrder',
  },
  ERROR_ON_FROZEN: {
    id: 'ERROR_ON_FROZEN',
    messageKey: 'errorOnFrozen',
  },
  ERROR_ON_FEE: {
    id: 'ERROR_ON_FEE',
    messageKey: 'errorAboutFee',
  },
  ERROR_PROVIDER_ERROR: {
    id: 'ERROR_PROVIDER_ERROR',
    messageKey: 'errorProviderError',
    options: {},
  },
  ERROR_ON_STORAGE_ID: {
    id: 'ERROR_ON_STORAGE_ID',
    messageKey: 'errorOnStorageId',
    options: {},
  },
  ERROR_ON_NO_RECIPIENT: {
    id: 'ERROR_ON_NO_RECIPIENT',
    messageKey: 'errorOnNoRecipient',
    options: {},
  },
  ERROR_INVALID_HASH: {
    id: 'ERROR_INVALID_HASH',
    messageKey: 'errorInvalidHash',
    options: {},
  },
  ERROR_ON_CANCEL_ORDERS: {
    id: 'ERROR_ON_CANCEL_ORDERS',
    messageKey: 'errorOnCancelOrders',
    options: {},
  },
  ERROR_ON_GAS: {
    id: 'ERROR_ON_GAS',
    messageKey: 'errorOnGas',
    options: {},
  },
  ERROR_NO_MARKET: {
    id: 'ERROR_NO_MARKET',
    messageKey: 'errorNoMarket',
    options: {},
  },
  ERROR_INVALID_ORDER_ID: {
    id: 'ERROR_INVALID_ORDER_ID',
    messageKey: 'errorInvalidOrderId',
    options: {},
  },
  ERROR_ON_RATE: {
    id: 'ERROR_ON_RATE',
    messageKey: 'errorOnRate',
    options: {},
  },
  ERROR_FOR_EXIST_ORDER: {
    id: 'ERROR_FOR_EXIST_ORDER',
    messageKey: 'errorForExistOrder',
    options: {},
  },
  ERROR_ORDER_EXPIRED: {
    id: 'ERROR_ORDER_EXPIRED',
    messageKey: 'errorOrderExpired',
    options: {},
  },
  LOADING_WHOLE_SITE: {
    id: 'LOADING_WHOLE_SITE',
    messageKey: 'errorLoading',
  },
  NO_SUPPORT_PAIR: {
    id: 'NO_SUPPORT_PAIR',
    messageKey: 'no support base/quote pair!',
  },
  NO_SDK: {
    id: 'NO_SDK',
    messageKey: 'errorBase',
  },
  TIME_OUT: {
    id: 'TIME_OUT',
    messageKey: 'errorTimeout',
  },
  NO_NETWORK_ERROR: {
    id: 'NO_NETWORK_ERROR',
    messageKey: 'errorMessageNoNetwork',
  },
  NO_TOKEN_MAP: {
    id: 'NO_TOKEN_MAP',
    messageKey: 'errorMessageTokenMapIsEmpty',
  },
  NO_ENOUGH_BALANCE: {
    id: 'NO_ENOUGH_BALANCE',
    messageKey: 'errorTokenNotEnough',
  },
  NO_TOKEN_KEY_LIST: {
    id: 'NO_TOKEN_KEY_LIST',
    messageKey: 'errorRequiredTokenKeyList',
  },
  GET_X_TOKEN_TICKER_ERROR: {
    id: 'NO_TOKEN_KEY_LIST',
    messageKey: 'errorRequiredTokenKeyList',
    options: {},
  },
  BUILD_AMM_MAP_WITH_TICKER: {
    id: 'BUILD_AMM_MAP_WITH_TICKER',
    messageKey: 'errorBase',
    options: {},
  },
  TRADE_LITE_SET_PAIR_ERROR: {
    id: 'TRADE_LITE_SET_PAIR_ERROR',
    messageKey: 'errorBase',
    options: {},
  },
  SOCKET_ERROR: {
    id: 'SOCKET_ERROR',
    messageKey: 'errorBase',
    options: {},
  },
  TRADE_404: {
    id: '404',
    messageKey: 'error404',
    options: {},
  },
  NTF_ID_ENCODE_ERROR: {
    id: 'NTF_ID_ENCODE_ERROR',
    messageKey: 'NTF_ID_ENCODE_ERROR',
    options: {},
  },
  PROVIDER_ERROR: {
    id: 'PROVIDER_ERROR',
    messageKey: 'errorDisableOtherWalletForCurrent',
    options: {},
  },
  GENERATE_EDDSA: {
    id: 'GENERATE_EDDSA',
    messageKey: 'errorGenerateEddsa',
    options: {},
  },
  DATA_NOT_READY: {
    id: 'DATA_NOT_READY',
    messageKey: 'errorDataNotReady',
    options: {},
  },
  PROVIDER_NOT_INSTALL_GME: {
    id: 'PROVIDER_NOT_INSTALL_GME',
    messageKey: 'errorNotInstallGME',
    options: {
      link: (
        <Trans i18nKey={'errorLinKWalletApp'} ns={'error'}>
          <Link
            target='_blank'
            rel='noopener noreferrer'
            href={'https://wallet.gamestop.com/wallets'}
          >
            app market
          </Link>
        </Trans>
      ),
    },
  },
  NO_IPFS_INSTANCE: {
    id: 'NO_IPFS_INSTANCE',
    messageKey: 'errorNoIpfsInstance',
    options: {},
  },
  ADD_IPFS_ERROR: {
    id: 'ADD_IPFS_ERROR',
    messageKey: 'errorAddIpfsError',
    options: {},
  },
  CREATE_IPFS_ERROR: {
    id: 'CREATE_IPFS_ERROR',
    messageKey: 'errorCreateIpfsError',
    options: {},
  },
  NOT_SAME_IPFS_RESOURCE: {
    id: 'NOT_SAME_IPFS_RESOURCE',
    messageKey: 'errorNotSameIpfsResource',
    options: {},
  },
  IPFS_CID_TO_NFTID_ERROR: {
    id: 'IPFS_CID_TO_NFTID_ERROR',
    messageKey: 'errorIpfsDidToNftidError',
    options: {},
  },
  ERROR_MINT_OVERLAP: {
    id: 'ERROR_MINT_OVERLAP',
    messageKey: 'errorMintOverlap',
    options: {},
  },
  ERROR_JSON_STRINGIFY: {
    id: 'ERROR_JSON_STRINGIFY',
    messageKey: 'errorJSONStringify',
    options: {},
  },
  ERROR_COLLECTION_METADATA_NO_TILEURI: {
    id: 'ERROR_COLLECTION_METADATA_NO_TILEURI',
    messageKey: 'errorCollectionMetadataNoTileUri',
    options: {},
  },
  ERROR_COLLECTION_NO_NAME: {
    id: 'ERROR_COLLECTION_NO_NAME',
    messageKey: 'errorCollectionNoName',
    options: {},
  },
  ERROR_COLLECTION_SAME_NAME: {
    id: 'ERROR_COLLECTION_SAME_NAME',
    messageKey: 'errorCollectionSameName',
    options: {},
  },
  ERROR_COLLECTION_EMPTY: {
    id: 'ERROR_COLLECTION_EMPTY',
    messageKey: 'errorCollectionEmpty',
    options: {},
  },
  ERROR_COLLECTION_NOT_READABLE: {
    id: 'ERROR_COLLECTION_NOT_READABLE',
    messageKey: 'errorCollectionNotReadable',
    options: {},
  },
  ERROR_COLLECTION_INFO: {
    id: 'ERROR_COLLECTION_INFO',
    messageKey: 'errorCollectionInfo',
    options: {},
  },
  ERROR_COLLECTION_NO_SUPPORT: {
    id: 'ERROR_COLLECTION_NO_SUPPORT',
    messageKey: 'errorCollectionNoSupport',
    options: {},
  },
  ERROR_ON_REFRESH: {
    id: 'ERROR_ON_REFRESH',
    messageKey: 'errorOnRefresh',
    options: {},
  },
  IPFS_TIME_OUT: {
    id: 'IPFS_TIME_OUT',
    messageKey: 'errorIpfsTimeout',
  },
  ERROR_RAMP_NO_INSTANCE: {
    id: 'ERROR_RAMP_NO_INSTANCE',
    messageKey: 'errorRampNoInstance',
    options: {},
  },
  ERROR_DUAL_EXPIRED: {
    id: 'ERROR_DUAL_EXPIRED',
    messageKey: 'errorDualExpired',
    options: {},
  },
  ERROR_PRIVATE_KEY: {
    id: 'ERROR_PRIVATE_KEY',
    messageKey: 'errorPrivateKey',
    options: {},
  },
  ERROR_NO_RESPONSE: {
    id: 'ERROR_NO_RESPONSE',
    messageKey: 'errorNoResponse',
    options: {},
  },
  ERROR_REDPACKET_EMPTY: {
    id: 'ERROR_REDPACKET_EMPTY',
    messageKey: 'errorRedpacketEmpty',
    options: {},
  },
  ERROR_REDPACKET_CLAIMED: {
    id: 'ERROR_REDPACKET_CLAIMED',
    messageKey: 'errorRedpacketClaimed',
    options: {},
  },
  ERROR_REDPACKET_CLAIM_OUT: {
    id: 'ERROR_REDPACKET_CLAIM_OUT',
    messageKey: 'errorRedpacketClaimOut',
    options: {},
  },
  ERROR_REDPACKET_CLAIM_TIMEOUT: {
    id: 'ERROR_REDPACKET_CLAIM_TIMEOUT',
    messageKey: 'errorRedpacketClaimTimeOut',
    options: {},
  },
  ERROR_OFF_RAMP_EXPIRED: {
    id: 'ERROR_OFF_RAMP_EXPIRED',
    messageKey: 'errorOffRampExpired',
  },
  PROVIDER_ERROR_UNKNOWN: {
    id: 'PROVIDER_ERROR_UNKNOWN',
    messageKey: 'errorProviderErrorUnknown',
  },
  GUARDIAN_ROUTER_ERROR: {
    id: 'GUARDIAN_ROUTER_ERROR',
    messageKey: 'errorGuardianRouterError',
  },
  ERROR_ADDRESS_CHECK_ERROR: {
    id: 'ERROR_ADDRESS_CHECK_ERROR',
    messageKey: 'errorAddressCheckError',
  },
  ERROR_SWITCH_ETHEREUM: {
    id: 'ERROR_SWITCH_ETHEREUM',
    messageKey: 'errorSwitchEthereum',
  },
  ERROR_NO_GAMESTOP_EXTENSION: {
    id: 'ERROR_NO_GAMESTOP_EXTENSION',
    messageKey: 'errorNoGamestopExtension',
  },
  ERROR_ETHEREUM_NOT_METAMASK: {
    id: 'ERROR_ETHEREUM_NOT_METAMASK',
    messageKey: 'errorEthereumNotMetamask',
  },
  ERROR_GAMESTOP_NO_CHAIN_CHANGE: {
    id: 'ERROR_GAMESTOP_NO_CHAIN_CHANGE',
    messageKey: 'errorGamestopNoChainChange',
  },
}

export enum UIERROR_CODE {
  NO_NETWORK_ERROR = 700000,
  UNKNOWN = 700001,
  PROVIDER_ERROR = 700002,
  PROVIDER_ERROR_UNKNOWN = 700003,
  PROVIDER_NOT_INSTALL_GME = 700004,
  DATA_NOT_READY = 700005,
  GENERATE_EDDSA = 700006,
  NO_IPFS_INSTANCE = 700007,
  ADD_IPFS_ERROR = 700008,
  CREATE_IPFS_ERROR = 700009,
  NOT_SAME_IPFS_RESOURCE = 700010,
  IPFS_CID_TO_NFTID_ERROR = 700011,
  TIME_OUT = 700012,
  ERROR_JSON_STRINGIFY = 700013,
  ERROR_COLLECTION_METADATA_NO_TILEURI = 700014,
  ERROR_COLLECTION_NO_NAME = 700015,
  ERROR_COLLECTION_INFO = 700016,
  ERROR_COLLECTION_EMPTY = 700017,
  ERROR_COLLECTION_NO_SUPPORT = 700018,
  ERROR_COLLECTION_NOT_READABLE = 700019,
  IPFS_TIME_OUT = 700020,
  ERROR_ON_FEE_UI = 700021,
  ERROR_PRIVATE_KEY = 700022,
  ERROR_NO_RESPONSE = 700023,
  ERROR_REDPACKET_EMPTY = 700024,
  ERROR_RAMP_NO_INSTANCE = 700100,
  ERROR_OFF_RAMP_EXPIRED = 700101,
  ERROR_ADDRESS_CHECK_ERROR = 700102,

  ERROR_WALLECTCONNECT_MANUALLY_CLOSE = 700201,
  ERROR_GAMESTOP_NO_CHAIN_CHANGE = 700202,
  ERROR_DUAL_EXPIRED = 115003,
  ERROR_REDPACKET_CLAIMED = 113002,
  ERROR_REDPACKET_CLAIM_OUT = 113006,
  ERROR_REDPACKET_CLAIM_TIMEOUT = 113000,
  ERROR_SWITCH_ETHEREUM = 700202,
  ERROR_NO_GAMESTOP_EXTENSION = 700203,
  ERROR_ETHEREUM_NOT_METAMASK = 700204,
}

export type ErrorObject = {
  from?: string
  timestamp?: number
  messageKey: string
  [key: string]: any
}
export const SDK_ERROR_MAP_TO_UI = {
  700000: ErrorMap.NO_NETWORK_ERROR,
  700001: ErrorMap.ERROR_UNKNOWN, //UI Unknown error =>
  700002: ErrorMap.ERROR_PROVIDER_ERROR,
  700003: ErrorMap.PROVIDER_ERROR_UNKNOWN,
  700004: ErrorMap.PROVIDER_NOT_INSTALL_GME,
  700005: ErrorMap.DATA_NOT_READY,
  700006: ErrorMap.GENERATE_EDDSA,
  700007: ErrorMap.NO_IPFS_INSTANCE,
  700008: ErrorMap.ADD_IPFS_ERROR,
  700009: ErrorMap.CREATE_IPFS_ERROR,
  700010: ErrorMap.NOT_SAME_IPFS_RESOURCE,
  700011: ErrorMap.IPFS_CID_TO_NFTID_ERROR,
  700012: ErrorMap.TIME_OUT,
  700013: ErrorMap.ERROR_JSON_STRINGIFY,
  700014: ErrorMap.ERROR_COLLECTION_METADATA_NO_TILEURI,
  700015: ErrorMap.ERROR_COLLECTION_NO_NAME,
  700016: ErrorMap.ERROR_COLLECTION_INFO,
  700017: ErrorMap.ERROR_COLLECTION_EMPTY,
  700018: ErrorMap.ERROR_COLLECTION_NO_SUPPORT,
  700019: ErrorMap.ERROR_COLLECTION_NOT_READABLE,
  700020: ErrorMap.IPFS_TIME_OUT,
  700021: ErrorMap.ERROR_ON_FEE,
  700022: ErrorMap.ERROR_PRIVATE_KEY,
  700023: ErrorMap.ERROR_NO_RESPONSE,
  700024: ErrorMap.ERROR_REDPACKET_EMPTY,
  700100: ErrorMap.ERROR_RAMP_NO_INSTANCE,
  700101: ErrorMap.ERROR_OFF_RAMP_EXPIRED,
  700102: ErrorMap.ERROR_ADDRESS_CHECK_ERROR,
  700202: ErrorMap.ERROR_SWITCH_ETHEREUM,
  700203: ErrorMap.ERROR_NO_GAMESTOP_EXTENSION,
  700204: ErrorMap.ERROR_ETHEREUM_NOT_METAMASK,
  100000: ErrorMap.ERROR_UNKNOWN, //Unknown error =>
  100001: ErrorMap.ERROR_ON_FROM_SUBMIT, //Invalid argument
  101001: ErrorMap.ERROR_WRONG_ACCOUNT, //The address was not found
  101002: ErrorMap.ERROR_WRONG_ACCOUNT, //User not found
  102001: ErrorMap.ERROR_ON_FROM_SUBMIT, //Exchange ID is incorrect
  102002: ErrorMap.ERROR_WRONG_TOKEN, //Unsupported TokenId in the order
  102003: ErrorMap.ERROR_WRONG_ACCOUNT, //Invalid account ID
  102004: ErrorMap.ERROR_INVALID_ORDER_ID, //Invalid order ID
  102005: ErrorMap.ERROR_NO_MARKET, //Market does not support
  102006: ErrorMap.ERROR_ON_RATE, //Illegal rate field
  102007: ErrorMap.ERROR_FOR_EXIST_ORDER, //Order already exists
  102008: ErrorMap.ERROR_ORDER_EXPIRED, //Order has expired
  102010: ErrorMap.ERROR_WRONG_APIKEY, //Order is missing signature information
  102011: ErrorMap.ERROR_WRONG_BALANCE, //Insufficient user balance
  102012: ErrorMap.ERROR_MINIMUM_ORDER, //The order amount is too small
  102014: ErrorMap.ERROR_ON_FROZEN, //Failed to freeze the amount, please try again later
  102020: ErrorMap.ERROR_MAXIMUM_ORDER, //Exceeded the maximum order amount
  102021: ErrorMap.ERROR_ON_FROM_SUBMIT, //	Nonce is invalid
  102022: ErrorMap.ERROR_ON_FROM_SUBMIT, //Transfer sender is invalid
  102023: ErrorMap.ERROR_ON_FROM_SUBMIT, //Transfer receiver is invalid
  102024: ErrorMap.ERROR_ON_FEE, //Fee token is unsupported
  102025: ErrorMap.ERROR_ON_FEE, //Fee token is unsupported//Transfer token isnt consistent with fee token
  102027: ErrorMap.ERROR_ON_FROM_SUBMIT, //Submit order failed
  102028: ErrorMap.ERROR_ON_STORAGE_ID, //No Available storage id
  102030: ErrorMap.ERROR_ON_STORAGE_ID, //Invalid storage id
  102032: ErrorMap.ERROR_ON_NO_RECIPIENT, //Invalid recipient
  102117: ErrorMap.ERROR_ON_CANCEL_ORDERS, //No orders to cancel
  102118: ErrorMap.ERROR_ON_CANCEL_ORDERS, //Failed to cancel orders, please try again later
  102119: ErrorMap.ERROR_INVALID_HASH, //Invalid hash
  102120: ErrorMap.ERROR_ON_FROM_SUBMIT, //Order is not valid
  102122: ErrorMap.ERROR_ON_CANCEL_ORDERS, //Order already in cancel
  104001: ErrorMap.ERROR_WRONG_APIKEY, //Empty ApiKey
  102040: ErrorMap.ERROR_MINT_OVERLAP, //mint record with the same nft token address and token id already exists
  104002: ErrorMap.ERROR_WRONG_APIKEY, //Invalid ApiKey
  104003: ErrorMap.ERROR_WRONG_ACCOUNT, //Invalid Account ID
  104004: ErrorMap.ERROR_ON_FROM_SUBMIT, //No signature information provided
  104005: ErrorMap.ERROR_ON_FROM_SUBMIT, //Wrong signature information
  104208: ErrorMap.ERROR_UNKNOWN, //Unknown error in Ethereum node
  104209: ErrorMap.ERROR_UNKNOWN, //Partial batch operation failed
  105001: ErrorMap.ERROR_ON_GAS, //Failed to get recommended gas
  107001: ErrorMap.ERROR_WRONG_ACCOUNT, //User ID cannot be empty
  107002: ErrorMap.ERROR_INVALID_HASH, //Order Hash cannot be empty
  107003: ErrorMap.ERROR_ON_FROM_SUBMIT, //Order does not exist
  108000: ErrorMap.ERROR_NO_MARKET, //Unsupported market
  102127: ErrorMap.ERROR_COLLECTION_SAME_NAME,
  108001: ErrorMap.ERROR_ON_FROM_SUBMIT, //Unsupported depth level
  113002: ErrorMap.ERROR_REDPACKET_CLAIMED, // REDPACKET_CLAIMED
  113006: ErrorMap.ERROR_REDPACKET_CLAIM_OUT, // REDPACKET_COUNT_OUT
  113000: ErrorMap.ERROR_REDPACKET_CLAIM_TIMEOUT, // REDPACKET_CLAIM_TIMEOUT
  114001: ErrorMap.ERROR_ON_FEE, //Fee token not support
  114002: ErrorMap.ERROR_ON_FEE, //Fee amount invalid, need refresh the fee. App need refresh fee less than every 15 mins
  122001: ErrorMap.ERROR_ON_REFRESH,
  115003: ErrorMap.ERROR_DUAL_EXPIRED,
}

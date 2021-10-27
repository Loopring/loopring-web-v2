import { AmmpoolAPI, ChainId, ExchangeAPI, UserAPI, WalletAPI, WsAPI } from '@loopring-web/loopring-sdk';
import store from 'stores'
import { UserNFTBalanceInfo } from '@loopring-web/loopring-sdk/dist/defs/loopring_defs';

export function getChainId() {
    const chainId = store.getState().system.chainId as ChainId
    return {chainId,}
}

export type NFTTokenInfo = {
    nftData: string,
    minter: string,
    nftType: string,
    tokenAddress: string,
    nftId: string,
    creatorFeeBips: 0,
    status: boolean
}
export type NFTWholeINFO = NFTTokenInfo  & UserNFTBalanceInfo  & {image:string,name:string,description:string}
export type NftData = string


export class LoopringAPI {

    public static userAPI: UserAPI & {getNFToffChainFee:( params:{accountId:string,requestType:9|10|11,tokenAddress:string,amount:number},ApiKey:string)=>any}
    public static exchangeAPI: ExchangeAPI | undefined = undefined
    public static ammpoolAPI: AmmpoolAPI | undefined = undefined
    public static walletAPI: WalletAPI | undefined = undefined
    public static wsAPI: WsAPI | undefined = undefined
    public static nftInfo: { getInfoForNFTTokens: ( props:{ nftDatas: string[]}) => Promise<any> }
    public static contract: { getContractNFTMeta: (props: { contractAddress: string, _id: string, web3: any }) => Promise<any> }
    public static InitApi = (chainId: ChainId) => {
        const baseUrl = chainId === ChainId.GOERLI ? 'https://uat2.loopring.io' : 'https://api3.loopring.io'

        function Contract({baseUrl}: { baseUrl: string }): {
            getContractNFTMeta: (props: { contractAddress: string, _id: string, web3: any }) => Promise<any>
        } {
            let test_id: number = 1;
            const abiStr: any[] = [
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_id",
                            "type": "uint256"
                        }
                    ],
                    "name": "uri",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ]
            // =
            return {
                getContractNFTMeta: async ({
                                               contractAddress,
                                               web3,
                                               _id
                                           }: { web3: any, contractAddress: string, _id: string }) => {
                    const contract = new web3.eth.Contract(
                        abiStr,
                        contractAddress
                    );
                    try {
                        // const methodName='uri';
                        const result = await contract.methods[ 'uri' ](_id).call();
                        if (result && chainId === ChainId.GOERLI) {
                            const gameStopMeta = await (fetch(
                                'https://ipfs.nft.gstop-sandbox.com/ipfs/QmPBvug4pYykDWosLUC7ReQo4vv1F9knd5fkTJr3bzPURp/{id}.json'
                                    .replace('{id}', (test_id++).toString())).then(response => response.json()))
                            const detail = gameStopMeta.properties.collectionGrouping[ 0 ];
                            return {
                                ...gameStopMeta,
                                _image: gameStopMeta.image,
                                detail: detail,
                                image: detail.ipfsGateway + '/' + gameStopMeta.image.replace('ipfs://', '')
                            }
                        } else {
                            return await (fetch(result.replace('{id}', _id)).then(response => response.json()))
                        }
                        return undefined
                    } catch (error) {
                        return undefined
                    }

                }
            }

        }

        function NFTInfo({baseUrl}: { baseUrl: string }): {
            getInfoForNFTTokens: (props: { nftDatas: string[] }) => Promise<{[key:NftData]:NFTTokenInfo}|undefined>
        } {
            return {
                getInfoForNFTTokens: async ( {nftDatas}: { nftDatas: string[]}) :Promise<{ [ key: NftData ]:NFTTokenInfo }|undefined>=>
            {
                try {
                    const url = baseUrl + '/api/v3/nft/info/nfts?' +  'nftDatas=' +  nftDatas.join(',')
                    const arrayResult = await(fetch(url).then(response => response.json()))
                    // arrayResult.reducer((prev:object,item:any)=>{
                    //     return  prev [item.nftId]= item
                    // },{});
                    // console.log(arrayResult)
                    return arrayResult.reduce((prev:object,item:any)=>{
                        prev[item.nftData]= item;
                        return prev
                    },{});

                    // const methodName='uri';
                    // const result = await contract.methods[ 'uri' ](_id).call();
                    // if (result && chainId === ChainId.GOERLI) {
                    //     const gameStopMeta = await(fetch(
                    //         'https://ipfs.nft.gstop-sandbox.com/ipfs/QmPBvug4pYykDWosLUC7ReQo4vv1F9knd5fkTJr3bzPURp/{id}.json'
                    //             .replace('{id}', (test_id++).toString())).then(response => response.json()))
                    //     const detail = gameStopMeta.properties.collectionGrouping[ 0 ];
                    //     return {
                    //         ...gameStopMeta,
                    //         _image: gameStopMeta.image,
                    //         detail: detail,
                    //         image: detail.ipfsGateway + '/' + gameStopMeta.image.replace('ipfs://', '')
                    //     }
                    // } else {
                    // }
                    // return undefined
                } catch (error) {
                    return undefined
                }

            }
        }

        }
        // UserAPI.Pro.getNFToffChainFee = function ( params:{accountId:string,requestType:9|10|11,tokenAddress:string,amount:number},ApiKey:string) {
        //
        // }


        LoopringAPI.userAPI = new UserAPI({baseUrl})  as any ;
        LoopringAPI.exchangeAPI = new ExchangeAPI({baseUrl})
        LoopringAPI.ammpoolAPI = new AmmpoolAPI({baseUrl})
        LoopringAPI.walletAPI = new WalletAPI({baseUrl})
        LoopringAPI.wsAPI = new WsAPI({baseUrl})
        LoopringAPI.contract = Object.create(Contract({baseUrl}))
        LoopringAPI.nftInfo = Object.create(NFTInfo({baseUrl}))
        LoopringAPI.userAPI.getNFToffChainFee =   async ({accountId,requestType,tokenAddress}:{accountId:string,requestType:9|10|11,tokenAddress:string,amount:number},ApiKey:string) => {
            const url = baseUrl + '/api/v3/user/nft/offchainFee?' +  `accountId=${accountId}&requestType=${requestType}&tokenAddress=${tokenAddress}`;
            const arrayResult = await(fetch(url).then(response => response.json()))
            return arrayResult
        }

    }

}

// async ({abiStr, contractAddress, methodName, ...params}:{
//     abiStr: any,
//     contractAddress: string,
//     methodName:string,
//     [key:string]:string
// }) => {
//     const contract = new web3.eth.Contract(
//         JSON.parse(abiStr),
//         contractAddress
//     );
//
//     const result = await contract.methods[methodName](...params).call();
//     console.log("result:", result);
// }

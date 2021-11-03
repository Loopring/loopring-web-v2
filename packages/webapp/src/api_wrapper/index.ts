import { AmmpoolAPI, ChainId, ExchangeAPI, NFTTokenInfo, UserAPI, WalletAPI, WsAPI } from '@loopring-web/loopring-sdk';
import store from 'stores'
import { NFTAPI } from '@loopring-web/loopring-sdk';

export function getChainId() {
    const chainId = store.getState().system.chainId as ChainId
    return {chainId,}
}

// export type NFTTokenInfo = {
//     nftData: string,
//     minter: string,
//     nftType: string,
//     tokenAddress: string,
//     nftId: string,
//     creatorFeeBips: 0,
//     status: boolean
// }


export class LoopringAPI {

    public static userAPI: UserAPI| undefined = undefined
    //& {getNFToffChainFee:( params:{accountId:string,requestType:9|10|11,tokenAddress:string,amount:number},ApiKey:string)=>any}
    public static exchangeAPI: ExchangeAPI | undefined = undefined
    public static ammpoolAPI: AmmpoolAPI | undefined = undefined
    public static walletAPI: WalletAPI | undefined = undefined
    public static wsAPI: WsAPI | undefined = undefined
    public static nftAPI: NFTAPI | undefined = undefined
    public static InitApi = (chainId: ChainId) => {
        LoopringAPI.userAPI = new UserAPI({ chainId })
        LoopringAPI.exchangeAPI = new ExchangeAPI({ chainId })
        LoopringAPI.ammpoolAPI = new AmmpoolAPI({ chainId })
        LoopringAPI.walletAPI = new WalletAPI({ chainId })
        LoopringAPI.wsAPI = new WsAPI({ chainId })
        LoopringAPI.nftAPI = new NFTAPI({chainId})
    }

    // public static nftAPI: { getInfoForNFTTokens: ( props:{ nftDatas: string[]}) => Promise<any> }
    // public static contract: { getContractNFTMeta: (props: { contractAddress: string, _id: string, web3: any }) => Promise<any> }
    // public static InitApi = (chainId: ChainId) => {
    //     const baseUrl = chainId === ChainId.GOERLI ? 'https://uat2.loopring.io' : 'https://api3.loopring.io'
    //
    //     function Contract({baseUrl}: { baseUrl: string }): {
    //         getContractNFTMeta: (props: { contractAddress: string, _id: string, web3: any }) => Promise<any>
    //     } {
    //         const abiStr: any[] = [
    //             {
    //                 "inputs": [
    //                     {
    //                         "internalType": "uint256",
    //                         "name": "_id",
    //                         "type": "uint256"
    //                     }
    //                 ],
    //                 "name": "uri",
    //                 "outputs": [
    //                     {
    //                         "internalType": "string",
    //                         "name": "",
    //                         "type": "string"
    //                     }
    //                 ],
    //                 "stateMutability": "view",
    //                 "type": "function"
    //             }
    //         ]
    //
    //         return {
    //             getContractNFTMeta: async ({
    //                                            contractAddress,
    //                                            web3,
    //                                            _id
    //                                        }: { web3: any, contractAddress: string, _id: string }) => {
    //                 const contract = new web3.eth.Contract(
    //                     abiStr,
    //                     contractAddress
    //                 );
    //                 try {
    //                     // const methodName='uri';
    //                     const result = await contract.methods[ 'uri' ](_id).call();
    //                     if (result && chainId === ChainId.GOERLI) {
    //                         return await (fetch(result.replace('{id}', _id) + '.json').then(response => response.json()))
    //                     } else {
    //                         return await (fetch(result.replace('{id}', _id)).then(response => response.json()))
    //                     }
    //                     return undefined
    //                 } catch (error) {
    //                     return undefined
    //                 }
    //
    //             }
    //         }
    //
    //     }
    //
    //     function NFTInfo({baseUrl}: { baseUrl: string }): {
    //         getInfoForNFTTokens: (props: { nftDatas: string[] }) => Promise<{[key:NftData]:NFTTokenInfo}|undefined>
    //     } {
    //         return {
    //             getInfoForNFTTokens: async ( {nftDatas}: { nftDatas: string[]}) :Promise<{ [ key: NftData ]:NFTTokenInfo }|undefined>=>
    //         {
    //             try {
    //                 const url = baseUrl + '/api/v3/nft/info/nfts?' +  'nftDatas=' +  nftDatas.join(',')
    //                 const arrayResult = await(fetch(url).then(response => response.json()))
    //                 // arrayResult.reducer((prev:object,item:any)=>{
    //                 //     return  prev [item.nftId]= item
    //                 // },{});
    //                 // console.log(arrayResult)
    //                 return arrayResult.reduce((prev:object,item:any)=>{
    //                     prev[item.nftData]= item;
    //                     return prev
    //                 },{});
    //             } catch (error) {
    //                 return undefined
    //             }
    //
    //         }
    //     }
    //
    //     }
    //     // UserAPI.Pro.getNFToffChainFee = function ( params:{accountId:string,requestType:9|10|11,tokenAddress:string,amount:number},ApiKey:string) {
    //     //
    //     // }
    //
    //
    //     LoopringAPI.userAPI = new UserAPI({baseUrl})  as any ;
    //     LoopringAPI.exchangeAPI = new ExchangeAPI({baseUrl})
    //     LoopringAPI.ammpoolAPI = new AmmpoolAPI({baseUrl})
    //     LoopringAPI.walletAPI = new WalletAPI({baseUrl})
    //     LoopringAPI.wsAPI = new WsAPI({baseUrl})
    //     LoopringAPI.contract = Object.create(Contract({baseUrl}))
    //     LoopringAPI.nftAPI = Object.create(NFTInfo({baseUrl}))
    //     LoopringAPI.userAPI.getNFToffChainFee =   async ({accountId,requestType,tokenAddress}:{accountId:string,requestType:9|10|11,tokenAddress:string,amount:number},ApiKey:string) => {
    //         const url = baseUrl + '/api/v3/user/nft/offchainFee?' +  `accountId=${accountId}&requestType=${requestType}&tokenAddress=${tokenAddress}`;
    //         const arrayResult = await(fetch(url).then(response => response.json()))
    //         return arrayResult
    //     }
    //
    // }

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

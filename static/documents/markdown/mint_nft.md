
# How to Mint an NFT on the Loopring L2 Web DEX

## NFT Minting Instructions on L2



1. Create a Folder on your PC for the NFT and give it a name. (eg Diamond NFT)

2. Within the folder, insert the NFT file eg precious.jpg

3. Create an account on Pinata [https://app.pinata.cloud/](https://app.pinata.cloud/)

4. Upload the NFT folder you created in point 1 that contains your NFT (eg Diamond NFT)  
   ![ipfs-1.png](https://static.loopring.io/assets/images/ipfs-1.png) ![ipfs-2.png](https://static.loopring.io/assets/images/ipfs-2.png)
5.Take note of the CID above as you will need it later.
7. Create a Folder on your PC for the NFT metadata and give it a name. eg Diamondjson
8. Within this folder create a file using a text editor (eg Notepad) and rename it to metadata.json

9. Within this metadata.json file copy the following:
   `{"description": "Description of your NFT goes here","image": "ipfs://CID of the folder of the image from point 5/imagename.jpg","name": "Name of the NFT"}
   `
### Example:
```json
{

"description": "Precious",

"image": "ipfs://QmcegKF6r3VqSc4jmSmJ6WeM3kVy9NAjY9D1e33xk56C77/precious.jpg",

"name": "Diamonds Are a Girl's Best Friend"

}
```
10. Save the metadata.json file you just created.
    ![ipfs-2.png](https://static.loopring.io/assets/images/ipfs-3.png)
11. Upload the folder you created in point 6 that contains your metadata.json file (eg Diamondjson)
12. Take a note of the metadata.json folder CID
    ![loopring-nft.png](https://static.loopring.io/assets/images/nft-mint.png)
13. Log into Loopring.io with your  [wallet](https://desk.zoho.com/portal/loopring/en/kb/articles/how-do-i-connect-loopringsmartwallet-webdex)
    1.  Go to L2 Wallet

    2.  My NFT

    3.  Mint NFT

    4.  Paste in the CID that you obtained from uploading the metadata.json folder (point 11 above) - if successful, the data from the metadata.json file you created contained within the folder populates the Name and also the image displays.

    5.  Select the number of NFT's you want to mint.

    6.  Ensure you have sufficient funds in your wallet. Click on Mint my NFT.

Congratulations, you have minted your NFT on Loopring’s L2 web DEX.
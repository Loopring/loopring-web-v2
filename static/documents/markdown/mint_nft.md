
# How to Mint an NFT on the Loopring L2 Web DEX

## Layer 2 NFT Minting Instructions

1. Create a Folder on your PC for the NFT and give it a name. (eg Diamond NFT)

2. Within the folder, insert the NFT file eg precious.jpg

3. Create an account on [Pinata](https://app.pinata.cloud/) **or** download [IPFS Desktop](https://docs.ipfs.io/install/ipfs-desktop/)

4. Upload the NFT folder you created in point 1 that contains your NFT (eg Diamond NFT) to IPFS

**Using Pinata**

![ipfs-1.png](https://static.loopring.io/assets/images/ipfs-1.png)
![ipfs-2.png](https://static.loopring.io/assets/images/ipfs-2.png)

**Using IPFS Desktop**

![IPFS 1](https://lh4.googleusercontent.com/_7QNL46Bo8IzHN_eFHv-bykaCGuvzZci668h6VtSTs69fPie4eMsvdRV_oEDknWdVAxVSUoMdjFXvMLKGsrTqzWJ9gDJve8aYZWf8fb2Zf3svC4tPenauJa00fXpVWPzMsVVMTs2)

![IPFS 2](https://lh6.googleusercontent.com/4JSFZgdoh_2ar7shTLFdDNgx2k9Jyx5cjN0KggDjAYD6rhpO3jO08_peBW5REPW7_VgCaPj9hupNkx2uwZ1wZtGVo7wSQu4Et-UMfborMnVWAVNPsiX9Kpjapoyf96rsoY1MlZAt)

5. Take note of the CID above as you will need it later.

6. Create a xxxx.json file using a text editor such as Notepad (eg metadata.json)

7. Within this xxxx.json file copy the following (note: case sensitive including filename & royalty_percentage from 0 to 10):

```
{
"description": "Description of your NFT goes here",
"image": "ipfs://CID of the folder of the image from point 5/imagename.jpg",
"name": "Name of the NFT",
"royalty_percentage": integer between 0 to 10
}
```

### Example:

```
{
"description": "Precious",
"image": "ipfs://QmcegKF6r3VqSc4jmSmJ6WeM3kVy9NAjY9D1e33xk56C77/precious.jpg",
"name": "Diamonds Are a Girl's Best Friend",
"royalty_percentage": 10
}
```

***JSON Legend***

***description:*** *A text string containing a description of your NFT.*

***image:*** *A text string containing an image to display for your NFT.*

***name:*** *A text string containing the name or title of your NFT.*

***royalty_percentage:*** *An integer from 0 - 10 describing the amount of royalty to be collected by the creator each time the NFT is sold. For example, if a creator mints an NFT with a royalty percentage of 10, the creator will receive 10% of the proceeds of every sale. Royalties are distributed to creators at the end of each month. If an NFT is minted with a royalty percentage of 0, no royalties will be collected.*

8. Save the xxxx.json file you just created
   
9. Upload the xxxx.json file you created (eg. metadata.json) to IPFS 

**Using Pinata**

![Pinata 3](https://desk.zoho.com/galleryDocuments/edbsn4699c915b92e0893b0e9c874ce1d4d11aa9cabb7cf1185d191d33c6e789bd7ff4731574da29cfb2c3cb938ab64f3ed9e)

![Pinata 4](https://desk.zoho.com/galleryDocuments/edbsn1849a1e5a0b800f6c476fca4f64a5046e2a3a74653e9f706a79c9a811de20b9e0cd82c3be59ddb400661683b37a894a3)

**Using IPFS Desktop**

![IPFS 3](https://desk.zoho.com/galleryDocuments/edbsn3a538adce6596341711426d1f53977cd566040f9da6db61ff4ca0360a12692d61643804b9e654b75c61d7db2c2989c9f)

![IPFS 4](https://desk.zoho.com/galleryDocuments/edbsnbe5466d9e6340f187892cd16f40d85c53c8ea63ace78d550b5d3a429c4400fc0bcbe9ede1a5bc6dbf8ef685ee1600ab9)

10. Take a note of the xxxx.json file CID
   
11. Log into Loopring.io with your [wallet](https://desk.zoho.com/portal/loopring/en/kb/articles/how-do-i-connect-loopringsmartwallet-webdex)

![DEX 1](https://desk.zoho.com/galleryDocuments/edbsn4699c915b92e0893b0e9c874ce1d4d1186f10747ea85a0be7cf5ef4d8c40bdbdd936f18ce11cacddfe55d43fb27cac26?inline=true)

 >   1. Navigate to the **L2 Wallet tab**
 >   2. Click the **My NFT** section
 >   3. Click the **Mint NFT** button
 >   4. Paste in the CID that you obtained from uploading the xxxx.json file (point 10 above) - if successful, the data from the metadata.json file you created contained within the folder populates the Name and also the image displays
 >   5.  Enter the number of NFT's you want to mint
 >   6.  Ensure you have sufficient funds in your wallet. Click the **Mint My NFT** button

12. Sign / Approve the mint transaction with your wallet

Congratulations, you have minted your NFT on Loopring’s L2 web DEX.




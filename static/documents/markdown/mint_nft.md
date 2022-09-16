
# How to Mint an NFT on the Loopring L2 Web DEX (Advanced)

## Part 1: Initial setup and upload

### 1.1: Organize file and select IPFS provider

1. Create a folder on your PC and give it a name.
2. Within that folder, insert the file you want to mint.
> *Example: Logo.png*
3. Create an account on [Pinata](https://app.pinata.cloud/pinmanageror) or download [IPFS Desktop](https://docs.ipfs.io/install/ipfs-desktop/).

### 1.2: Upload file to IPFS provider

Before uploading to IPFS, please be aware there are 2 types of CID: **CIDv0** (begins with **Qm**) and **CIDv1** (begins with **b**).

Currently, Loopring supports **CIDv0** (begins with **Qm**) as will be seen in the examples, as well as certain **CIDv1** (begins with **b**) that can be converted to CIDv0 format. Only CIDv1 that have the following properties can be converted to CIDv0, and thus can be supported in Loopring NFT mint.

    multibase = base58btc  
    multicodec = dag-pb  
    multihash-algorithm = sha2-256  
    multihash-length = 32 (32 bytes, equivalent to 256 bits)

If you want to upload content to IPFS and generate CID for usage in the Advanced Mint flow, please ensure the CID can be supported by Loopring as described above.

You can check CID properties using [this tool](https://cid.ipfs.io/).

In case you do not know how to generate a CID that is supported by Loopring, please use Pinata which uses CIDv0 by default.

Upload the file you want to mint to Pinata or IPFS Desktop. Do not upload the entire folder.

**Using Pinata - Step 1**
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn019d720741704af5c275ac61d97956ba35314606dadf490351028353ea16cff58c800ada40ea25557ba3d09ee86e9e29?inline=true)
**Using Pinata - Step 2**
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn0756f30924c3dbe9e43fe8cc27773f04a9adc1d185e3fa2e8a32028d25c90005ddafb26c5574474dad10bba8f351a5d1?inline=true)
**Using Pinata - Step 3**
![Img1!](https://desk.zoho.com/galleryDocuments/edbsnd208f18a9bf8497444785fa7d990ea2dc4d28d07b5ea97d2ec3e67ff1d575bc1014b363984d97ac4283d97e762e26dbf?inline=true)
**Using IPFS Desktop - Step 1**
![Img1!](https://desk.zoho.com/galleryDocuments/edbsne076e39cf237b42677b816ebc70ee7349dacc0b9623627c26acad8c81287512651d8dd772bc3522cd803c8215f88d643?inline=true)

Take note of the CID, it will be needed in the next step.

### 1.3: Create NFT Metadata file

Create a .json file using a text editor such as Notepad.
> Example: metadata.json

Within this metadata.json file copy the following – **it is case sensitive:**

    {
	"description": "Description of your NFT goes here",
	"image": "ipfs://CID of the file goes here",
	"name": "Name of the NFT",
	"royalty_percentage": integer between 0 and 10
	}

*Example:*

	{
    "description": "Loopring Logo",
    "image": "ipfs://QmZBf3Aq1LGNRLGqad2dxojwTA7ddgrMpsHqJCi6jeK6Vh",
    "name": "Logo",
    "royalty_percentage": 10
    }

***JSON Legend:***
> ***description:*** *A text string containing a description of your NFT*  
> ***image:*** *A text string containing an image to display for your NFT.*  
> ***name:*** *A text string containing the name or title of your NFT.*  
> ***royalty_percentage:*** *An integer from 0 - 10 describing the amount of royalty to be collected by the creator each time the NFT is sold. For example, if a creator mints an NFT with a royalty percentage of 10, the creator will receive 10% of the proceeds of every sale. Royalties are distributed to creators at the end of each month. If an NFT is minted with a royalty percentage of 0, no royalties will be collected.*

Save the .json file.

If you will select a collection in the mint GUI, skip to [section 1.5](https://desk.zoho.com/portal/loopring/en/kb/articles/nft-minting-on-l2#15_Upload_NFT_Metadata_file).

If you wish to manually specify an IPFS CID of the NFT's collection_metadata file, proceed to [section 1.4](https://desk.zoho.com/portal/loopring/en/kb/articles/nft-minting-on-l2#14_Manual_collection_metadata_specification).

### 1.4: Manual collection_metadata specification

Create a collection_metadata json file conforming to the specification found in collection implementation on Loopring.
Upload the collection_metadata json file to Pinata or IPFS Desktop in the same manner as above. Note the CID.

Add an additional key/value pair to the NFT metadata json file whose key is "collection_metadata" and value is the IPFS CID for the collection's metadata file.

*Example:*

    {
    "description": "Loopring Logo",
    "image": "ipfs://QmZBf3Aq1LGNRLGqad2dxojwTA7ddgrMpsHqJCi6jeK6Vh",
    "name": "Logo",
    "collection_metadata": "ipfs://QmbpBgKipbPbiLr3D2ykfiKv6XNerLSmWtoWECnqkStSs4",
    "royalty_percentage": 10
    }

***JSON Legend:***
> ***collection_metadata:*** *A text string containing an IPFS CID which points to a collection metadata file.*

### 1.5: Upload NFT Metadata file

Similarly, as the NFT file was uploaded above, upload the NFT metadata .json file to Pinata or IPFS Desktop.

**Using Pinata**
![Img1!](https://desk.zoho.com/galleryDocuments/edbsnd05455beac2e4f28c7364a1952d8ee40818481e468cf09d77df130eaaf906e8db633a6bcaa5d2ff233fb1ec966691f91?inline=true)

**Using IPFS Desktop**
![Img1!](https://desk.zoho.com/galleryDocuments/edbsna6ea24b97e6367efdf50a7d1d69b96de35c0ecb836fd5c45d433ca1b1d33dc3d154bca807386dbb6b3930024058774d3?inline=true)

If NFT's metadata **does not** contain a "collection_metadata" key/value pair, proceed to [Part 2 - Method A](https://desk.zoho.com/portal/loopring/en/kb/articles/nft-minting-on-l2#Part_2_-_Method_A_NFT_metadata_without_collection_metadata_keyvalue_pair).

If NFT's metadata **does** contain a "collection_metadata" key/value pair, proceed to [Part 2 - Method B](https://desk.zoho.com/portal/loopring/en/kb/articles/nft-minting-on-l2#Part_2_-_Method_B_NFT_metadata_with_collection_metadata_keyvalue).

If NFT will not be a member of any collection, proceed to [Part 2 - Method C](https://desk.zoho.com/portal/loopring/en/kb/articles/nft-minting-on-l2#Part_2_-_Method_C_Legacy_NFT_minting_no_collection).

## Part 2 - Method A: NFT metadata without collection_metadata key/value pair

If the NFT being minted **does not** have a "collection_metadata" key/value pair in its metadata json file, a collection will be selected from the mint GUI.

If you've already created a collection you wish to use for this NFT, skip to [section 2A.9](https://desk.zoho.com/portal/loopring/en/kb/articles/nft-minting-on-l2#2A9_Navigate_to_the_Create_NFT_Landing_page). Otherwise, proceed to the next section to create a collection.

### 2A.1: Navigate to the My Collections page

In your browser navigate to the [My Collections page](https://loopring.io/#/nft/myCollection) on the Loopring DEX.

### 2A.2: Click the Create Collection button

Click the Create Collection button in the top-right of the page.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsndf542f26cee966516e32a6e59f02808e86a80cd5a762183a97374237473b2fc27327d1c09d843073d235b624588640b1?inline=true)

### 2A.3: Select a tile image

Click or drag to upload a Tile image for the collection.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsne0d4377b953fb50dbca4ae31afac8df450d8a34c7ea65ee8bb5f49e5e357d04981b11f5908f6c72fc3bc0efcd464abeb?inline=true)
### 2A.4: Select an avatar image

Click or drag to upload a Avatar image for the collection.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn7e3365ed67bcb3731c31c131fd55156d4ce90d7320928d9fc03ee1f613e8f0342086def550b3996a4327463b62cf184b?inline=true)

### 2A.5: Select a banner image

Click or drag to upload a Banner image for the collection.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn165c9da8a9770669f9ec10ff2a71e61204c856cc0942469b473c1beb5d8270a8ce19cea6237ab342f2c2e2a7155d5685?inline=true)

### 2A.6: Enter a name

Enter a name for the collection.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn165c9da8a9770669f9ec10ff2a71e6120da85b85d189429861ca6b63fe4cb82280c23699f15f42e824ef019dc3285ce6?inline=true)

### 2A.7: Enter a description

Enter a description for the collection.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsne0d4377b953fb50dbca4ae31afac8df4fb03700aa9d3a8fd3785e7d7749f7f7b16b588e4568b06c1511c4edd7dff10bc?inline=true)

### 2A.8: Click the **Create Collection** button

Review the details. If satisfied, click the **Create Collection** button to create a collection.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn66deb7ef230f4227eec79864b1e909208d22ce44582543d3010e0f647964a1ef972e850735fddcb93832b972d7caf2ca?inline=true)

### 2A.9: Navigate to the Create NFT Landing page

In your browser navigate to the [Create NFT Landing page](https://loopring.io/#/nft/mintNFTLanding) on the Loopring DEX.

### 2A.10: Access the Advanced Creation flow

Click the **Advance Create NFT** tile to access the Advanced Create NFT flow.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn1b24fc21f685f4de6a4cf6b20100c6b2ddf2f7fb6d473c551e9863ce92b0f5bceb9f938d985e991453a34f6294ab5889?inline=true)

Select **Hasn't generated metadata with collection_metadata field**.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn12ea33ab0fd4f9ef96442907403bf0a165dfa78970b39def01f799b937ef380b799d19af0980349368ccda47f04b16de?inline=true)

### 2A.11: Choose the collection

Choose the collection you want this NFT to be minted with.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn078e3e3c974b7cd2d166f60e9190e81455c5e2cf0b9d00ad961c86e64c483513749fe1e2be81618e010e0b1880156745?inline=true)

Click the **Next** button to proceed.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn3f0ca389adb66325e32306437ffaf413c7e01441c5b21ef3fabd768a0dad89c47b7fb26c6df9eb145422065db88c07a4?inline=true)

### 2A.12: Enter the NFT metadata's IPFS CID

Enter the NFT's metadata's IPFS CID.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn1b24fc21f685f4de6a4cf6b20100c6b29c6c67464ca556683fadd200f595285fcb788584641f0d34ef68d4dbc88bd367?inline=true)

Click the box to acknowledge the risk.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn6cfddf037d2ca8a900459358bb6f33406918697d5cef1233fe5432b40c790ed35d3cf0c20cdeecd13e30e62b155c7e27?inline=true)

Click the **Next** button to proceed.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn9a4b8409c91785e5d51b7312148845981bb7809e51700fd64b8588de1de6f2d12ba1a1c64511624b1175fc09402f143a?inline=true)

### 2A.13: Enter the amount to mint

Enter an integer from 1 to 100,000 to indicate the number of NFTs that will be minted in the batch.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn9761ab323dbeb28ba7b00258e31ef4e3d714f12614f2b7665a72299e94a872d307c05a3d77bbbe9c4e78cee615d85b87?inline=true)

### 2A.14: Review fee details

Review the fee details, including the amount and fee token. To change which token will be used to pay the fee, click the small arrow to reveal the fee token options.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn6cfddf037d2ca8a900459358bb6f334075f10ce912e5dd855d8b2ebb0325aa32cebe5288b4d298ef6c964850bbb6852e?inline=true)

### 2A.15: Select fee token

Change the token used for the fee by clicking the appropriate button.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn12ea33ab0fd4f9ef96442907403bf0a174036eab7f1c54b9ebbb55b8716ab39c1b551c03f0745488daa98a4ade9a2982?inline=true)

### 2A.16: Final review

Review the NFT details, including the fee amount, fee token, and metadata details. If you wish to proceed to submit the NFT, click the **Create Your NFT** button.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn12ea33ab0fd4f9ef96442907403bf0a1ccab3ad7d90278302bf05926fc693fe55d2df275ab9f6ddd66f0920f562085a4?inline=true)

### 2A.17: Sign to approve

Sign to approve the mint transaction.

![Img1!](https://desk.zoho.com/galleryDocuments/edbsn1b24fc21f685f4de6a4cf6b20100c6b2fe1ef5e1e72968c1e59686b142e87f4b700941d58842546545a01ec922eec6d9?inline=true)

Once the NFT is successfully submitted, a confirmation window will appear.

Click the **Txn Hash** link to see details of the mint transaction, or click the **Close** button to exit the window.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn06d90bf2af6b9d77caa4dd1a3a558db7847d10868b6f3d0a72b3e96680e2e5bb30df4a9dae2cef65027df5c778b8702c?inline=true)

**Congratulations!** You have successfully submitted your NFT on Loopring’s L2 Web DEX.

## Part 2 - Method B: NFT metadata with collection_metadata key/value

If the NFT being minted **does** have a "collection_metadata" key/value pair in its metadata json file, proceed with the following steps.

### 2B.1: Navigate to the Create NFT Landing page

In your browser navigate to the Create NFT Landing page on the Loopring DEX.

### 2B.2: Access the Advanced Creation flow

Click the **Advance Create NFT** tile to access the Advanced Create NFT flow.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn535878db279f55cd383015a4af10a6e6687a990f56662ab2fdbf2d9c79818fa3f2bb2e89fc67a1044d9f68ca61718aa8?inline=true)

### 2B.3: Access the Advanced Creation flow

Select **Has generated metadata with collection_metadata field**.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn1b24fc21f685f4de6a4cf6b20100c6b2779ecaccda64378ea0b75043c2ae74e413a655414f8d2bde6a83b111be8a7a10?inline=true)

Enter the collection's contract address. Click the **Next** button to proceed.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsna53061c0c487ee9798eff021834273bd6e1c79d2e42bf635c8ee6bbb2af1f5d77214720b8dcb82d280f1d03ebb873488?inline=true)

### 2B.4: Enter the NFT metadata's IPFS CID

Enter the NFT metadata's IPFS CID. Click the **Next** button.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn6cfddf037d2ca8a900459358bb6f3340952fa0a34337712097113b3b5e25a5f6c46d93e7e371a72dd12da5ff763e1cd4?inline=true)

### 2B.5: Enter the amount to mint

Enter an integer from 1 to 100,000 to indicate the number of NFTs that will be minted in the batch.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn9761ab323dbeb28ba7b00258e31ef4e3d714f12614f2b7665a72299e94a872d307c05a3d77bbbe9c4e78cee615d85b87?inline=true)

### 2B.6: Review fee details

Review the fee details, including the amount and fee token. To change which token will be used to pay the fee, click the small arrow to reveal the fee token options.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn6cfddf037d2ca8a900459358bb6f334075f10ce912e5dd855d8b2ebb0325aa32cebe5288b4d298ef6c964850bbb6852e?inline=true)

Change the token used for the fee by clicking the appropriate button.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn12ea33ab0fd4f9ef96442907403bf0a174036eab7f1c54b9ebbb55b8716ab39c1b551c03f0745488daa98a4ade9a2982?inline=true)

### 2B.7: Final review

Review the NFT details, including the fee amount, fee token, and metadata details. If you wish to proceed to create the NFT, click the **Create Your NFT** button.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn12ea33ab0fd4f9ef96442907403bf0a1ccab3ad7d90278302bf05926fc693fe55d2df275ab9f6ddd66f0920f562085a4?inline=true)

### 2B.8: Sign to approve

Sign to approve the mint transaction.

![Img1!](https://desk.zoho.com/galleryDocuments/edbsn1b24fc21f685f4de6a4cf6b20100c6b2fe1ef5e1e72968c1e59686b142e87f4b700941d58842546545a01ec922eec6d9?inline=true)

Once the NFT is successfully submitted, a confirmation window will appear.
​
Click the **Txn Hash** link to see details of the mint transaction, or click the **Close** button to exit the window.

![Img1!](https://desk.zoho.com/galleryDocuments/edbsn06d90bf2af6b9d77caa4dd1a3a558db7847d10868b6f3d0a72b3e96680e2e5bb30df4a9dae2cef65027df5c778b8702c?inline=true)

**Congratulations!** You have successfully minted your NFT on Loopring’s L2 Web DEX.

## Part 2 - Method C: Legacy NFT minting (no collection)

If the NFT being minted will not be a member of any collection, proceed with the following steps.

### 2C.1: Navigate to the Legacy Create NFT page

In your browser navigate to the Legacy Create NFT page on the Loopring DEX.

### 2C.2: Upload an image

Click or drag to upload an image for the NFT.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn905976fdd11f501f6c07814d13299074d23348d781037b9168a87bc80e1ea20c66e7bcbc5334100ba457127ced6b887f?inline=true)

### 2C.3: Name the NFT

Enter a name for the NFT. For readability, avoid using lengthy names.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn165c9da8a9770669f9ec10ff2a71e6126ce2cf005395982130e25396674728ef3f44040e23fc756fcd7002f289c579b8?inline=true)

### 2C.4: Enter a royalty percentage

Enter an integer from 0 to 10 to indicate the royalty percentage. This is the percent of each sale of this NFT that will be collected as royalties. Enter zero to indicate no royalties are to be collected.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn905976fdd11f501f6c07814d132990749c66e2faf192cbfe7ef4a3ee267e7ac43bc708f926e77b9ee9e12b9709447eb3?inline=true)

### 2C.5: Enter the amount to mint

Enter an integer from 1 to 100,000 to indicate the number of NFTs that will be minted in the batch.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsndf542f26cee966516e32a6e59f02808e95069201bda160dd975a4e064dceffc8738dd1b49e3dbebb4c4a80a4717e14ce?inline=true)

### 2C.6: Enter a Description

Enter a description that best describes the NFT being minted.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn10b3be26091a4e63c9b02f24742efe53f6ad62661aeebd7d257e225ce9e7a7b65dd3dde6ccf88bea9e25ee1ac99a6a7c?inline=true)

### 2C.7: Enter a custom property key and value

Each NFT can have up to five custom properties comprised of key and value pairs. These are not required, but they help add additional detail and make it easier for other applications to sort and rank the NFT.

Enter in a key name and value for the custom property.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn81c902557e3076f4bf0a68cee28df6568be492d553e0e6e3005c3ea61b8d7fca06d125c5e8ceadf1169403b9e993881b?inline=true)

### 2C.8: Optionally add additional properties

Clicking the **Add Property** button will add another row for an additional property.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn2b86e9df0bf01b809846e75fb526fa13539a95b07636de72d98597529c1259271a6ec477a7951201ee41a7f7a5b8cbd5?inline=true)

### 2C.9: Enter additional keys and values

Enter in a key name and value for each additional custom property.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn087b884f3609dbbec5c9932bd703869e6a331ec36d9c3a85d8be060316d3303df8bf40e792773819b1da2393ecf9edfa?inline=true)

### 2C.10: Review the content policy

Review the content policy, then check the box to confirm that the NFT being minted adheres to it.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsnb5d2a1cdb44e8eed8d3f06b73a9f3080416bd5621cb8cdfa19a5092a12168550f78265d2c293b7ce6cf40f202f0a9699?inline=true)

### 2C.11: Upload metadata and create

Review the NFT details. If satisfied, click the **Upload Metadata & Create** button to proceed.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsnc84e44a86677e9268dec40dea82b20e622ab2ec5793422e4158115ebece53c195f238660d7cae64331b500b464836d86?inline=true)

### 2C.12: Review fee details

Review the fee details, including the amount and fee token. To change which token will be used to pay the fee, click the small arrow to reveal the fee token options.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsne5e4dcae0392219acda354227371e136794340dfce3d7c53eb5c9deab82525c767b57f65872a5e9b65783d76d60a3e79?inline=true)

### 2C.13: Select the fee token

Change the token used for the fee by clicking the appropriate button.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsne5e4dcae0392219acda354227371e13643c3ce2c0badd58949fea9a1b98ab13ba691e86fe6c14500160a0e4208564659?inline=true)

### 2C.14: Final review

Review the NFT details, including the fee amount, fee token, and metadata details. If you wish to proceed to create the NFT, click the **Create NFT** button.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn905976fdd11f501f6c07814d132990740423fe056312a082703b0eb4a159971158b401cca444ccb6bb5d35c90a55f567?inline=true)

### 2C.15: Confirmation and details

Once the NFT is successfully submitted, a confirmation window will appear.

Click the **Txn Hash** link to see details of the mint transaction, or click the **Close** button to exit the window.
![Img1!](https://desk.zoho.com/galleryDocuments/edbsn087b884f3609dbbec5c9932bd703869e5e30d132be0959720a9dcee8233bf9ae2c6b01eae83a64e1f818b8981ee752ca?inline=true)

**Congratulations!** You have successfully minted your NFT on Loopring’s L2 Web DEX.

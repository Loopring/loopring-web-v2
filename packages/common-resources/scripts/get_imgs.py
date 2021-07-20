#!/usr/bin/python
# -- encoding= utf8 --

import requests

import json

from eth_utils import to_checksum_address

import os

from PIL import Image

output_folder = 'output'

output_folder2 = 'output_resize'

output_folder_zapper = 'output_zapper'

output_folder2_zapper = 'output_resize_zapper'

SIZE = (36, 36)

def gen_imgs(tokenMap):
    tokens = requests.get('https://api.loopring.network/api/v3/exchange/tokens')
    print(tokens.status_code)

    tokenObjs = json.loads(tokens.text)

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    if not os.path.exists(output_folder2):
        os.makedirs(output_folder2)

    if not os.path.exists(output_folder_zapper):
        os.makedirs(output_folder_zapper)

    if not os.path.exists(output_folder2_zapper):
        os.makedirs(output_folder2_zapper)

    totalNum = len(tokenObjs)

    count = 1
        
    for tokenInfo in tokenObjs:
        symbol = str(tokenInfo['symbol'])
        address = str(tokenInfo['address'])
        if not symbol.find('LP-') >= 0:
            fileName = '{}.png'.format(symbol)
            address = to_checksum_address(tokenInfo['address'])
            lower_addr = address.lower()
            filePath = os.path.join(output_folder, fileName)
            filePath2 = os.path.join(output_folder_zapper, fileName)

            try:

                if not os.path.exists(filePath):
                    url = 'https://exchange.loopring.io/assets/images/ethereum/assets/{}/logo.png'.format(address)
                    r = requests.get(url)
                    if r.status_code == 200:
                        with open(filePath, "wb") as code:
                            code.write(r.content)
                        print('handling: {}/{}. {}'.format(count, totalNum, url))
                    else:
                        print('handling: {}/{}. {}. errorFile: {}'.format(count, totalNum, url, fileName))
                else:
                    print('{}/{}. {} already existed!'.format(count, totalNum, fileName))
            except:
                print('handling: {}/{}. {} got error!'.format(count, totalNum, fileName))

            #zapper

            try:

                if not os.path.exists(filePath2) and lower_addr in tokenMap:
                    tokenInfo = tokenMap[lower_addr]
                    url = tokenInfo['logoURI']
                    r = requests.get(url)
                    if r.status_code == 200:
                        with open(filePath2, "wb") as code:
                            code.write(r.content)
                        print('handling: {}/{}. {}'.format(count, totalNum, url))
                    else:
                        print('handling: {}/{}. {}. errorFile: {}'.format(count, totalNum, url, fileName))
                else:
                    print('{}/{}. {} already existed!'.format(count, totalNum, fileName))
            except:
                print('handling: {}/{}. {} got error!'.format(count, totalNum, fileName))

        else:
            print('{}/{}. {} is a LP Token!'.format(count, totalNum, fileName))
            
        count += 1

    list = os.listdir(output_folder)
    lst = []
    for i in range(0, len(list)):
        path = os.path.join(output_folder, list[i])
        path2 = os.path.join(output_folder2, list[i])
        im = Image.open(path)
        if im.width != im.height:
            lst.append(path)
        im = im.resize(SIZE)
        im.save(path2, 'PNG')

    print('w!=h list:', lst)

def fetch_zapper():
    zapperInfo = requests.get('https://zapper.fi/api/token-list')
    print(zapperInfo.status_code)
    print(zapperInfo.text)
    tokenObjs = json.loads(zapperInfo.text)
    tokens = tokenObjs['tokens']
    tokenMap = {}
    for token in tokens:
        tokenMap[token['address']] = token
    return tokenMap

if __name__ == '__main__':
    tokenMap = fetch_zapper()
    gen_imgs(tokenMap)

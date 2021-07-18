#!/usr/bin/python
# -- encoding= utf8 --

import requests

import json

from eth_utils import to_checksum_address

import os

output_folder = 'output'

if __name__ == '__main__':
    tokens = requests.get('https://api.loopring.network/api/v3/exchange/tokens')
    print(tokens.status_code)

    tokenObjs = json.loads(tokens.text)

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    totalNum = len(tokenObjs)

    count = 1
        
    for tokenInfo in tokenObjs:
        symbol = str(tokenInfo['symbol'])
        if not symbol.find('LP-') >= 0:
            fileName = '{}.png'.format(symbol)
            address = to_checksum_address(tokenInfo['address'])
            filePath = os.path.join(output_folder, fileName)

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
        else:
            print('{}/{}. {} is a LP Token!'.format(count, totalNum, fileName))
        count += 1

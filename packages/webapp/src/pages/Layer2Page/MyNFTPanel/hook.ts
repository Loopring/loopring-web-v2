import { AccountStatus } from '@loopring-web/common-resources'
import exportFromJSON from 'export-from-json'
import { useAccount } from '../../../stores/account'
import React from 'react'

import { AccountStep, useOpenModals, } from '@loopring-web/component-lib'
import store from 'stores'
import * as sdk from 'loopring-sdk'
import { myLog } from '@loopring-web/common-resources'
import { LoopringAPI } from 'api_wrapper'

import { connectProvides } from '@loopring-web/web3-provider';

import { checkErrorInfo } from 'hooks/useractions/utils';



import { useSelector } from 'react-redux'
import { Config } from './interface'
import { RootState } from '../index'

export const useConfig = (): Config => {
  const contacts: Config = useSelector((state: RootState) => state.config)
  return {
    ...contacts
  }
}

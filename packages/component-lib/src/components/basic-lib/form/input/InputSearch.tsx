import { OutlinedInput, InputAdornment } from '@material-ui/core'
import { SearchIcon } from '@loopring-web/common-resources'

export type InputSearchProps = {
    value?: string;
    onChange?: (value: string) => void;
}

export const InputSearch = ({
    value,
    onChange,
}: InputSearchProps) => {
    return <OutlinedInput
        className={'search'}
        aria-label={'search'}
        placeholder={'Search'}
        value={value}
        onChange={(event: any) => {
            if (onChange) {
                onChange(event.target.value)
            }
        }}
        startAdornment={
            <InputAdornment position="start">
                <SearchIcon/>
            </InputAdornment>
        }
    />
}

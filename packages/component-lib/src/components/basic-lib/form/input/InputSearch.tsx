import { OutlinedInput, InputAdornment } from '@material-ui/core'
import { SearchIcon } from '@loopring-web/common-resources'
import { OutlinedInputProps } from '@material-ui/core/OutlinedInput/OutlinedInput';

export type InputSearchProps  = {
    value?: string;
    // onChange?: (value: string) => void;
} & OutlinedInputProps

export const InputSearch = ({
    value,
    onChange,
    ...rest
}: InputSearchProps) => {
    return <OutlinedInput
        {...{...rest}}
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
            <InputAdornment color={'var(--color-text-secondary)'} position="start">
                <SearchIcon />
            </InputAdornment>
        }
    />
}

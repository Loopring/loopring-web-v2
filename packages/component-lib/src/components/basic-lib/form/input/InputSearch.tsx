import { OutlinedInput, InputAdornment } from '@material-ui/core'
import { SearchIcon } from '@loopring-web/common-resources'
import { OutlinedInputProps } from '@material-ui/core/OutlinedInput/OutlinedInput';
import React from 'react';

export type InputSearchProps  = {
    value?: string;
    // onChange?: (value: string) => void;
} & OutlinedInputProps

export const InputSearch =  React.forwardRef(({
    value,
    onChange,
    ...rest
}: InputSearchProps , _ref: React.ForwardedRef<any>) => {
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
} )

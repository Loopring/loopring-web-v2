import { useState } from 'react'

export function useTabs(prefix: string = '') {

    const [active, setActive] = useState(prefix + '0')

    const handleClick = (e: any) => {
        const index = e.target.id
        if (index !== active) {
            setActive(index)
        }
    }

    return {
        active,
        handleClick,
    }

}

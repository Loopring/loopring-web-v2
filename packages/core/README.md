# component-lib

> Loopring UI component lib

[![NPM](https://img.shields.io/npm/v/component-lib.svg)](https://www.npmjs.com/package/component-lib) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save component-lib
```

## Usage

```tsx
import * as React from 'react'

<
ProviderComposer
providers = {
    [
        provider(LocalizationProvider, {dateAdapter: MomentUtils}),
    provider(I18nextProvider, {i18n}),
    provider(ThemeProvider),
]
}>
<
Story
{...
    context
}
/>
</ProviderComposer>
</Global><Global styles={
    `${globalCss}`
}
>
<
ProviderComposer
providers = {
    [
        provider(LocalizationProvider, {dateAdapter: MomentUtils}),
    provider(I18nextProvider, {i18n}),
    provider(ThemeProvider),
]
}>
<
Story
{...
    context
}
/>
</ProviderComposer>
</Global>

"@loopring-web/static-resource": "file:../static-resource/src",

```

## License

MIT © [Loopring dev Team](https://github.com/Loopring dev Team)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).

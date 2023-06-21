import type { Provider as TProvider } from 'react'

export const provider = (Provider: TProvider<any>, props: any = {}) => [Provider, props]

/**
 * @param providers  inner -> outer
 * @param children
 * @constructor
 * example
 *  <ProviderComposer  providers={[
 *     provider(LocalizationProvider,{dateAdapter:MomentUtils}),
 *     provider(I18nextProvider,{i18n}),
 *     provider(ThemeProvider),
 *   ]}>
 *     <App />
 *  </ProviderComposer>
 */
export const ProviderComposer = ({
  providers,
  children,
}: {
  providers: Array<[TProvider<any>, any]>
  children: any
}) => {
  // @ts-ignore
  return providers.reduce((children, [Provider, props]: [TProvider<any>, any]) => {
    // @ts-ignore
    return <Provider {...props}>{children}</Provider>
  }, children)
  // return children;
}

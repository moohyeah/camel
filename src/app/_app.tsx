import type { AppProps } from 'next/app';
import { ArweaveWalletKit } from "arweave-wallet-kit";
import { permission } from 'process';

export default function App({ Component, pageProps }: AppProps) {
  return <ArweaveWalletKit
    config={{
      permissions : ['ACCESS_ADDRESS',
            'ACCESS_ALL_ADDRESSES',
            'ACCESS_PUBLIC_KEY',
            'SIGN_TRANSACTION',
            'SIGNATURE'],
      ensurePermissions : true,
    }}
  > 
    <Component {...pageProps} />
  </ArweaveWalletKit>
}

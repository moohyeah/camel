import App from 'next/app';
import type { AppProps, AppContext  } from 'next/app';
import { ArweaveWalletKit } from "arweave-wallet-kit";

import { getBaseUrl } from '../utils/getBaseUrl';

function MyApp({ Component, pageProps }: AppProps & { baseUrl: string }) {
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

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  const baseUrl = getBaseUrl(appContext.ctx.req);

  return { ...appProps, baseUrl };
};

export default MyApp;
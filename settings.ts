export const settings = {
  domain: process.env.APP_DOMAIN ?? 'localhost',
  chainIds: [5],
  owner: {
    publicKey: `${process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS}`,
    privateKey: `${process.env.DEPLOYER}`,
  },
  web3Storage: {
    token: `${process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN}`,
    endpoint: new URL('https://api.web3.storage'),
  },
  ui: {
    progressBarColor: 'rgb(226 173 22)',
  },
  url: {
    signIn: '/',
    wallet: '/wallet',
    dashboard: '/dashboard',
  },
  moralisApi: `${process.env.NEXT_PUBLIC_MORALIS_API_KEY}`,
  etherscanApi: `${process.env.NEXT_PUBLIC_ETHERSCAN_API}`,
  contracts: ['ShantoToken', 'IERC20'],
};
import { Button, Card, Col, Row } from 'antd';
import { toast } from 'react-hot-toast';
import {
  useAccount,
  useConnect,
  useDisconnect,
  Connector,
  useSignMessage,
} from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { settings } from '../settings';
import { chainMap } from '../chains';
import Web3Token from 'web3-token';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
const signin = () => {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { push } = useRouter();
  const handleAuth = async (
    wallet: 'metamask' | 'coinbase' | 'walletconnect'
  ) => {
    if (isConnected) {
      await disconnectAsync();
    }

    const appChain = chainMap[settings.chainIds[0]];

    let selectedConnector: Connector = new MetaMaskConnector({
      chains: [appChain],
      options: {
        shimChainChangedDisconnect: false,
      },
    });

    if (wallet === 'coinbase') {
      selectedConnector = new CoinbaseWalletConnector({
        chains: [appChain],
        options: {
          appName: 'w3ChineDetails',
        },
      });
    }

    if (wallet === 'walletconnect') {
      selectedConnector = new WalletConnectConnector({
        chains: [appChain],
        options: { qrcode: true },
      });
    }

    const { account, chain, connector } = await connectAsync({
      connector: selectedConnector,
    });

    if (chain.unsupported && typeof connector?.switchChain == 'function') {
      await connector.switchChain(appChain.id);
    }

    const signature = await Web3Token.sign(
      (message: string) => signMessageAsync({ message })
    );

    console.log(signature);
    const user = await signIn('credentials', {
      signature,
      redirect: false,
    });
    console.log(user);
    push('/');
  };

  const authLoader = (cnt: 'metamask' | 'coinbase' | 'walletconnect') => {
    toast.promise(handleAuth(cnt), {
      loading: 'Connecting...',
      success: 'Connected successfully',
      error: (e: any) => {
        console.log(e);
        return 'Got error';
      },
    });
  };

  return (
    <div className="layout">
      <Row align="middle">
        <Col span={12} offset={6}>
          <Card
            title="Web3 Authentication"
            size="default"
            className="signin-card"
          >
            <Button
              type="primary"
              className="signin-btn"
              onClick={() => authLoader('metamask')}
            >
              Signin by Metamask
            </Button>
            <Button
              type="primary"
              className="signin-btn"
              onClick={() => authLoader('coinbase')}
            >
              Signin by coinbase
            </Button>
            <Button
              type="primary"
              className="signin-btn"
              onClick={() => authLoader('walletconnect')}
            >
              Signin by Metamask
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default signin;

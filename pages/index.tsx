import { Button, Col, Row, Modal, Input, Form, Select, Space } from 'antd';
import { getSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import { useState } from 'react';
import { useDisconnect } from 'wagmi';
import { chainMap } from '../chains';
import IERC20 from '../generated/abi/IERC20.json'
import { ethers } from 'ethers';

export default function Home() {
  const {disconnectAsync} = useDisconnect();
  const [modalState, setModalState] = useState(false);
  const [form] = Form.useForm();
  const handaleCancel = () => {
    setModalState(false);
  };

  const [sydState, setSydState] = useState(true)

  const chainId = Form.useWatch('networkId', form)
  const networkAddress = Form.useWatch('tokenAddress', form)

  // const token = new IERC20Queries('0x07865c6e87b9f70255377e024ace6630c1eaa37f', 5);
  // const {data} = token.useSymbolQuery();
  // console.log(data)

  const fecthInfo = async (chainId:number, networkAddress:string) => {
    if (chainId === undefined && networkAddress === undefined) {
      form.setFields([
        {
          name: 'networkId',
          errors: ['NetworkId is required'],
        },
        {
          name: 'tokenAddress',
          errors: ['TokenAddress is required'],
        },
      ])
    }else{
      const rpcUrl = chainMap[chainId].rpcUrls.default.http[0];
      // 0x07865c6e87b9f70255377e024ace6630c1eaa37f
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const token = new ethers.Contract(networkAddress, IERC20, provider);
      if (token) {
        try {          
          const symbol = await token.symbol();
          const decimals = await token.decimals();
          if (symbol !== undefined || symbol !== '' && decimals !== undefined || decimals !== null) {
            setSydState(false);
            form.setFields([
              {
                name: 'symbol',
                value: symbol
              },
              {
                name: 'Decimals',
                value: decimals
              }
            ])
          }
          console.log(symbol)
          console.log(decimals)
        } catch (error) {
          console.log(error)
        }
      }
    }
  }



  const formSubmit = (value: any) => {
    console.log(value);
  };

  const selecteChain = Object.keys(chainMap)
    .map((item) => {
      return item;
    })
    .map((item) => {
      return {
        value: item,
        label: chainMap[item].name,
      };
    });


    const haldaleLogOut = async () => {
      await disconnectAsync();
		  signOut({ callbackUrl: "/signin" });
    }
  return (
    <>
      <Head>
        <title>CHAINE DETAILS</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Row justify={'center'} style={{marginTop: 50, marginBottom: 50}}>
          <Col span={12}>
            <Row justify={'space-between'}>
              <Button onClick={() => setModalState(true)}>Add Token</Button>
              <Button onClick={haldaleLogOut}>Log Out</Button>
            </Row>

            <Modal
              title={[<h2 className="text-center uppercase">import token</h2>]}
              centered
              closable
              open={modalState}
              onCancel={handaleCancel}
              footer={[]}
            >
              <Form form={form} name="token-info" onFinish={formSubmit}>

                <Form.Item name="networkId" rules={[{ required: true }]}>
                  <Select
                    showSearch
                    placeholder="Select Network"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={selecteChain}
                  />
                </Form.Item>

                <Form.Item name="tokenAddress" rules={[{ required: true }]}>
                  <Input placeholder="Token Address" />
                </Form.Item>
  
                <Form.Item name='symbol' rules={[{ required: true }]}>
                  <Input placeholder='symbol' disabled={sydState}/>
                </Form.Item>
                <Form.Item name='Decimals' rules={[{ required: true }]}>
                  <Input placeholder='Decimals' disabled={sydState}/>
                </Form.Item>
                
                <Space>
                  <Form.Item>
                    <Button type="primary" disabled={sydState} htmlType="submit">
                      Submit
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" disabled={ sydState === true? false : true} htmlType="button" onClick={() => fecthInfo (chainId, networkAddress)}>
                      Fecth Info
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            </Modal>
            
          </Col>
        </Row>
    </>
  );
}

export async function getServerSideProps(context: any) {
	const session = await getSession(context);
	// redirect if not authenticated
	if (!session?.user) {
		return {
			redirect: {
				destination: "/signin",
				permanent: false,
			},
		};
	}
	return {
		props: { user: session.user},
	};
}
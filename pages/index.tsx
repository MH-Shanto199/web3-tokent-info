import { Button, Col, Row, Modal, Input, Form, Select, Space, Card } from 'antd';
import { getSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDisconnect } from 'wagmi';
import { chainMap } from '../chains';
import { TokenInfoCard } from '../components/TokenInfoCard';
import { getDecimals, getSymbol, getTotalSupply } from '../utils/helpers';
import { trpc } from '../utils/trpc';

export default function Home({user}:any) {
  const {disconnectAsync} = useDisconnect();
  const utils = trpc.useContext();
  const [modalState, setModalState] = useState(false);
  const [form] = Form.useForm();
  const handaleCancel = () => {
    setModalState(false);
  };

  const [symbolFild, setSymbolFild] = useState(true)
  const [decimalsFild, setdecimalsFild] = useState(true)
  const [buttonState, setButtonState] = useState(true)
  const [formState, setformState] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const chainId = Form.useWatch('networkId', form)
  const networkAddress = Form.useWatch('tokenAddress', form)

  const onChangeHandeller = (value:any) => {
    if (!buttonState) {
      form.setFields([
        {
          name: 'symbol',
          value: null
        },
        {
          name: 'decimals',
          value: null
        }
      ])
      setButtonState(true)
    }
  }

  const fecthInfo = async (chainId:number, networkAddress:string) => {
    setformState(true);
    toast.loading('Facthing Data...', {
      position: "top-center"
    })
    if (chainId === undefined && networkAddress === undefined) {
      toast.dismiss();
      toast.error('network & Token Address are required', {
        position: "top-center"
      })
      form.setFields([
        {
          name: 'networkId',
          errors: ['Network is required'],
        },
        {
          name: 'tokenAddress',
          errors: ['Token Address is required'],
        },
      ])
      setformState(false);
    } else if (chainId === undefined) {
      toast.dismiss();
      toast.error('network is required', {
        position: "top-center"
      })
      form.setFields([
        {
          name: 'networkId',
          errors: ['Network is required'],
        },
      ])
      setformState(false);
    }else if(networkAddress === undefined) {
      toast.dismiss();
      toast.error('Token Address is required', {
        position: "top-center"
      })
      form.setFields([
        {
          name: 'tokenAddress',
          errors: ['Token Address is required'],
        },
      ])
      setformState(false);
    } else{
      const rpcUrl = chainMap[chainId].rpcUrls.default.http[0];
      // 0x07865c6e87b9f70255377e024ace6630c1eaa37f
      try {
        const isValidContruct = await getTotalSupply(networkAddress, rpcUrl)
        if (isValidContruct) {
          form.setFields([
            {
              name: 'tokenAddress',
              errors: [],
            },
          ])

          try {
            toast.dismiss();
            toast.loading('Facthing Token Symbol...', {
              position: "top-center"
            })
            const symbol = await getSymbol(networkAddress, rpcUrl)
            if (symbol) {
              form.setFields([
                {
                  name: 'symbol',
                  value: symbol
                }
              ])
              toast.dismiss();
              toast.loading('Successfully get Token Symbol...', {
                position: "top-center"
              })
            }
          } catch (error) {
            setSymbolFild(false)
            toast.dismiss();
            toast.loading('Token Symbol Not Found...', {
              position: "top-center"
            })
          }
          try {
            toast.dismiss();
            toast.loading('Facthing Token decimals...', {
              position: "top-center"
            })
            const decimals = await getDecimals(networkAddress, rpcUrl)
            if (decimals) {
              form.setFields([
                {
                  name: 'decimals',
                  value: decimals
                }
              ])
              toast.dismiss();
              toast.loading('Successfully get Token decimals...', {
                position: "top-center"
              })
            }
          } catch (error) {
            setdecimalsFild(false)
            toast.dismiss();
            toast.loading('Token decimals Not Found...', {
              position: "top-center"
            })
          }
          setButtonState(false)
          toast.dismiss();
          toast.success('Facthing Completed',{
            position: "top-center"
          });
          setformState(false);
        }
      } catch (error) {
        form.setFields([
          {
            name: 'tokenAddress',
            errors: ['Invalid TokenAddress'],
          },
          {
            name: 'symbol',
            value: null
          },
          {
            name: 'decimals',
            value: null
          }
        ])
        toast.dismiss();
        toast.error('Invalid TokenAddress',{
          position: "top-center"
        });
        setformState(false);
      } 
    }
  }
  const { data } = trpc.token.tokenList.useQuery();
  const tokens = data?.Tokens;
  // console.log(tokens?.length)

  const addTokenMUtation = trpc.token.addTokenInfo.useMutation({
    async onSuccess() {
      await utils.token.tokenList.invalidate()
      form.setFields([
        {
          name: 'networkId',
          value: null,
        },
        {
          name: 'tokenAddress',
          value: null,
        },
        {
          name: 'symbol',
          value: null
        },
        {
          name: 'decimals',
          value: null
        }
      ])
      setSubmitLoading(false)
      setformState(false)
      setModalState(false)
    },
    onError() {
      setSubmitLoading(false)
      setformState(false)
    }
  })

  const formSubmit = (value: any) => {
    setformState(true);
    setSubmitLoading(true);
    toast.promise(
      addTokenMUtation.mutateAsync(value),{
        loading: 'Loading...',
        success: 'token added successfully',
        error: 'Token Info already Existed'
      },{
        position: 'top-center'
      }
    )
  };

  const selecteChain = Object.keys(chainMap)
    .map((item) => {
      return item;
    })
    .map((item) => {
      return {
        value: Number(item),
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
            <Row justify={'space-between'} style={{marginBottom: 50}}>
              <Button onClick={() => setModalState(true)}>Add Token</Button>
              <Button onClick={haldaleLogOut}>Log Out</Button>
            </Row>
            <Modal
              title={[<h2 className="text-center uppercase" key={Math.random()*4}>import token</h2>]}
              centered
              closable
              open={modalState}
              onCancel={handaleCancel}
              footer={[]}
            >
              <Form form={form} name="token-info" onFinish={formSubmit} disabled={formState}>

                <Form.Item name="networkId" rules={[{ required: true }]}>
                  <Select
                    showSearch
                    placeholder="Select Network"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase()  
                      )
                    }
                    options={selecteChain}
                    onChange={onChangeHandeller}
                  />
                </Form.Item>

                <Form.Item name="tokenAddress" rules={[{ required: true }]}>
                  <Input placeholder="Token Address" onChange={onChangeHandeller}/>
                </Form.Item>
  
                <Form.Item name='symbol' rules={[{ required: true }]}>
                  <Input placeholder='symbol' disabled={symbolFild}/>
                </Form.Item>
                <Form.Item name='decimals' rules={[{ required: true }]}>
                  <Input placeholder='Decimals' disabled={decimalsFild}/>
                </Form.Item>
                
                <Space>
                  <Form.Item>
                    <Button type="primary" disabled={buttonState} htmlType="submit" loading={submitLoading}>
                      Submit
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" disabled={ buttonState === true? false : true} htmlType="button" onClick={() => fecthInfo (chainId, networkAddress)} loading={formState}>
                      Fecth Info
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            </Modal>
            <Row justify={'center'}>
              <Col span={24}>  
              {
                tokens?.length !=0 ?
                <Card size="default" className="tokenCard-bg">
                  <Row gutter={[15, 15]}>
                      {
                        tokens?.map((item, index) => (
                          <TokenInfoCard token={item} user={user} key={index+1}/>
                        ))
                      }
                  </Row>
                </Card>: <p>There is no Token Information to show </p>
              }
              </Col>
            </Row>
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
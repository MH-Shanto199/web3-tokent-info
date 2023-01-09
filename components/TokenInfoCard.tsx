import { tokenInfo } from "@prisma/client"
import { Button, Card, Col, Modal } from "antd"
import { AiFillDelete } from "react-icons/ai";
import IERC20Queries from "../generated/query-hooks/IERC20Queries";
import { CopyAbleAddress } from "./CopyAbleAddress";
import Prisma  from "@prisma/client";
import { ethers } from "ethers";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { toast } from "react-hot-toast";

type TokenInfoProps = {
  token: tokenInfo
  user: Prisma.User
}

export const TokenInfoCard = ({ token, user }:TokenInfoProps) => {
  const [modalState, setModalState] = useState(false);
  const erc20queryClint = new IERC20Queries(token.tokenAddress, token.networkId);
  const utils = trpc.useContext();

  const { data:networkName } = erc20queryClint.useNameQuery();
  const networkAddress = erc20queryClint.contractAddress; 
  const address = user?.publicKey??'';
  const { data:balance } = erc20queryClint.useBalanceOfQuery(address);
  const { data:symbol } = erc20queryClint.useSymbolQuery()

  const handeleDelete = (id:number) => {
    toast.promise(
      deleteTokenMutation.mutateAsync(id), {
        loading: 'Loading...',
        success: 'token Deleted successfully',
        error: 'Something Went wrong For deleteing this Token'
      },{
        position: 'top-center'
      }
    )
    console.log(id)
  }

  const deleteTokenMutation = trpc.token.deleteTokenInfo.useMutation({
    async onSuccess() {
      await utils.token.tokenList.invalidate()
      setModalState(false)
    }
  })

  const handleCancel = () => {
    setModalState(false)
  }

  return (
    <Col span={8}>
      <Card size="default" className='tokenCard'>
        <Button className="delete-btn" onClick={() => setModalState(true)}><AiFillDelete/></Button>
        <Modal title={<span key={Math.random()*2}>CONFIRM DELETE TOKEN INFO</span>} open={modalState} onCancel={handleCancel} footer={[
          <Button onClick={() => handeleDelete(token.id)} key={Math.random()*3}>DELETE</Button>
        ]}>
          
        </Modal>
        <ul > 
          <li>Network Name : {networkName?<span>{networkName}</span>:'Undefined'}</li>
          <li>Network Address: <span><CopyAbleAddress address={networkAddress}/></span></li>
          <li>Balance: <span >{ethers.utils.formatUnits(balance??0, token.decimals) }<span className="symbol ml-2">{symbol}</span></span></li>
        </ul>
      </Card>
    </Col>
  )
}

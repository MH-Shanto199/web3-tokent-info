import { tokenInfo } from "@prisma/client"
import { Button, Card, Col } from "antd"
import { AiFillDelete } from "react-icons/ai";
import IERC20Queries from "../generated/query-hooks/IERC20Queries";
import { CopyAbleAddress } from "./CopyAbleAddress";
import Prisma  from "@prisma/client";
import { ethers } from "ethers";

type TokenInfoProps = {
  token: tokenInfo
  user: Prisma.User
}

export const TokenInfoCard = ({ token, user }:TokenInfoProps) => {
  const erc20queryClint = new IERC20Queries(token.tokenAddress, token.networkId);

  const { data:networkName } = erc20queryClint.useNameQuery();
  const networkAddress = erc20queryClint.contractAddress; 
  const address = user?.publicKey??'';
  const { data:balance } = erc20queryClint.useBalanceOfQuery(address);
  const { data:symbol } = erc20queryClint.useSymbolQuery()

  console.log();

  return (
    <Col span={8}>
      <Card size="default" className='tokenCard'>
        <Button className="delete-btn"><AiFillDelete/></Button>
        <ul > 
          <li>Network Name : {networkName?<span>{networkName}</span>:'Undefined'}</li>
          <li>Network Address: <span><CopyAbleAddress address={networkAddress}/></span></li>
          <li>Balance: <span >{ethers.utils.formatUnits(balance??0, token.decimals) }<span className="symbol ml-2">{symbol}</span></span></li>
        </ul>
      </Card>
    </Col>
  )
}

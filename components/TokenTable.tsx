import { tokenInfo } from "@prisma/client"
type TokenTableProps = {
    tokens: Array<tokenInfo>
}
export const TokenTable = ( {tokens}  : TokenTableProps) => {
    console.log(tokens)
  return (
    <div>Token Table</div>
  )
}

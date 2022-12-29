import { ethers, upgrades } from 'hardhat'

async function main() {
  const contract = await ethers.getContractFactory("HeyResearchLab");
  const proxy = await upgrades.upgradeProxy(`${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`, contract)
  
  console.log("Contract Upgraded")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-abi-exporter";
import "@nomiclabs/hardhat-etherscan";
import { join } from "path";
import { NetworksUserConfig } from "hardhat/types";
import { settings } from "./settings";

const networks: NetworksUserConfig = {};

// let defaultNetwork = "goerli"

// networks[defaultNetwork] = {
//   url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
//   accounts: ["f18ffdb1e7734c6f7769b8f2b984428fccc46d2ffc502eca22f6ac8e147493cb"]
// };

const config: HardhatUserConfig = {
	solidity: "0.8.17",
	typechain: {
		outDir: join(__dirname, "generated"),
	},
	abiExporter: {
		path: join(__dirname, "generated/abi"),
		runOnCompile: true,
		clear: true,
		flat: true,
		only: settings.contracts.map((name) => `:${name}$`),
		spacing: 4,
	},
	networks,
	etherscan: {
		apiKey: settings.etherscanApi,
	},
};

export default config;

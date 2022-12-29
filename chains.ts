import {
	Chain,
	arbitrum,
	arbitrumGoerli,
	avalanche,
	avalancheFuji,
	bsc,
	bscTestnet,
	evmos,
	evmosTestnet,
	fantom,
	fantomTestnet,
	goerli,
	gnosis,
	localhost,
	mainnet,
	optimism,
	optimismGoerli,
	polygon,
	polygonMumbai,
	sepolia,
	taraxa,
	taraxaTestnet,
} from "wagmi/chains";
import { settings } from "./settings";

export const chainMap: {
  [x: string]: any; [chainId: number]: Chain 
} = {
	42161: arbitrum,
	421613: arbitrumGoerli,
	43114: avalanche,
	43113: avalancheFuji,
	56: bsc,
	97: bscTestnet,
	9001: evmos,
	9000: evmosTestnet,
	250: fantom,
	4002: fantomTestnet,
	5: goerli,
	100: gnosis,
	31337: localhost,
	1: mainnet,
	10: optimism,
	420: optimismGoerli,
	137: polygon,
	80001: polygonMumbai,
	11155111: sepolia,
	841: taraxa,
	842: taraxaTestnet,
};

export const appChains = Object.keys(chainMap).reduce(
	(accumulator: Array<Chain>, chainId) => {
		const chainIdParsed = Number(chainId);
		if (settings.chainIds.includes(chainIdParsed)) {
			accumulator.push(chainMap[chainIdParsed]);
		}
		return accumulator;
	},
	[]
);

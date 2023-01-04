import { ethers } from "ethers";
import { Chain } from "wagmi";
import { IERC20__factory } from "../generated";

export function collapseAddress(address: string) {
    return `${address.substring(0, 3)}...${address.substring(address.length-6)}`
}

export const nFormatter = (num: number, digits: number = 1) => {
	const lookup = [
		{ value: 1, symbol: "" },
		{ value: 1e3, symbol: "K" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e9, symbol: "G" },
		{ value: 1e12, symbol: "T" },
		{ value: 1e15, symbol: "P" },
		{ value: 1e18, symbol: "E" },
	];

	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	const item = lookup
		.slice()
		.reverse()
		.find((item) => {
			return num >= item.value;
		});
	return item
		? (num / item.value)
				.toLocaleString("en-US", {
					maximumFractionDigits: digits,
				})
				.replace(rx, "$1") + item.symbol
		: "0";
}

export const rpcUrlFromChain = (chain: Chain) => {
	return {
		http: '',
		webSocket: undefined
	}
}

export const getSymbol = async (networkAddress:string, rpcUrl: string) => {
	const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
	const contract = IERC20__factory.connect(networkAddress, provider);
	return await contract.symbol();
}

export const getDecimals = async (networkAddress:string, rpcUrl: string) => {
	const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
	const contract = IERC20__factory.connect(networkAddress, provider);
	return await contract.decimals();
}

export const getTotalSupply = async (networkAddress:string, rpcUrl: string) => {
	const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
	const contract = IERC20__factory.connect(networkAddress, provider);
	return await contract.totalSupply();
}


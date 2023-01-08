import { CopyToClipboard } from "react-copy-to-clipboard";
import React, { useState } from "react";
import { collapseAddress } from "../utils/helpers";

export const CopyAbleAddress: React.FC<{
	address: string;
	signerAddress?: string;
}> = (
	{ address, signerAddress } = {
		address: "",
		signerAddress: undefined,
	}
) => {
	const [copied, setCopied] = useState(false);
	const listener = () => {
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 5000);
	};
	return (
		<CopyToClipboard text={address} onCopy={listener}>
			<span className="public-address cursor-pointer">
				{copied && <span>Copied...</span>}
				{address &&
					(signerAddress &&
					signerAddress.toLowerCase() === address.toLowerCase()
						? "Me"
						: collapseAddress(address))}
			</span>
		</CopyToClipboard>
	);
};

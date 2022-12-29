import { NextApiRequest, NextApiResponse } from "next";
import { eventMap } from "../../server/event-map";
import { parseWebhookLogs } from "../../server/helpers";
import { SoftAxisMoralis } from "../../utils/moralis";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	let verified = false;
	const { body, headers } = req;

	try {
		verified = SoftAxisMoralis.Streams.verifySignature({
			body,
			signature: headers["x-signature"] as string,
		});
	} catch (e) {}

	if (verified) {
		const results: Array<any> = [];
		const parsed = parseWebhookLogs(body)
		for (const eventData of parsed) {
			let r = null;
			if (typeof eventMap[eventData.name] === "function") {
				r = await eventMap[eventData.name](eventData.params);
			}
			results.push(r);
		}

		return res.status(200).json(results);
	}

	res.status(401).json({ message: "Unauthorized" });
}

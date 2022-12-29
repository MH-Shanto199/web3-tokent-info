import { settings } from './../settings';
import { Indexed, Interface, JsonFragment } from "@ethersproject/abi";
import { IWebhook } from "@moralisweb3/streams-typings";
import axios from "axios";
import { BigNumber } from "ethers";
import {
	GetServerSideProps,
	GetServerSidePropsContext,
} from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import { sprintf } from "sprintf-js";
import { prisma } from "../server/prisma";
export interface ParsedLog {
	name: string;
	params: any;
}

export interface LogParam {
	value: LogParamValue;
	type: string;
}

export type LogParamValue = BigNumber | string;

export const gateways = [
	"https://%s.ipfs.w3s.link/%s",
	"https://cloudflare-ipfs.com/ipfs/%s/%s",
	"https://ipfs.io/ipfs/%s/%s",
	"https://%s.ipfs.dweb.link/%s",
];

export const getIpfsData = async <TData>(cid: string) => {
	let dataFromRequest,
		gatewayIndex = 0;
	while (!dataFromRequest && gatewayIndex < gateways.length) {
		try {
			const { data: metaData } = await axios.get<TData>(
				sprintf(
					gateways[gatewayIndex],
					cid,
					"meta.json"
				),
				{
					headers: {
						Accept: "application/json",
					},
				}
			);

			dataFromRequest = metaData;
			break;
		} catch (e) {
			gatewayIndex++;
		}
	}

	return { data: dataFromRequest, gateway: gateways[gatewayIndex] }
};

export const parseWebhookLogs = (webhook: IWebhook): Array<ParsedLog> => {
	const abiInterface = new Interface(webhook.abi as JsonFragment[]);
	return webhook.logs.map((log) => {
		const topics = [log.topic0, log.topic1, log.topic2, log.topic3].filter(
			(t) => t !== null
		) as string[];

		// Do not call the `this.abiInterface.parseLog()` method here! The @ethersproject/abi package (5.7.0) has a bug,
		// that doesn't return `args` with named keys in a specific case. That problem doesn't occur when we call directly the decodeEventLog() method.

		const eventFragment = abiInterface.getEvent(topics[0]);
		const args = abiInterface.decodeEventLog(
			eventFragment,
			log.data,
			topics
		);

		const params: Record<string, LogParam> = {};

		for (const input of eventFragment.inputs) {
			let value = args[input.name];
			if (value instanceof Indexed) {
				value = value.hash;
			}
			params[input.name] = {
				type: input.type,
				value,
			};
		}

		const decodedLog: any = {};
		for (const key in params) {
			if (Object.prototype.hasOwnProperty.call(params, key)) {
				const element = params[key];
				decodedLog[key] = element.value;
			}
		}

		return {
			name: eventFragment.name,
			params: decodedLog,
		};
	});
};

export const requireAuthorization = (
	allowedRoles: Array<string> = [],
	redirectUri: string = settings.url.signIn,
	callback:
		| ((
				context: GetServerSidePropsContext,
				user: User
		  ) => { [key: string]: any })
		| null = null
): GetServerSideProps => {
	return async (context) => {
		const session = await getSession(context);

		// @ts-ignore
		if (
			session &&
			session.user /* && allowedRoles.includes(session.user.role)*/
		) {
			let results: { [key: string]: any } = {};
			if (callback) {
				results = await callback(context, session.user);

				if (results.redirect) {
					return { redirect: results.redirect };
				}
			}

			return {
				props: { user: session.user, ...results.props },
			};
		}

		return {
			redirect: {
				destination: redirectUri,
				permanent: false,
			},
		};
	};
};

export const userFromAddress = (address: string) => {
	let role = "intern";
	if (
		address.toLowerCase() === settings.owner.publicKey.toLowerCase()
	) {
		role = "owner";
	}

	return prisma.user.upsert({
		where: {
			publicKey: address,
		},
		update: {},
		create: {
			publicKey: address,
			name: "Mr. X",
			role,
		},
	});
};

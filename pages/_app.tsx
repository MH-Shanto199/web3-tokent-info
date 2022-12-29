import "../styles/globals.css";
import type { AppType } from "next/app";
import { createClient, configureChains, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { trpc } from "../utils/trpc";
import { DefaultLayout } from "../layouts/DefaultLayout";
import NextNProgress from 'nextjs-progressbar';
import { AppPropsWithLayout } from "../types/soft-axis";
import { ReactNode } from "react";
import { rpcUrlFromChain } from "../utils/helpers";
import { settings } from "../settings";
import { appChains } from "../chains";
import 'antd/dist/reset.css';

const SoftAxisApp = (({ Component, pageProps }: AppPropsWithLayout) => {
	const getLayout = Component.getLayout ?? ((page: ReactNode) => <DefaultLayout>{page}</DefaultLayout>);

	const { provider, webSocketProvider } = configureChains(
		appChains,
		[
			publicProvider(),
			//http|webSocket
			jsonRpcProvider({
				rpc: rpcUrlFromChain,
			}),
		]
	);

	const client = createClient({
		provider,
		webSocketProvider,
		autoConnect: true,
	});

	return (
		<WagmiConfig client={client}>
			<SessionProvider session={pageProps.session} refetchInterval={0}>
				<NextNProgress color={settings.ui.progressBarColor}/>
				<Toaster position="bottom-right" reverseOrder={true} />
				{getLayout(<Component {...pageProps} />)}
				<ReactQueryDevtools initialIsOpen={false} />
			</SessionProvider>
		</WagmiConfig>
	);
}) as AppType;

export default trpc.withTRPC(SoftAxisApp);

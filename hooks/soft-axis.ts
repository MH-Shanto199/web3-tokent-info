import { settings } from "../settings";
import { useSession, signOut } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import { Address, useEnsAvatar, useDisconnect, useSigner } from "wagmi";
import { Web3Storage } from "web3.storage";

export const useWeb3Storage = () => new Web3Storage(settings.web3Storage);

export const useSoftAxisAddress = () => {
	const { data: sessionData } = useSession();

	const address = useMemo(() => {
		if (sessionData && sessionData.user) {
			return sessionData.user.publicKey as unknown as Address;
		}
		return "0x0000000000000000000000000000000000000000";
	}, [sessionData]);

	return address;
};

export const useSoftAxisAvatar = () => {
	const address = useSoftAxisAddress();
	const avatarData = useEnsAvatar({ address });

	return useMemo(() => {
		if (!avatarData.isLoading && !avatarData.isError && avatarData.data)
			return avatarData.data;
		return `https://i.pravatar.cc/80?u=${address}`;
	}, [avatarData, address]);
};

export const useSoftAxisSigner = () => {
	const { disconnect } = useDisconnect();
	const [loading, setLoading] = useState(true);
	const signerData = useSigner({
		onSettled(data, error) {
			if (error) {
				disconnect();
				signOut({
					callbackUrl: settings.url.signIn,
					redirect: true,
				});
			}
		},
	});

	useEffect(() => {
		const timeout = setTimeout(() => {
			setLoading(false);
		}, 5000);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (!loading) {
			if (!signerData.data) {
				disconnect();
				signOut({
					callbackUrl: settings.url.signIn,
					redirect: true,
				});
			}
		}
	}, [disconnect, loading, signerData]);

	return signerData;
};

export const useCountdown = (targetDate: Date) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

	const isExpired = useMemo(() => !remainingSeconds, [remainingSeconds]);

	const timer = useMemo(() => {
		let seconds = remainingSeconds;

		let days = Math.floor(seconds / (24 * 3600));
		seconds -= days * (24 * 3600);

		let hours = Math.floor(seconds / 3600);
		seconds -= hours * 3600;

		let minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;

		seconds = Math.floor(seconds);

		return {
			seconds: seconds.toString().padStart(2, "0"),
			minutes: minutes.toString().padStart(2, "0"),
			hours: hours.toString().padStart(2, "0"),
			days: days.toString().padStart(2, "0"),
		};
	}, [remainingSeconds]);

	useEffect(() => {
		setRemainingSeconds(
			Math.floor((targetDate.getTime() - currentDate.getTime()) / 1000)
		);
		const interval = setInterval(() => {
			if (remainingSeconds > 0) {
				setRemainingSeconds((seconds) => seconds - 1);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [currentDate, targetDate]);

	return { timer, isExpired };
};

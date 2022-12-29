import Prisma  from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
	// interface User {
	// 	id: number;
	// 	publicKey: string;
	// 	name: string | null;
	// 	email: string | null;
	// 	role: string;
	// }
	type User = Prisma.User
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: User;
	}
}

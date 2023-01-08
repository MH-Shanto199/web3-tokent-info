import { settings } from './../../../settings';
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import Web3Token from 'web3-token'
import { userFromAddress } from '../../../server/helpers';
import { User } from 'next-auth';

export default NextAuth({
  session: {
		maxAge: 3600
	},
  providers: [
    CredentialsProvider({
      name: 'Web3Auth',
      credentials: {
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.signature) throw new Error('Invalid signature')

          const { address } = await Web3Token.verify(credentials.signature)

          const user = await userFromAddress(address)

          if (!user) throw new Error('No user found')
          
          return user
        } catch (e) {
          return null
        }
      },
    }),
  ],
  callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
		async session({ session, token }) {
			(session as { user: unknown }).user = await userFromAddress((token.user as User).publicKey);
			return session;
		},
	},
  pages: {
    signIn: settings.url.signIn,
  },
})

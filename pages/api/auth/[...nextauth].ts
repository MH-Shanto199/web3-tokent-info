import { settings } from './../../../settings';
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import Web3Token from 'web3-token'
import { userFromAddress } from '../../../server/helpers';

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

          const { address } = await Web3Token.verify(credentials.signature, {
            domain: settings.domain,
          })

          const user = await userFromAddress(address)

          if (!user) throw new Error('No user found')

          return user
        } catch (e) {
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: settings.url.signIn,
  },
})

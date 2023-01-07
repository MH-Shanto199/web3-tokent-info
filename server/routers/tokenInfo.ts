import { router, publicProcedure, authProcedure } from '../trpc';
import { z } from 'zod';
import  { prisma }  from '../prisma';
import { TRPCError } from '@trpc/server';

export const tokenInfoRouter = router({
    tokenList: authProcedure.query(async () => {
        const items = await prisma.tokenInfo.findMany();
        return {
            Tokens: items.reverse(),
        };
    }),
    addTokenInfo: authProcedure.input(
        z.object({
            networkId: z.number(),
            tokenAddress: z.string(),
            symbol: z.string(),
            decimals: z.number()
        })
    ).mutation(async ({ input }) => {
        const isExist = await prisma.tokenInfo.findFirst({
            where: {
                networkId: input.networkId,
                tokenAddress: input.tokenAddress
            }
        })
        if (isExist) {
            throw new TRPCError({
                message: 'Token Info already Existed',
                code: 'CONFLICT'
            })
        }else{
            const saveToken = prisma.tokenInfo.create({
                data: input,
            })
            return saveToken;
        }
    }),
})
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify"

export default async (req: FastifyRequest,rep: FastifyReply, throwErr: HookHandlerDoneFunction) => {
  try {
    await req.jwtVerify()
  } catch (e) {
    const err = new Error("Invalid token")
    // @ts-ignore
    err.statusCode = 400
    throwErr(err)
  }
    
}
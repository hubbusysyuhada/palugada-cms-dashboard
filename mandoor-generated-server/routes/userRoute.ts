import { FastifyPluginCallback } from "fastify";
import UserHandler from "../handlers/UserHandler";
import AuthHandler from "../middleware/AuthHandler";


const userRoute: FastifyPluginCallback = (server, opts, next) => {

  server.get('/user/:external_id', UserHandler.getUser)
  server.post('/register', UserHandler.register)
  server.post('/login', UserHandler.logIn)
  server.get('/profile', { preHandler: [AuthHandler] }, UserHandler.profile)
  server.post('/change-password', { preHandler: [AuthHandler] }, UserHandler.changePassword)

  next()
}


export default userRoute
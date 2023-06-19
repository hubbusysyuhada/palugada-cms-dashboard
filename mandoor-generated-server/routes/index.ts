import { FastifyPluginCallback } from "fastify";
import userRoute from "./userRoute";
import memeRoute from "./memeRoute";


const baseRoute: FastifyPluginCallback = (server, opts, next) => {
  server.get('/ping', async (req, res) => {
    res.send("pong")
  })

  server.register(userRoute)
  server.register(memeRoute, {prefix: 'meme'})

  next()
}


export default baseRoute
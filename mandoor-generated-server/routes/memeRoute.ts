import { FastifyPluginCallback } from "fastify";
import Handler from "../handlers/MemeHandler";


const memeRoute: FastifyPluginCallback = (server, opts, next) => {

  server.get('/', { preHandler: [] }, Handler.findAll)
  server.post('/', { preHandler: [] }, Handler.create)
  server.get('/:id', { preHandler: [] }, Handler.findById)
  server.put('/:id', { preHandler: [] }, Handler.update)
  server.delete('/:id', { preHandler: [] }, Handler.delete)

  next()
}


export default memeRoute

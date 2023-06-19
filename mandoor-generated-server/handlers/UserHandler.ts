import * as qs from "qs"
import { FastifyReply, FastifyRequest } from "fastify";
import User, { relationColumns } from "../database/entity/User";
import { UserJWT } from "../@types/fastify";

export default class {
  static async getUser(req: FastifyRequest<{ Params: { external_id: string } }>, rep: FastifyReply) {
    const external_id = req.params.external_id
    const entityManager = await req.orm.getEm()
    const data = await entityManager.find(User, { external_id })
    return rep.code(200).send({ data })
  }

  static async register(req: FastifyRequest<{ Body: { external_id: string; password: string } }>, rep: FastifyReply) {
    const entityManager = await req.orm.getEm()
    const existingUser = await entityManager.findOne(User, { external_id: req.body.external_id })
    if (existingUser) return rep.code(400).send({ message: "User already existed!" })
    const user = new User()
    for (const key in req.body) {
      if (key === 'password') req.body[key] = await req.bcryptHash(req.body[key])
      user[key] = req.body[key]
    }
    try {
      await entityManager.persistAndFlush(user)
      return rep.code(201).send({ message: "User created" })
    } catch (error) {
      return rep.code(400).send({ error })
    }
  }

  static async logIn(req: FastifyRequest<{ Body: { external_id: string; password: string } }>, rep: FastifyReply) {
    const entityManager = await req.orm.getEm()
    const external_id = req.body.external_id
    const user = await entityManager.findOne(User, { external_id })
    if (user) {
      const isPasswordCorrect = await req.bcryptCompare(req.body.password, user.password)
      if (isPasswordCorrect) {
        const token = req.server.jwt.sign(user as UserJWT, { expiresIn: '1w' })
        return rep.code(200).send({ token })
      }
    }
    return rep.code(400).send({ message: "invalid External Id / Password" })
  }

  static async profile(req: FastifyRequest<{ Params: { external_id: string } }>, rep: FastifyReply) {
    const entityManager = await req.orm.getEm()
    const external_id = req.user.external_id
    const data = await entityManager.findOne(User, { external_id })
    return rep.code(200).send({ data })
  }

  static async changePassword(req: FastifyRequest<{ Body: { external_id: string; password: string; newPassword: string; } }>, rep: FastifyReply) {
    const entityManager = await req.orm.getEm()
    const external_id = req.body.external_id
    if (!req.body.newPassword) return rep.code(400).send({ message: "new password must not empty" })
    const user = await entityManager.findOne(User, { external_id })
    if (user) {
      const isPasswordCorrect = await req.bcryptCompare(req.body.password, user.password)
      if (isPasswordCorrect) {
        user.password = await req.bcryptHash(req.body.newPassword)
        await entityManager.persistAndFlush(user)
        return rep.code(200).send({ message: "Password changed" })
      }
    }
    return rep.code(400).send({ message: "invalid External Id / Password" })
  }


}
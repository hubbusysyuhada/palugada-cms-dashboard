import OrmInstance from "../../database";

type UserJWT = {
  id: string;
  external_id: string;
  created_at: Date;
  profile_picture: string;
  is_verified: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    orm: OrmInstance
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: UserJWT
    user: UserJWT
  }
}
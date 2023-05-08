// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import { zip } from 'zip-a-folder';
import { EnvObj } from '@/components/env';
import { Schema } from '@/components/schema';
import ServerGenerator from '@/helper/ServerGenerator';

interface ExtendedNextApiRequest extends NextApiRequest {
  body: RequestBody
}

export interface RequestBody {
  env: EnvObj[];
  schema: Schema;
};

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  const serverGenerator = new ServerGenerator(req.body)
  await serverGenerator.generateServer()

  const fileStream = serverGenerator.getFileStream()

  fileStream.on('open', () => {
    fileStream.pipe(res)
  })
  fileStream.on('end', () => {
    serverGenerator.deleteDirectory()
    fs.unlink('./mandoor-generated-server.zip', () => { })
  })

}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import { zip } from 'zip-a-folder';
import { EnvObj } from '@/components/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }
  const env: EnvObj[] = req.body.env

  // create env
  const dir = './mandoor-generated-server'
  fs.mkdirSync(dir)

  let envExample = ''
  let envServer = ''

  env.forEach(({ key, value }) => {
    envExample += `${key}=\n`
    envServer += `${key}=${value}\n`
  })

  fs.writeFileSync(`${dir}/.env.example`, envExample, { encoding: 'utf-8' })
  fs.writeFileSync(`${dir}/.env`, envServer, { encoding: 'utf-8' })

  await zip(dir, './mandoor-generated-server.zip')

  fs.rmSync(dir, { recursive: true, force: true });

  const fileStream = fs.createReadStream(`./mandoor-generated-server.zip`)
  fileStream.on('open', () => {
    fileStream.pipe(res)
  })
  fileStream.on('end', () => {
    fs.unlink('./mandoor-generated-server.zip', () => { })
  })

}

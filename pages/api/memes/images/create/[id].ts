import type { NextApiRequest, NextApiResponse } from 'next'
import fs, { promises as fsPromise } from 'fs'
import path from 'path'

type Meme = {
  id: string;
  name: string;
  url: string;
  box_count: number;
  description: string;
}

async function retrieveMemesJsonFile(): Promise<Meme[]> {
  const memesJson = await fsPromise.readFile(path.join(process.cwd(), 'public', 'memes.json'), 'utf-8')
  return JSON.parse(memesJson)
}

type Data = {
  error?: string;
  memeUrl?: string;
}

/**
 * @description Makes a request to imgflip to create a meme based on the meme id and captions passed
 * @param req contains the meme id and captions
 * @param res returns the meme url
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'This type of request is not supported.' })
    return
  }

  if (!req.body.captions || !req.query.id) {
    res.status(400).json({ error: 'Meme ID and captions are required.' })
    return
  }

  if (!fs.existsSync(path.join(process.cwd(), 'public', 'memes.json'))) {
    res.status(500).json({ error: 'Unable to retrieve memes.' })
    return
  }

  const memes = await retrieveMemesJsonFile()
  const memeId = req.query.id as string

  const meme = memes.find(meme => meme.id === memeId)

  if (!meme) {
    res.status(404).json({ error: 'Meme not found.' })
    return
  }

  const { captions } = req.body

  // prepare the request body to imgFlip
  const body = new URLSearchParams()
  body.append('template_id', memeId)
  body.append('username', process.env.IMGFLIP_USERNAME as string)
  body.append('password', process.env.IMGFLIP_PASSWORD as string)
  captions.forEach((caption: string, index: number) => {
    body.append(`boxes[${index}][text]`, caption)
  })

  const response = await fetch('https://api.imgflip.com/caption_image', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  })

  if (!response.ok) {
    res.status(500).json({ error: 'Error creating meme.' })
    return
  }

  const { data } = await response.json()
  const memeUrl = data.url

  res.status(201).json({ memeUrl })
}

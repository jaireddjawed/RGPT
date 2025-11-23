import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { saveAs } from 'file-saver'
import Button from '../../components/button'

type Caption = {
  text: string
}

type Meme = {
  captions: Caption[]
  imgFlipMemeId: string
  invitation: string
  memeUrl: string
}

export default function RenderMeme() {
  const router = useRouter()

  const [isLoading, setLoadingStatus] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [meme, setMemeData] = useState<Meme | null>(null)

  useEffect(() => {
    async function generateMeme() {
      const response = await fetch(`/api/memes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const { error } = await response.json()
        setError(error)
        setLoadingStatus(false)
      }
      else {
        const memeData = await response.json()

        // find any hashtags within the invitation and give them lightblue color in dark mode
        // and a regular shade of blue in light mode
        const invitation = memeData.invitation.replace(/(^|\W)(#.*?(?= #|$))/ig, '$1<span class="text-blue-600 dark:text-blue-400">$2</span>')

        setMemeData({
          captions: memeData.captions,
          imgFlipMemeId: memeData.imgFlipMemeId,
          memeUrl: memeData.memeUrl,
          invitation,
        })

        setLoadingStatus(false)
      }
    }

    generateMeme()
  }, [router])

  if (isLoading) {
    return (
      <div className="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  else if (!isLoading && meme !== null) {
    return (
      <div className="p-6 mt-6 text-left border w-auto lg:w-[30rem] rounded-xl shadow-xl">
        <div className="meme-container">
          <Image src={meme.memeUrl} alt="meme" width={500} height={500} />
          <p className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-50" dangerouslySetInnerHTML={{ __html: meme.invitation }} />
        </div>
        <div className="mt-6 mb-4">
          <Button type="success" onClick={() => saveAs(meme.memeUrl, 'bcoe-meme.jpg')}>Download Meme</Button>
          <Button type="primary" onClick={() => {
            setLoadingStatus(true)
            router.push('/')
          }}>
            View Random Meme Previously Generated
          </Button>
          <Button type="primary" onClick={() => {
            setLoadingStatus(true)
            router.push('/memes/new')
          }}>
            Generate New Meme with GPT (takes longer)
          </Button>
        </div>
      </div>
    )
  }

  else if (error !== null && !isLoading) {
    return (
      <div>{error}</div>
    )
  }

  else {
    return (
      <div>Something went wrong</div>
    )
  }
}

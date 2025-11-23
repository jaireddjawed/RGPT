import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { saveAs } from 'file-saver'
import { getFirestore, getDoc, doc } from 'firebase/firestore'
import Button from '../../components/button'
import { getFirebaseApp } from '../../utils/firebase.config'

type Caption = {
  text: string
}

type Meme = {
  captions: Caption[]
  imgFlipMemeId: string
  invitation: string
  created: Date
  memeUrl: string
}

export default function RenderMeme() {
  const router = useRouter()

  const [isLoading, setLoadingStatus] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [meme, setMemeData] = useState<Meme | null>(null)

  useEffect(() => {
    const { app } = getFirebaseApp()
    const db = getFirestore(app)

    async function getMeme() {
      // retrieve meme based on the id from the url
      const { id } = router.query

      if (!id) {
        return
      }

      const memeRef = doc(db, 'memes', id as string)
      const meme = await getDoc(memeRef)

      if (meme.exists() && meme.data().invitation && meme.data().invitation !== '' && meme.data().captions && meme.data().captions.length > 0) {
        const memeData = meme.data()

        // find any hastaags within the invitation and give them lightblue color in dark mode
        // and a regular shade of blue in light mode
        const invitation = memeData.invitation.replace(/(^|\W)(#.*?(?= #|$))/ig, '$1<span class="text-blue-600 dark:text-blue-400">$2</span>')

        // generate meme image from imgflip
        const imgFlipMemeId = memeData.imgFlipMemeId
        const captions = memeData.captions.map((caption: Caption) => caption.text)
        const response = await fetch(`/api/memes/images/create/${imgFlipMemeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ captions }),
        })

        if (!response.ok) {
          const { error } = await response.json()
          setError(error)
        }

        const { memeUrl } = await response.json()

        setMemeData({
          captions: memeData.captions,
          imgFlipMemeId: memeData.imgFlipMemeId,
          created: memeData.created,
          invitation,
          memeUrl,
        })
      }
      else {
        setError('No meme found.')
      }

      setLoadingStatus(false)
    }

    getMeme()
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

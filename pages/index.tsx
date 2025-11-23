import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getFirestore, collection, getCountFromServer, query, where, limit, getDocs } from 'firebase/firestore'
import { getFirebaseApp } from '../utils/firebase.config'
import seedRandom from 'seedrandom'
import { useRouter } from 'next/router'
import { saveAs } from 'file-saver'
import Button from '../components/button'

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
      const coll = collection(db, "memes");
      const memeSnapshot = await getCountFromServer(coll);
    
      // generate a random number with seedrandom because Math.random() didn't feel random enough
      const randomString = (Math.random() + 1).toString(36).substring(8)
      const rng = seedRandom(randomString)
      const randomIndex = Math.floor(rng() * memeSnapshot.data().count)

      const randomMemeQuery = query(collection(db, 'memes'), where("random", "==", randomIndex), limit(1))
      const meme = await getDocs(randomMemeQuery)

      if (meme.docs.length === 0) {
        setError('No meme could be found.')
        setLoadingStatus(false)
      }

      else {
        const memeData = meme.docs[0].data()

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

        setLoadingStatus(false)
      }
    }

    getMeme()
  }, [router])

  if (isLoading) {
    return null;
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

import { useState } from 'react'

interface LoaderProps {
  onStart: (audio: boolean) => void
  started: boolean
}

export const Loader = ({ onStart, started }: LoaderProps) => {
  const [show, setShow] = useState(true)

  if (!show || started) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white transition-opacity duration-1000">
      <div className="text-center">
        <h1 className="mb-8 text-4xl font-bold tracking-widest">ROBOTICS</h1>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              onStart(true)
              setTimeout(() => setShow(false), 500)
            }}
            className="px-6 py-2 border border-white hover:bg-white hover:text-black transition-colors"
          >
            ENTER EXPERIENCE
          </button>
          <button
            onClick={() => {
              onStart(false)
              setTimeout(() => setShow(false), 500)
            }}
            className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            MUTE
          </button>
        </div>
      </div>
    </div>
  )
}

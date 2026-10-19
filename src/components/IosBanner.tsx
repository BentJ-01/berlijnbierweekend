import { useState } from 'react'
import { readString, writeString } from '../lib/storage'

const KEY = 'iosBannerDismissed'

function shouldShow() {
  const ua = navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  return isIos && !standalone && !readString(KEY)
}

export function IosBanner() {
  const [show, setShow] = useState(shouldShow)
  if (!show) return null

  return (
    <div className="mx-4 mt-3 flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm">
      <div className="flex-1">
        <p className="font-bold text-amber-300">Zet me op je beginscherm</p>
        <p className="mt-1 text-zinc-300">
          Tik onderaan op <b>Delen</b> (vierkantje met pijl) en kies <b>"Zet op beginscherm"</b>.
        </p>
      </div>
      <button
        className="-mr-2 -mt-2 h-11 w-11 shrink-0 rounded-full text-xl text-zinc-400 active:bg-line"
        aria-label="Wegklikken"
        onClick={() => {
          writeString(KEY, '1')
          setShow(false)
        }}
      >
        ×
      </button>
    </div>
  )
}

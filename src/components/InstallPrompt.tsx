import { useEffect, useState } from 'react'
import { Download, EllipsisVertical, Share, SquarePlus } from 'lucide-react'
import { canPromptInstall, isIos, isMobile, isStandalone, onInstallChange, promptInstall } from '../lib/install'

const KEY = 'installPromptDismissed'

function dismissed() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** Grote melding om de app te installeren, enkel op smartphones in de browser. */
export function InstallPrompt() {
  const [show, setShow] = useState(() => isMobile() && !isStandalone() && !dismissed())
  const [canPrompt, setCanPrompt] = useState(canPromptInstall)

  useEffect(() => onInstallChange(() => setCanPrompt(canPromptInstall())), [])

  if (!show) return null

  function close() {
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      // negeren
    }
    setShow(false)
  }

  async function install() {
    if (await promptInstall()) setShow(false)
  }

  const step = 'flex items-center gap-3 rounded-xl bg-bg p-3'
  const icon = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-line text-amber-300'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md rounded-3xl border border-amber-400/40 bg-card p-6">
        <div className="mb-1 text-5xl">🍺</div>
        <h2 className="text-2xl font-black">Download BerlijnBierApp</h2>
        <p className="mt-1 text-zinc-400">Jow bierdrinkers, bij deze effe BerlijnBierApp me wa planning & info & tickets & pubgolf. Zet effe op beginscherm, is handiger.</p>

        <div className="mt-5 flex flex-col gap-2">
          {canPrompt ? (
            <button
              onClick={() => void install()}
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-amber-400 text-lg font-bold text-bg active:bg-amber-300"
            >
              <Download size={20} strokeWidth={2.5} />
              Installeren
            </button>
          ) : isIos() ? (
            <>
              <div className={step}>
                <span className={icon}>
                  <Share size={18} />
                </span>
                <span>
                  Tik op <b>Deel</b> (vierkantje met pijl, onderaan of bovenaan)
                </span>
              </div>
              <div className={step}>
                <span className={icon}>
                  <SquarePlus size={18} />
                </span>
                <span>
                  Kies <b>Zet op beginscherm</b> en tik op <b>Voeg toe</b>
                </span>
              </div>
            </>
          ) : (
            <>
              <div className={step}>
                <span className={icon}>
                  <EllipsisVertical size={18} />
                </span>
                <span>
                  Tik op het <b>menu</b> (drie puntjes rechtsboven)
                </span>
              </div>
              <div className={step}>
                <span className={icon}>
                  <Download size={18} />
                </span>
                <span>
                  Kies <b>App installeren</b> of <b>Toevoegen aan startscherm</b>
                </span>
              </div>
            </>
          )}
        </div>

        <button onClick={close} className="mt-3 min-h-12 w-full rounded-2xl text-zinc-400 active:bg-line">
          Later
        </button>
      </div>
    </div>
  )
}

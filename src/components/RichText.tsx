import type { ReactNode } from 'react'

/** Mini-opmaak: "## kop", "- opsomming", lege regel = nieuwe alinea, **vet**. */
export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let list: string[] = []

  const flushList = () => {
    if (!list.length) return
    blocks.push(
      <ul key={blocks.length} className="mb-3 list-disc space-y-1 pl-5">
        {list.map((li, i) => (
          <li key={i}>{bold(li)}</li>
        ))}
      </ul>,
    )
    list = []
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('- ')) {
      list.push(line.slice(2))
      continue
    }
    flushList()
    if (!line) continue
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={blocks.length} className="mb-1 mt-4 text-base font-bold text-amber-300">
          {line.slice(3)}
        </h3>,
      )
    } else {
      blocks.push(
        <p key={blocks.length} className="mb-3">
          {bold(line)}
        </p>,
      )
    }
  }
  flushList()

  return <div className="text-[15px] leading-relaxed text-zinc-300">{blocks}</div>
}

function bold(s: string): ReactNode {
  const parts = s.split(/\*\*(.+?)\*\*/g)
  return parts.map((p, i) => (i % 2 ? <b key={i} className="text-zinc-100">{p}</b> : p))
}

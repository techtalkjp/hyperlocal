import React from 'react'
import { Button } from '~/components/ui'
import type { GooglePlace } from '~/services/db'

export const LLMTest = ({ place }: { place: GooglePlace }) => {
  const [isCopied, setIsCopied] = React.useState(false)
  const { displayName, reviews } = place

  return (
    <Button
      type="button"
      size="xs"
      onClick={async () => {
        await global.navigator.clipboard.writeText(
          JSON.stringify({ displayName, reviews }, null, 2),
        )
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 1000)
      }}
    >
      {isCopied ? 'Copied!' : 'Copy'}
    </Button>
  )
}

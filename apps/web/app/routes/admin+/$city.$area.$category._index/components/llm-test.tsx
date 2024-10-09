import type { GooglePlace } from '@hyper-local/db'
import React from 'react'
import { Button } from '~/components/ui'

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

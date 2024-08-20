import { Link } from '@remix-run/react'

import { Card, CardHeader, CardTitle, Stack } from '~/components/ui'

export default function AreaIndexPage() {
  return (
    <Stack className="px-2">
      <Link to="./cafe" prefetch="intent">
        <Card>
          <CardHeader>
            <CardTitle>カフェ</CardTitle>
          </CardHeader>
        </Card>
      </Link>
    </Stack>
  )
}

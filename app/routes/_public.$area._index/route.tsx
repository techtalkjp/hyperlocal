import { Link } from '@remix-run/react'
import categories from '~/assets/categories.json'
import { Card, CardHeader, CardTitle } from '~/components/ui'

export default function AreaIndexPage() {
  return (
    <div className="grid grid-cols-2 gap-2 px-2">
      {categories.map((category) => (
        <Link to={`./${category.id}`} key={category.id} prefetch="intent">
          <Card>
            <CardHeader>
              <CardTitle>{category.i18n.en}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}

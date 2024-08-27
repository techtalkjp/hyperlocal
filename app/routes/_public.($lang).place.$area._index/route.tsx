import { Link } from '@remix-run/react'
import { Card, CardHeader, CardTitle } from '~/components/ui'
import categories from '~/consts/categories'

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

import { areas, scenes } from '@hyperlocal/consts'
import { Link } from 'react-router'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HStack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui'
import type { Route } from './+types/route'
import { listAreaArticles } from './queries.server'

export const loader = async () => {
  const articles = await listAreaArticles()
  return { articles }
}

export default function ArticlesIndexPage({
  loaderData: { articles },
}: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <HStack className="items-start">
          <div className="flex-1">
            <CardTitle>Area Articles</CardTitle>
            <CardDescription>
              Manage hyperlocal area guide articles
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/articles/new">Create New Article</Link>
          </Button>
        </HStack>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Scene</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground text-center"
                >
                  No articles yet. Create your first article!
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => {
                const area = areas.find((a) => a.areaId === article.areaId)
                const scene = scenes.find((s) => s.id === article.sceneId)
                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {article.title}
                    </TableCell>
                    <TableCell>{area?.name || article.areaId}</TableCell>
                    <TableCell>{scene?.i18n.ja || article.sceneId}</TableCell>
                    <TableCell>{article.language}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          article.status === 'published' ? 'default' : 'outline'
                        }
                      >
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(article.updatedAt).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/articles/${article.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

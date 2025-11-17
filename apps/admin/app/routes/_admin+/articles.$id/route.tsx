import { areas, scenes } from '@hyperlocal/consts'
import { data, redirect } from 'react-router'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HStack,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Textarea,
} from '~/components/ui'
import type { Route } from './+types/route'
import { deleteArticle, getArticle, updateArticle } from './queries.server'

export const loader = async ({ params }: Route.LoaderArgs) => {
  if (!params.id) {
    throw new Response('Not Found', { status: 404 })
  }
  const article = await getArticle(params.id)
  if (!article) {
    throw new Response('Not Found', { status: 404 })
  }
  return { article }
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (!params.id) {
    throw new Response('Not Found', { status: 404 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'update') {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const metadata = formData.get('metadata') as string
    const status = formData.get('status') as string

    await updateArticle(params.id, {
      title,
      content,
      metadata,
      status,
    })

    return data({ success: true })
  }

  if (intent === 'delete') {
    await deleteArticle(params.id)
    return redirect('/articles')
  }

  return data({ error: 'Invalid intent' }, { status: 400 })
}

export default function EditArticlePage({
  loaderData: { article },
  actionData,
}: Route.ComponentProps) {
  const area = areas.find((a) => a.areaId === article.areaId)
  const scene = scenes.find((s) => s.id === article.sceneId)

  return (
    <Stack className="gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Article</CardTitle>
          <CardDescription>
            {area?.name} - {scene?.i18n.ja} ({article.language})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post">
            <input type="hidden" name="intent" value="update" />
            <Stack>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input name="title" defaultValue={article.title} required />
              </div>

              <div>
                <Label htmlFor="content">Content (MDX)</Label>
                <Textarea
                  name="content"
                  defaultValue={article.content}
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-muted-foreground mt-1 text-sm">
                  MDX format. Use &lt;Place id="..." /&gt; components to embed
                  places
                </p>
              </div>

              <div>
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  name="metadata"
                  defaultValue={
                    typeof article.metadata === 'string'
                      ? article.metadata
                      : JSON.stringify(article.metadata, null, 2)
                  }
                  rows={3}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={article.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <HStack className="justify-between">
                <Button type="submit">Update Article</Button>
                {actionData &&
                  'success' in actionData &&
                  actionData.success && (
                    <span className="text-green-600">Saved successfully!</span>
                  )}
              </HStack>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            method="post"
            onSubmit={(e: React.FormEvent) => {
              if (!confirm('Are you sure you want to delete this article?')) {
                e.preventDefault()
              }
            }}
          >
            <input type="hidden" name="intent" value="delete" />
            <Button type="submit" variant="destructive">
              Delete Article
            </Button>
          </form>
        </CardContent>
      </Card>
    </Stack>
  )
}

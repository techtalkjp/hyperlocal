import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { areas, categories, languages, scenes } from '@hyperlocal/consts'
import { data, redirect } from 'react-router'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { generateArticle } from './generate-article.server'
import { createArticle, getPlacesForArea } from './queries.server'

const generateSchema = z.object({
  intent: z.literal('generate'),
  cityId: z.string().min(1),
  areaId: z.string().min(1),
  sceneId: z.string().min(1),
  language: z.string().min(1),
  categoryId: z.string().min(1),
})

const saveSchema = z.object({
  intent: z.literal('save'),
  cityId: z.string().min(1),
  areaId: z.string().min(1),
  sceneId: z.string().min(1),
  language: z.string().min(1),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  metadata: z.string().min(1, 'Metadata is required'),
  status: z.enum(['draft', 'published']),
})

export const loader = () => {
  return { areas, scenes, languages, categories }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'generate') {
    const submission = parseWithZod(formData, { schema: generateSchema })

    if (submission.status !== 'success') {
      return data({ lastResult: submission.reply(), generated: null })
    }

    const { cityId, areaId, sceneId, language, categoryId } = submission.value

    const area = areas.find((a) => a.areaId === areaId)
    const scene = scenes.find((s) => s.id === sceneId)

    if (!area || !scene) {
      return data({ error: 'Invalid area or scene' }, { status: 400 })
    }

    // Get places for the area
    const places = await getPlacesForArea(areaId, categoryId, 'rating')
    const placesData = places.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      rating: p.rating,
      userRatingCount: p.userRatingCount,
      priceLevel: p.priceLevel || undefined,
      reviews: JSON.parse(p.reviews),
    }))

    // Generate article
    const generated = await generateArticle({
      area,
      scene,
      language,
      places: placesData,
    })

    return data({
      lastResult: null,
      generated: {
        cityId,
        areaId,
        sceneId,
        language,
        ...generated,
      },
    })
  }

  if (intent === 'save') {
    const submission = parseWithZod(formData, { schema: saveSchema })

    if (submission.status !== 'success') {
      return data({ lastResult: submission.reply(), generated: null })
    }

    const {
      cityId,
      areaId,
      sceneId,
      language,
      title,
      content,
      metadata,
      status,
    } = submission.value

    const article = await createArticle({
      cityId,
      areaId,
      sceneId,
      language,
      title,
      content,
      metadata,
      status,
    })

    return redirect(`/articles/${article.id}`)
  }

  return data(
    { lastResult: null, generated: null, error: 'Invalid intent' },
    { status: 400 },
  )
}

export default function NewArticlePage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { areas, scenes, languages, categories } = loaderData
  const generated =
    actionData && 'generated' in actionData ? actionData.generated : undefined
  const lastResult =
    actionData && 'lastResult' in actionData ? actionData.lastResult : undefined

  const [generateForm, generateFields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: generateSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  const [saveForm, saveFields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: saveSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <Stack className="gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Article</CardTitle>
          <CardDescription>
            Generate a hyperlocal area guide with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" {...getFormProps(generateForm)}>
            <input
              {...getInputProps(generateFields.intent, { type: 'hidden' })}
              value="generate"
            />
            <Stack>
              <div>
                <Label htmlFor={generateFields.areaId.id}>Area</Label>
                <Select
                  name={generateFields.areaId.name}
                  required
                  defaultValue={generated?.areaId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.areaId} value={area.areaId}>
                        {area.name} ({area.i18n.en})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {generateFields.areaId.errors && (
                  <p className="mt-1 text-sm text-red-600">
                    {generateFields.areaId.errors}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={generateFields.sceneId.id}>Scene</Label>
                <Select
                  name={generateFields.sceneId.name}
                  required
                  defaultValue={generated?.sceneId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scene" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenes.map((scene) => (
                      <SelectItem key={scene.id} value={scene.id}>
                        {scene.i18n.ja} ({scene.i18n.en})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {generateFields.sceneId.errors && (
                  <p className="mt-1 text-sm text-red-600">
                    {generateFields.sceneId.errors}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={generateFields.language.id}>Language</Label>
                <Select
                  name={generateFields.language.name}
                  required
                  defaultValue={generated?.language || 'ja'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {generateFields.language.errors && (
                  <p className="mt-1 text-sm text-red-600">
                    {generateFields.language.errors}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={generateFields.categoryId.id}>
                  Category (for place selection)
                </Label>
                <Select
                  name={generateFields.categoryId.name}
                  required
                  defaultValue="lunch"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.i18n.ja} ({cat.i18n.en})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {generateFields.categoryId.errors && (
                  <p className="mt-1 text-sm text-red-600">
                    {generateFields.categoryId.errors}
                  </p>
                )}
              </div>

              <input
                {...getInputProps(generateFields.cityId, { type: 'hidden' })}
                value="tokyo"
              />

              <Button type="submit">Generate with AI</Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader>
            <CardTitle>Edit & Save</CardTitle>
            <CardDescription>
              Review and edit the generated article before saving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form method="post" {...getFormProps(saveForm)}>
              <input
                {...getInputProps(saveFields.intent, { type: 'hidden' })}
                value="save"
              />
              <input
                {...getInputProps(saveFields.cityId, { type: 'hidden' })}
                value={generated.cityId}
              />
              <input
                {...getInputProps(saveFields.areaId, { type: 'hidden' })}
                value={generated.areaId}
              />
              <input
                {...getInputProps(saveFields.sceneId, { type: 'hidden' })}
                value={generated.sceneId}
              />
              <input
                {...getInputProps(saveFields.language, { type: 'hidden' })}
                value={generated.language}
              />

              <Stack>
                <div>
                  <Label htmlFor={saveFields.title.id}>Title</Label>
                  <Input
                    {...getInputProps(saveFields.title, { type: 'text' })}
                    defaultValue={generated.title}
                  />
                  {saveFields.title.errors && (
                    <p className="mt-1 text-sm text-red-600">
                      {saveFields.title.errors}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={saveFields.content.id}>Content (MDX)</Label>
                  <Textarea
                    name={saveFields.content.name}
                    id={saveFields.content.id}
                    defaultValue={generated.content}
                    rows={20}
                    className="font-mono text-sm"
                  />
                  {saveFields.content.errors && (
                    <p className="mt-1 text-sm text-red-600">
                      {saveFields.content.errors}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1 text-sm">
                    MDX format. Use &lt;Place id="..." /&gt; components to embed
                    places
                  </p>
                </div>

                <div>
                  <Label htmlFor={saveFields.metadata.id}>
                    Metadata (JSON)
                  </Label>
                  <Textarea
                    name={saveFields.metadata.name}
                    id={saveFields.metadata.id}
                    defaultValue={JSON.stringify(generated.metadata, null, 2)}
                    rows={3}
                    className="font-mono text-sm"
                  />
                  {saveFields.metadata.errors && (
                    <p className="mt-1 text-sm text-red-600">
                      {saveFields.metadata.errors}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={saveFields.status.id}>Status</Label>
                  <Select name={saveFields.status.name} defaultValue="draft">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  {saveFields.status.errors && (
                    <p className="mt-1 text-sm text-red-600">
                      {saveFields.status.errors}
                    </p>
                  )}
                </div>

                <Button type="submit">Save Article</Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

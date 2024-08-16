import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { Form, useNavigation } from '@remix-run/react'
import {
  Button,
  HStack,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Stack,
} from '~/components/ui'
import { textQuerySchema } from '../schema'

export const TextQueryForm = () => {
  const [form, fields] = useForm({
    defaultValue: {
      query: '',
      radius: 160,
      minRating: 0,
      rankPreference: 'POPULARITY',
    },
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: textQuerySchema }),
  })
  const navigation = useNavigation()

  return (
    <Form method="GET" {...getFormProps(form)}>
      <Stack>
        <div>
          <Label htmlFor="query">Query</Label>
          <Input
            placeholder="カフェ"
            {...getInputProps(fields.query, { type: 'text' })}
          />
          <div className="text-sm text-destructive">{fields.query.errors}</div>
        </div>
        <div>
          <Label>Radius</Label>
          <HStack>
            <Slider
              min={80}
              max={800}
              step={40}
              onValueChange={(value) => {
                form.update({
                  name: fields.radius.name,
                  value: value[0].toString(),
                })
              }}
              id={fields.radius.id}
              name={fields.radius.name}
              key={fields.radius.key}
              defaultValue={
                fields.radius.value
                  ? [Number.parseInt(fields.radius.value)]
                  : undefined
              }
            >
              Radius
            </Slider>
            <div>{fields.radius.value}m</div>
          </HStack>
          <div className="text-sm text-destructive">{fields.radius.errors}</div>
        </div>
        <div>
          <Label htmlFor={fields.minRating.id}>Min Raiting</Label>
          <Select
            name={fields.minRating.name}
            defaultValue={fields.minRating.initialValue}
          >
            <SelectTrigger id={fields.minRating.id}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">What ever</SelectItem>
              <SelectItem value="4.5">4.5</SelectItem>
              <SelectItem value="4.0">4.0</SelectItem>
              <SelectItem value="3.5">3.5</SelectItem>
              <SelectItem value="3.0">3.0</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-destructive">
            {fields.minRating.errors}
          </div>
        </div>
        <div>
          <Label htmlFor="rankPreference">Rank Preference</Label>
          <Select name="rankPreference" defaultValue="POPULARITY">
            <SelectTrigger id="rankPreference">
              <SelectValue placeholder="Rank Preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="POPULARITY">Popularity</SelectItem>
              <SelectItem value="DISTANCE">Distance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          isLoading={navigation.state === 'loading'}
          type="submit"
          name="intent"
          value="textQuery"
        >
          Text Query
        </Button>
      </Stack>
    </Form>
  )
}

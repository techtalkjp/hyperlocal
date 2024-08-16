import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { Form, useNavigation } from '@remix-run/react'
import { Button, HStack, Label, Slider, Stack } from '~/components/ui'
import { PlaceTypeSelect } from '../components/place-type-select'
import { nearBySchema } from '../schema'

export const NearbyForm = () => {
  const [form, fields] = useForm({
    defaultValue: {
      radius: 160,
      minRating: '',
      primaryType: '',
    },
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: nearBySchema }),
  })
  const navigation = useNavigation()

  return (
    <Form method="GET" {...getFormProps(form)}>
      <Stack>
        <div>
          <Label htmlFor={fields.radius.id}>半径</Label>
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
          <Label htmlFor={fields.primaryType.id}>Primary Type</Label>
          <PlaceTypeSelect
            id={fields.primaryType.id}
            name={fields.primaryType.name}
            defaultValue={fields.primaryType.initialValue}
            key={fields.primaryType.key}
          />
          <div className="text-sm text-destructive">
            {fields.primaryType.errors}
          </div>
        </div>
        <Button
          isLoading={navigation.state === 'loading'}
          type="submit"
          name="intent"
          value="nearby"
        >
          Nearby Search
        </Button>
      </Stack>
    </Form>
  )
}

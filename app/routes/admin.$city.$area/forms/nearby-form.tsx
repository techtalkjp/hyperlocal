import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Form, useNavigation } from '@remix-run/react'
import {
  Button,
  HStack,
  Label,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Stack,
} from '~/components/ui'
import { PlaceTypeSelect } from '../components/place-type-select'
import { nearBySchema } from '../schema'

interface NearbyFormProps {
  radius?: number
}
export const NearbyForm = ({ radius = 400 }: NearbyFormProps) => {
  const [form, fields] = useForm({
    defaultValue: {
      radius,
      categoryId: '',
      rankPreference: 'POPULARITY',
    },
    constraint: getZodConstraint(nearBySchema),
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
              max={1200}
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
          <Label htmlFor={fields.categoryId.id}>Primary Type</Label>
          <PlaceTypeSelect
            id={fields.categoryId.id}
            name={fields.categoryId.name}
            defaultValue={fields.categoryId.initialValue}
            key={fields.categoryId.key}
          />
          <div className="text-sm text-destructive">
            {fields.categoryId.errors}
          </div>
        </div>

        <div>
          <Label>Rank Preference</Label>
          <RadioGroup
            key={fields.rankPreference.key}
            name={fields.rankPreference.name}
            defaultValue={fields.rankPreference.initialValue}
            onValueChange={(value) => {
              form.update({
                name: fields.rankPreference.name,
                value,
              })
            }}
            aria-invalid={!fields.rankPreference.valid || undefined}
            aria-describedby={
              !fields.rankPreference.valid
                ? fields.rankPreference.errorId
                : undefined
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="POPULARITY" id="popularity" />
              <Label htmlFor="popularity">Popularity</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="DISTANCE" id="distance" />
              <Label htmlFor="distance">Distance</Label>
            </div>
          </RadioGroup>
          <div id={fields.rankPreference.errorId} className="text-destructive">
            {fields.rankPreference.errors}
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

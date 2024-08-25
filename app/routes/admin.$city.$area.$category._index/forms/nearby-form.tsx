import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Form, useNavigation } from '@remix-run/react'
import {
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
  Stack,
} from '~/components/ui'
import { nearBySchema } from '../schema'

interface NearbyFormProps {
  categoryId: string
  radius?: number
}
export const NearbyForm = ({ radius = 400 }: NearbyFormProps) => {
  const [form, fields] = useForm({
    defaultValue: {
      radius,
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

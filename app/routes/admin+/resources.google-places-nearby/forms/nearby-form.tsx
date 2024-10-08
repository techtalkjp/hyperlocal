import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import {
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
  Stack,
} from '~/components/ui'
import type { loader } from '../route'
import { schema } from '../schema'

interface NearbyFormProps {
  cityId: string
  areaId: string
  categoryId: string
  radius?: number
}
export const NearbyForm = ({
  cityId,
  areaId,
  categoryId,
  radius,
}: NearbyFormProps) => {
  const fetcher = useFetcher<typeof loader>({
    key: `google-place-nearby-${cityId}-${areaId}-${categoryId}`,
  })
  const [form, fields] = useForm({
    defaultValue: {
      radius,
      rankPreference: 'POPULARITY',
    },
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema: schema }),
  })

  return (
    <fetcher.Form
      method="GET"
      action="/admin/resources/google-places-nearby"
      {...getFormProps(form)}
    >
      <Stack>
        <input type="hidden" name="cityId" value={cityId} />
        <input type="hidden" name="areaId" value={areaId} />
        <input type="hidden" name="categoryId" value={categoryId} />

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
          isLoading={fetcher.state === 'loading'}
          type="submit"
          name="intent"
          value="nearby"
        >
          Nearby Search
        </Button>
      </Stack>
    </fetcher.Form>
  )
}

import { Form } from '@remix-run/react'
import { useState } from 'react'
import { Button, HStack, Label, Slider, Stack } from '~/components/ui'
import { PlaceTypeSelect } from '../components/place-type-select'

export const NearbyForm = () => {
  const [radius, setRadius] = useState(160)
  return (
    <Form method="GET">
      <Stack>
        <div>
          <Label>半径</Label>
          <HStack>
            <Slider
              min={80}
              max={800}
              step={40}
              value={[radius]}
              onValueChange={(value) => {
                setRadius(value[0])
              }}
              name="radius"
            >
              Radius
            </Slider>
            <div>{radius}m</div>
          </HStack>
        </div>
        <div>
          <PlaceTypeSelect name="primaryType" />
        </div>
        <Button type="submit" name="intent" value="nearby">
          Nearby Search
        </Button>
      </Stack>
    </Form>
  )
}

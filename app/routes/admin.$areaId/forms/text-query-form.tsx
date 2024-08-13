import { Form } from '@remix-run/react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
} from '~/components/ui'

export const TextQueryForm = ({ textQuery }: { textQuery?: string }) => {
  return (
    <Form method="GET">
      <Stack>
        <Input
          id="textQuery"
          name="textQuery"
          defaultValue={textQuery ?? undefined}
          placeholder="text query"
        />
        <div>
          <Label htmlFor="minRating">Min Raiting</Label>
          <Select name="minRating" defaultValue="">
            <SelectTrigger id="minRaitng">
              <SelectValue placeholder="No Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4.5">4.5</SelectItem>
              <SelectItem value="4.0">4.0</SelectItem>
              <SelectItem value="3.5">3.5</SelectItem>
              <SelectItem value="3.0">3.0</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" name="intent" value="textQuery">
          TextQuery
        </Button>
      </Stack>
    </Form>
  )
}

import categories from '~/assets/categories.json'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui'

export const PlaceTypeSelect = ({
  id,
  name,
  ...rest
}: React.ComponentProps<typeof Select> & { id?: string }) => {
  return (
    <Select name={name} {...rest}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => {
          return (
            <SelectGroup key={category.id}>
              <SelectItem value={category.id}>{category.names.en}</SelectItem>
            </SelectGroup>
          )
        })}
      </SelectContent>
    </Select>
  )
}

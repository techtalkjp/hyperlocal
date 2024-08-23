import { useLoaderData } from '@remix-run/react'
import areas from '~/assets/areas.json'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui'

export const loader = () => {
  return { areas }
}

export default function AdminAreasIndexPage() {
  const { areas } = useLoaderData<typeof loader>()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Areas</CardTitle>
        <CardDescription>Area master data</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((area) => (
              <TableRow key={area.areaId}>
                <TableCell>{area.areaId}</TableCell>
                <TableCell>{area.name}</TableCell>
                <TableCell>{area.longitude}</TableCell>
                <TableCell>{area.latitude}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

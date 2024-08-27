import { useLoaderData } from '@remix-run/react'
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
import areas from '~/consts/areas'

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
              <TableHead>Area ID</TableHead>
              <TableHead>City ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Radius</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((area) => (
              <TableRow key={area.areaId}>
                <TableCell>{area.areaId}</TableCell>
                <TableCell>{area.cityId}</TableCell>
                <TableCell>{area.name}</TableCell>
                <TableCell>{area.longitude}</TableCell>
                <TableCell>{area.latitude}</TableCell>
                <TableCell>{area.radius}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

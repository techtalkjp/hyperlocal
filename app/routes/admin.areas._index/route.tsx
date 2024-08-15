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
import { db } from '~/services/db.server'
import * as schema from '~/services/db/schema'

export const loader = async () => {
  const areas = await db.select().from(schema.areas).all()
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
              <TableRow key={area.id}>
                <TableCell>{area.id}</TableCell>
                <TableCell>{area.name}</TableCell>
                <TableCell>{area.longitude}</TableCell>
                <TableCell>{area.latitude}</TableCell>
                <TableCell>{area.updated_at}</TableCell>
                <TableCell>{area.created_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

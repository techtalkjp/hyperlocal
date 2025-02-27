import { areas } from '@hyperlocal/consts'
import { Link } from 'react-router'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HStack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui'
import type { Route} from './+types/route'

export const loader = () => {
  return { areas }
}

export default function AdminAreasIndexPage({
  loaderData: {areas}
}: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <HStack className="items-start">
          <div className="flex-1">
            <CardTitle>Areas</CardTitle>
            <CardDescription>Area master data</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link to="add">Add New</Link>
          </Button>
        </HStack>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area ID</TableHead>
              <TableHead>City ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>i18n</TableHead>
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
                <TableCell>{JSON.stringify(area.i18n)}</TableCell>
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

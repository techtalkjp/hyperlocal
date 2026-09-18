import { areas } from "@hyperlocal/consts";
import { Link } from "react-router";
import { Button, Card, CardContent, Table, TableBody, TableCell, TableRow } from "~/components/ui";
import { PageHeader } from "~/components/page-header";
import { TableHeadRow } from "~/components/table-head-row";
import type { Route } from "./+types/_index";

export const loader = () => {
  return { areas };
};

export default function AdminAreasIndexPage({ loaderData: { areas } }: Route.ComponentProps) {
  return (
    <Card>
      <PageHeader
        title="Areas"
        description="Area master data"
        action={
          <Button variant="outline" asChild>
            <Link to="add">Add New</Link>
          </Button>
        }
      />
      <CardContent>
        <Table>
          <TableHeadRow
            heads={["Area ID", "City ID", "Name", "i18n", "Longitude", "Latitude", "Radius"]}
          />
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
  );
}

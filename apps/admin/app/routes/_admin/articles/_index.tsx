import { areas, scenes } from "@hyperlocal/consts";
import { Link } from "react-router";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "~/components/ui";
import { PageHeader } from "~/components/page-header";
import { TableHeadRow } from "~/components/table-head-row";
import { getEnv } from "~/lib/request-context";
import { listAreaArticles } from "./+queries.server";
import type { Route } from "./+types/_index";

export const loader = async ({ context }: Route.LoaderArgs) => {
  const articles = await listAreaArticles(getEnv(context));
  return { articles };
};

export default function ArticlesIndexPage({ loaderData: { articles } }: Route.ComponentProps) {
  const areaById = new Map<string, (typeof areas)[number]>(areas.map((a) => [a.areaId, a]));
  const sceneById = new Map<string, (typeof scenes)[number]>(scenes.map((s) => [s.id, s]));
  return (
    <Card>
      <PageHeader
        title="Area Articles"
        description="Manage hyperlocal area guide articles"
        action={
          <Button asChild>
            <Link to="/articles/new">Create New Article</Link>
          </Button>
        }
      />
      <CardContent>
        <Table>
          <TableHeadRow
            heads={["Title", "Area", "Scene", "Language", "Status", "Updated", "Actions"]}
          />
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center">
                  No articles yet. Create your first article!
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => {
                const area = areaById.get(article.areaId);
                const scene = sceneById.get(article.sceneId);
                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{area?.name || article.areaId}</TableCell>
                    <TableCell>{scene?.i18n.ja || article.sceneId}</TableCell>
                    <TableCell>{article.language}</TableCell>
                    <TableCell>
                      <Badge variant={article.status === "published" ? "default" : "outline"}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(article.updatedAt).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/articles/${article.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { TableHead, TableHeader, TableRow } from "~/components/ui";

/**
 * 管理画面の一覧テーブル見出し行
 */
export const TableHeadRow = ({ heads }: { heads: string[] }) => {
  return (
    <TableHeader>
      <TableRow>
        {heads.map((head) => (
          <TableHead key={head}>{head}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};

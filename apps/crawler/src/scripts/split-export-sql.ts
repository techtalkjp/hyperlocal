// Split the INSERT statements produced by export-sql.ts. Values may contain
// newlines, semicolons, and doubled single quotes, so line boundaries are unsafe.
export function splitExportSql(source: string): string[] {
  const statements: string[] = [];
  let start = 0;
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === "'") {
      if (quoted && source[i + 1] === "'") {
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === ";" && !quoted) {
      const statement = source.slice(start, i + 1).trim();
      if (!/^INSERT INTO "[a-z_]+" /i.test(statement)) {
        throw new Error("Export contains a non-INSERT statement");
      }
      statements.push(statement);
      start = i + 1;
    }
  }

  if (quoted || source.slice(start).trim()) {
    throw new Error("Export contains an incomplete SQL statement");
  }
  return statements;
}

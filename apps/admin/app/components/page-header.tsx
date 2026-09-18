import type React from "react";
import { CardDescription, CardHeader, CardTitle, HStack } from "~/components/ui";

/**
 * 管理画面のページ見出し（タイトル＋説明＋右端アクションの定型）
 */
export const PageHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) => {
  return (
    <CardHeader>
      <HStack className="items-start">
        <div className="flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action}
      </HStack>
    </CardHeader>
  );
};

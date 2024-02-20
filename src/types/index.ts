export type TSecret = {
  app: string;
  name: string;
  color: string;
  starred: boolean;
  description: string;
  group: string;
  fields: { name: string; type: React.HTMLInputTypeAttribute; value: string }[];
};

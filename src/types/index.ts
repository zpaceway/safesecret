export type TSecret = {
  id: string;
  app: string;
  name: string;
  color: string;
  starred: boolean;
  description: string;
  group: string;
  fields: {
    id: string;
    name: string;
    type: React.HTMLInputTypeAttribute;
    value: string;
  }[];
};

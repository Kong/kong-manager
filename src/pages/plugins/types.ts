export interface Ordering {
  before?: {
    access: string[];
  };
  after?: {
    access: string[];
  };
}

export type PluginSchema = Record<string, unknown> & {
  id: string,
  tags?: string[],
  consumer?: { id: string },
  route?: { id: string },
  service?: { id: string },
  ordering: Ordering,
  instance_name?: string,
}

type StorageSchema = {
  enabled: boolean;
  lastCity: string;
};

const defaults: StorageSchema = {
  enabled: true,
  lastCity: "San Francisco",
};

async function get<K extends keyof StorageSchema>(
  key: K,
): Promise<StorageSchema[K]> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as StorageSchema[K]) ?? defaults[key];
}

async function set<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K],
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

async function getAll(): Promise<StorageSchema> {
  const result = await chrome.storage.local.get(Object.keys(defaults));
  return { ...defaults, ...result } as StorageSchema;
}

const storage = { get, set, getAll };

export { storage };
export type { StorageSchema };

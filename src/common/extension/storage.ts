const createStorage = <S extends Record<string, unknown>>(defaults: S) => {
  const get = async <K extends keyof S>(key: K): Promise<S[K]> => {
    const result = await chrome.storage.local.get(key);
    return (result[key] as S[K]) ?? defaults[key];
  };

  const set = async <K extends keyof S>(key: K, value: S[K]): Promise<void> => {
    await chrome.storage.local.set({ [key]: value });
  };

  const getAll = async (): Promise<S> => {
    const result = await chrome.storage.local.get(Object.keys(defaults));
    return { ...defaults, ...result } as S;
  };

  return { get, set, getAll };
};

export { createStorage };

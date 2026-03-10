type WeatherData = {
  city: string;
  temp: number;
  condition: string;
};

type MessageResponse<T> = { ok: true; data: T } | { ok: false; error: string };

type BackgroundMessages = {
  "get-weather": {
    request: { city: string };
    response: MessageResponse<WeatherData>;
  };
  "get-status": {
    request: undefined;
    response: MessageResponse<{ enabled: boolean }>;
  };
};

type ContentMessages = {
  "toggle-ui": {
    request: { visible: boolean };
    response: undefined;
  };
};

export type {
  WeatherData,
  MessageResponse,
  BackgroundMessages,
  ContentMessages,
};

import type { BackgroundMessages, ContentMessages } from "../../types/messages";

function sendMessage<K extends keyof BackgroundMessages>(
  type: K,
  payload: BackgroundMessages[K]["request"],
): Promise<BackgroundMessages[K]["response"]> {
  return chrome.runtime.sendMessage({ type, payload });
}

function onBackgroundMessage<K extends keyof BackgroundMessages>(
  type: K,
  handler: (
    payload: BackgroundMessages[K]["request"],
    sender: chrome.runtime.MessageSender,
  ) =>
    | Promise<BackgroundMessages[K]["response"]>
    | BackgroundMessages[K]["response"],
): () => void {
  const listener = (
    message: { type: string; payload: unknown },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    if (message.type !== type) return false;
    const result = handler(
      message.payload as BackgroundMessages[K]["request"],
      sender,
    );
    if (result instanceof Promise) {
      result.then(sendResponse);
      return true;
    }
    sendResponse(result);
    return false;
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}

function sendToTab<K extends keyof ContentMessages>(
  tabId: number,
  type: K,
  payload: ContentMessages[K]["request"],
): Promise<ContentMessages[K]["response"]> {
  return chrome.tabs.sendMessage(tabId, { type, payload });
}

export { sendMessage, onBackgroundMessage, sendToTab };

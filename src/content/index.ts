import { h } from "preact";
import { WeatherOverlay } from "./floating/components/WeatherOverlay";
import { mountFloating } from "./floating/mount";
import { WeatherButton } from "./inline/components/WeatherButton";
import { mountInline } from "./inline/mount";
import { observeAndInject } from "./inline/observe-and-inject";
import { sendMessage } from "./messaging";

let floatingDispose: (() => void) | null = null;

const toggleOverlay = () => {
  if (floatingDispose) {
    floatingDispose();
    floatingDispose = null;
    return;
  }

  sendMessage("get-weather", { city: "San Francisco" }).then((res) => {
    if (!res.ok) return;
    const close = () => {
      floatingDispose?.();
      floatingDispose = null;
    };
    const { dispose } = mountFloating(
      h(WeatherOverlay, { data: res.data, onClose: close }),
      { position: "top-right", draggable: true },
    );
    floatingDispose = dispose;
  });
};

observeAndInject({
  selector: 'form[role="search"]',
  mount: (form) => {
    const container = document.createElement("div");
    container.style.cssText =
      "display:flex;justify-content:center;padding:8px 0;";
    form.parentElement?.insertBefore(container, form.nextSibling);
    const { dispose } = mountInline(
      container,
      h(WeatherButton, { onClick: toggleOverlay }),
    );
    return () => {
      dispose();
      container.remove();
    };
  },
  markerAttr: "data-ext-weather",
});

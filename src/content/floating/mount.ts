import { render, type VNode } from "preact";
import floatingStyles from "./floating.css?inline";
import { setupDrag } from "./setup-drag";

type FloatingOptions = {
  position:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "center";
  draggable: boolean;
};

const POSITION_STYLES: Record<FloatingOptions["position"], string> = {
  "top-right": "top:16px;right:16px;",
  "top-left": "top:16px;left:16px;",
  "bottom-right": "bottom:16px;right:16px;",
  "bottom-left": "bottom:16px;left:16px;",
  center: "top:50%;left:50%;transform:translate(-50%,-50%);",
};

function mountFloating(
  // biome-ignore lint/suspicious/noExplicitAny: VNode type parameter is contravariant
  vnode: VNode<any>,
  options: FloatingOptions,
): { dispose: () => void } {
  const host = document.createElement("div");
  host.setAttribute("data-ext-floating", "1");
  host.style.cssText = `position:fixed;z-index:2147483647;${POSITION_STYLES[options.position]}`;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = floatingStyles;
  shadow.appendChild(style);

  const root = document.createElement("div");
  shadow.appendChild(root);
  render(vnode, root);

  if (options.draggable) {
    queueMicrotask(() => setupDrag(host, shadow));
  }

  return {
    dispose: () => {
      render(null, root);
      host.remove();
    },
  };
}

export { mountFloating };
export type { FloatingOptions };

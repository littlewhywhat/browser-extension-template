function setupDrag(host: HTMLElement, shadow: ShadowRoot) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const handle = shadow.querySelector("[data-drag-handle]");
  if (!handle) return;

  handle.addEventListener("mousedown", ((e: MouseEvent) => {
    isDragging = true;
    const rect = host.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    host.style.transition = "none";
  }) as EventListener);

  document.addEventListener("mousemove", (e: MouseEvent) => {
    if (!isDragging) return;
    host.style.left = `${e.clientX - offsetX}px`;
    host.style.top = `${e.clientY - offsetY}px`;
    host.style.right = "auto";
    host.style.bottom = "auto";
    host.style.transform = "none";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

export { setupDrag };

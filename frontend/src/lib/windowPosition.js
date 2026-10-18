export function clampPosition(position, viewport, dimensions) {
  return {
    x: Math.max(0, Math.min(position.x, viewport.width - dimensions.width)),
    y: Math.max(0, Math.min(position.y, viewport.height - dimensions.height)),
  };
}

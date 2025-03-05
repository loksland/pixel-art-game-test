import { ContainerChild, Point } from 'pixi.js';

export function distance(ptA: Point, ptB: Point): number {
  const dx = ptA.x - ptB.x;
  const dy = ptA.y - ptB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function bringToFront(displayObject: ContainerChild) {
  displayObject.parent.setChildIndex(
    displayObject,
    displayObject.parent.children.length - 1,
  );
}

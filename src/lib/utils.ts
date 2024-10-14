import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const boundingBox = (coords: number[][]) => {
  const minX = Math.min(...coords.map((c) => c[0])),
    maxX = Math.max(...coords.map((c) => c[0]));
  const minY = Math.min(...coords.map((c) => c[1])),
    maxY = Math.max(...coords.map((c) => c[1]));
  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  };
};

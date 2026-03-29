"use client";

import type { PropsWithChildren } from "react";

import { createContext, use, useEffect, useState } from "react";

const TouchContext = createContext<boolean | undefined>(undefined);

export const useTouch = () => use(TouchContext);

export function TouchProvider(props: PropsWithChildren) {
  const [isTouch, setTouch] = useState<boolean>();

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return <TouchContext value={isTouch} {...props} />;
}

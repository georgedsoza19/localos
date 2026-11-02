"use client";

import { useEffect, useState } from "react";
import { getVisitorId } from "./tracker";

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState("");
  useEffect(() => {
    setVisitorId(getVisitorId());
  }, []);
  return visitorId;
}

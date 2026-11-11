"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChatBot = dynamic(() => import("./ChatBot"), { ssr: false });

// Mounted shortly after load (or on the first interaction), so the assistant
// never competes with the page's first paint or its main-thread work.
export default function ChatBotLoader() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => setReady(true);
    const id = window.setTimeout(go, 1800);
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      clearTimeout(id);
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, []);
  return ready ? <ChatBot /> : null;
}

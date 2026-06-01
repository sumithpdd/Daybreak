"use client";

import { useEffect, useState } from "react";
import DateHeader from "./DateHeader";
import Quote from "./Quote";
import Priorities from "./Priorities";
import LaunchButtons from "./LaunchButtons";
import AuthBar from "./AuthBar";
import Logo from "./Logo";

export default function Dashboard() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo />
          <DateHeader />
        </div>
        <AuthBar online={online} />
      </header>

      <Quote text="Vision without execution is hallucination" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Priorities />
        </div>
        <div className="lg:col-span-2">
          <LaunchButtons />
        </div>
      </div>

    </div>
  );
}

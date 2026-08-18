"use client";

import { useEffect, useRef } from "react";

export function NoteTracker({ noteId }: { noteId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch(`/api/writers-hub/notes/${noteId}/view`, {
      method: "POST",
    }).catch(console.error);
  }, [noteId]);

  return null;
}

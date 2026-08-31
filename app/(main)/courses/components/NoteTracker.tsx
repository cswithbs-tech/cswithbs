"use client";

import { useEffect, useRef } from "react";

export function NoteTracker({ noteId, isRestricted = false }: { noteId: string, isRestricted?: boolean }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || isRestricted) return;
    tracked.current = true;

    fetch(`/api/writers-hub/notes/${noteId}/view`, {
      method: "POST",
    }).catch(console.error);
  }, [noteId, isRestricted]);

  return null;
}

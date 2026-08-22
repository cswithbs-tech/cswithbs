"use client";

import { useState } from "react";

interface UserAvatarModalProps {
  imageSrc: string;
  name: string;
}

export function UserAvatarModal({ imageSrc, name }: UserAvatarModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/5 shadow-sm cursor-pointer hover:ring-accent transition-all"
        onClick={() => setIsOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-2xl max-h-[80vh] w-full rounded-2xl overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={name}
              className="object-contain max-h-[80vh] w-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

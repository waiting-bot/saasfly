"use client";

import { TextGenerateEffect } from "@saasfly/ui";

export function TypewriterEffectSmooths() {
  const words = [
    {
      text: "Build",
    },
    {
      text: "awesome",
    },
    {
      text: "apps",
    },
    {
      text: "and",
    },
    {
      text: "ship",
    },
    {
      text: "fast",
    },
    {
      text: "with",
    },
    {
      text: "Saasfly.",
      className: "text-blue-500",
    },
  ];
  const wordsString = words.map(word => word.text).join(" ");
  return (
    <div className="max-w-[42rem] leading-normal text-neutral-500 dark:text-neutral-400 sm:text-lg sm:leading-8">
      <TextGenerateEffect words={wordsString} />
    </div>
  );
}

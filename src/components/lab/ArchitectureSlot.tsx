"use client";

import type { DragEvent, KeyboardEvent } from "react";
import { LabIcon } from "@/components/lab/LabIcon";
import { canPlace } from "@/lib/lab/engine";
import { AREA_LABELS } from "@/lib/lab/copy";
import type {
  ArchitectureComponent,
  ArchitectureNodeId,
  ArchitectureSlot as SlotDefinition,
  LabDifficulty,
  StageOutcomeKind,
} from "@/lib/lab/types";

export function ArchitectureSlotCard({
  slot,
  placed,
  difficulty,
  selectedComponentId,
  draggingId,
  locked,
  highlighted,
  outcome,
  purpose,
  onPlace,
  onInspect,
}: {
  slot: SlotDefinition;
  placed: ArchitectureComponent | undefined;
  difficulty: LabDifficulty;
  selectedComponentId: string | null;
  draggingId: string | null;
  locked: boolean;
  highlighted: boolean;
  outcome: StageOutcomeKind | null;
  purpose: string;
  onPlace: (componentId: string) => void;
  onInspect: (id: ArchitectureNodeId) => void;
}) {
  const candidate = draggingId ?? selectedComponentId;
  const compatible = Boolean(candidate && canPlace(candidate, slot.id, difficulty) && !locked);

  const tryPlace = (componentId: string) => {
    if (locked) {
      onInspect(slot.id);
      return;
    }
    if (canPlace(componentId, slot.id, difficulty)) {
      onPlace(componentId);
    }
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const componentId = event.dataTransfer.getData("text/plain") || draggingId;
    if (componentId) {
      tryPlace(componentId);
    }
  };

  const onDragOver = (event: DragEvent<HTMLButtonElement>) => {
    if (!candidate || !canPlace(candidate, slot.id, difficulty) || locked) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (selectedComponentId) {
        tryPlace(selectedComponentId);
      } else {
        onInspect(slot.id);
      }
    }
  };

  const className = [
    "lab-node",
    "lab-slot",
    placed ? "is-filled" : "is-empty",
    compatible ? "is-compatible" : "",
    highlighted ? "is-highlighted" : "",
    outcome ? `is-${outcome}` : "",
    locked ? "is-locked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      data-node={slot.id}
      data-slot={slot.id}
      aria-label={placed ? `${slot.name}: ${placed.name}` : `${slot.name}, empty`}
      onClick={() => {
        if (selectedComponentId && !locked) {
          tryPlace(selectedComponentId);
          return;
        }
        onInspect(slot.id);
      }}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <span className="lab-node__kicker">{slot.name}</span>
      {placed ? (
        <>
          <span className="lab-node__icon">
            <LabIcon name={placed.icon} />
          </span>
          <strong>{placed.name}</strong>
          <span className="lab-node__meta">{AREA_LABELS[placed.area]}</span>
        </>
      ) : (
        <>
          <strong>Empty slot</strong>
          {difficulty === "guided" ? <span className="lab-node__meta">{purpose}</span> : <span className="lab-node__meta">Drop or tap a matching component</span>}
        </>
      )}
    </button>
  );
}

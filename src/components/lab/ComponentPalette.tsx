"use client";

import { LabIcon } from "@/components/lab/LabIcon";
import { componentsFor, slotById } from "@/lib/lab/catalog";
import { AREA_LABELS } from "@/lib/lab/copy";
import { slotPurpose } from "@/lib/lab/engine";
import type { ArchitectureComponent, LabDifficulty, SlotId } from "@/lib/lab/types";
import { SLOT_IDS } from "@/lib/lab/types";

export function ComponentPalette({
  difficulty,
  selectedId,
  locked,
  onSelect,
  onDragStart,
  onDragEnd,
}: {
  difficulty: LabDifficulty;
  selectedId: string | null;
  locked: boolean;
  onSelect: (component: ArchitectureComponent) => void;
  onDragStart: (componentId: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <aside className="lab-palette" aria-label="Available architecture components">
      <div className="lab-palette__head">
        <h2>Available components</h2>
        <p>
          {locked
            ? "The architecture is locked while the attack runs."
            : "Select a component, then tap a highlighted slot. On a pointer device you can also drag it."}
        </p>
      </div>
      <div className="lab-palette__list">
        {SLOT_IDS.map((slotId) => (
          <PaletteGroup
            key={slotId}
            slotId={slotId}
            difficulty={difficulty}
            selectedId={selectedId}
            locked={locked}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </aside>
  );
}

function PaletteGroup({
  slotId,
  difficulty,
  selectedId,
  locked,
  onSelect,
  onDragStart,
  onDragEnd,
}: {
  slotId: SlotId;
  difficulty: LabDifficulty;
  selectedId: string | null;
  locked: boolean;
  onSelect: (component: ArchitectureComponent) => void;
  onDragStart: (componentId: string) => void;
  onDragEnd: () => void;
}) {
  const slot = slotById(slotId);
  const items = componentsFor(difficulty, slotId);
  return (
    <section className="lab-palette-group" aria-labelledby={`palette-${slotId}`}>
      <h3 id={`palette-${slotId}`}>{slot.name}</h3>
      {difficulty === "guided" ? <p className="lab-palette-group__purpose">{slotPurpose(slotId, difficulty)}</p> : null}
      <ul>
        {items.map((component) => {
          const selected = selectedId === component.id;
          const description = difficulty === "architect" ? component.architectDescription : component.description;
          const tradeOff = difficulty === "architect" ? component.architectTradeOff : component.tradeOff;
          return (
            <li key={component.id}>
              <button
                type="button"
                className={selected ? "lab-component-card is-selected" : "lab-component-card"}
                draggable={!locked}
                disabled={locked}
                data-component={component.id}
                aria-pressed={selected}
                onClick={() => onSelect(component)}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", component.id);
                  event.dataTransfer.effectAllowed = "copy";
                  onDragStart(component.id);
                }}
                onDragEnd={onDragEnd}
              >
                <span className="lab-component-card__icon">
                  <LabIcon name={component.icon} />
                </span>
                <span className="lab-component-card__body">
                  <strong>{component.name}</strong>
                  <span className="lab-component-card__desc">{description}</span>
                  <span className="lab-component-card__meta">
                    Affects {AREA_LABELS[component.area]} · Fits {slot.name}
                  </span>
                  {difficulty === "guided" && component.recommended ? (
                    <span className="lab-chip">Recommended</span>
                  ) : null}
                  <span className="lab-component-card__trade">{tradeOff}</span>
                  {difficulty === "guided" ? <span className="lab-component-card__hint">{component.hint}</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

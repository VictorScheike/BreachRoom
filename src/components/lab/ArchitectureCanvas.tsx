"use client";

import { ArchitectureSlotCard } from "@/components/lab/ArchitectureSlot";
import { LabIcon } from "@/components/lab/LabIcon";
import { LAB_MISSION, componentById } from "@/lib/lab/catalog";
import { AREA_LABELS, ZONE_LABELS } from "@/lib/lab/copy";
import { DATAFLOWS, NODE_LAYOUT, ZONE_NODES } from "@/lib/lab/flows";
import { slotPurpose } from "@/lib/lab/engine";
import type {
  ArchitectureNodeId,
  LabDifficulty,
  LabPlacements,
  ResolvedStage,
  StageOutcomeKind,
  TrustZoneId,
} from "@/lib/lab/types";
import { TRUST_ZONES } from "@/lib/lab/types";

const FIXED_ICONS: Record<string, string> = {
  "claims-handler": "person",
  "claims-portal": "portal",
  "uploaded-document": "file",
  "ai-application": "cpu",
  "claims-database": "database",
  "external-network": "globe",
};

export function ArchitectureCanvas({
  placements,
  difficulty,
  selectedComponentId,
  draggingId,
  locked,
  highlighted,
  activeStage,
  inspectId,
  onPlace,
  onInspect,
}: {
  placements: LabPlacements;
  difficulty: LabDifficulty;
  selectedComponentId: string | null;
  draggingId: string | null;
  locked: boolean;
  highlighted: readonly ArchitectureNodeId[];
  activeStage: ResolvedStage | null;
  inspectId: ArchitectureNodeId | null;
  onPlace: (componentId: string, slotId: ArchitectureNodeId) => void;
  onInspect: (id: ArchitectureNodeId) => void;
}) {
  const inspectLabel = inspectCopy(inspectId, placements);
  return (
    <section className="lab-canvas" aria-label="Architecture workspace">
      <svg className="lab-flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {DATAFLOWS.map((edge) => {
          const from = NODE_LAYOUT[edge.from];
          const to = NODE_LAYOUT[edge.to];
          const active =
            Boolean(activeStage) &&
            highlighted.includes(edge.from) &&
            highlighted.includes(edge.to);
          const midX = from.x + (to.x - from.x) * 0.5;
          const d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
          return (
            <path
              key={`${edge.from}-${edge.to}`}
              d={d}
              className={active ? "lab-flow-path is-active" : "lab-flow-path"}
            />
          );
        })}
      </svg>
      <div className="lab-zones">
        {TRUST_ZONES.map((zone) => (
          <ZoneColumn
            key={zone}
            zone={zone}
            placements={placements}
            difficulty={difficulty}
            selectedComponentId={selectedComponentId}
            draggingId={draggingId}
            locked={locked}
            highlighted={highlighted}
            activeStage={activeStage}
            inspectId={inspectId}
            onPlace={onPlace}
            onInspect={onInspect}
          />
        ))}
      </div>
      {inspectLabel ? (
        <div className="lab-inspect" role="status">
          <p>
            <strong>{inspectLabel.title}</strong>
            <span>{inspectLabel.body}</span>
          </p>
          {inspectLabel.links.length > 0 ? (
            <p className="lab-inspect__links">Connections: {inspectLabel.links.join(" · ")}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ZoneColumn({
  zone,
  placements,
  difficulty,
  selectedComponentId,
  draggingId,
  locked,
  highlighted,
  activeStage,
  inspectId,
  onPlace,
  onInspect,
}: {
  zone: TrustZoneId;
  placements: LabPlacements;
  difficulty: LabDifficulty;
  selectedComponentId: string | null;
  draggingId: string | null;
  locked: boolean;
  highlighted: readonly ArchitectureNodeId[];
  activeStage: ResolvedStage | null;
  inspectId: ArchitectureNodeId | null;
  onPlace: (componentId: string, slotId: ArchitectureNodeId) => void;
  onInspect: (id: ArchitectureNodeId) => void;
}) {
  return (
    <div className="lab-zone" data-zone={zone}>
      <h3>{ZONE_LABELS[zone]}</h3>
      <div className="lab-zone__nodes">
        {ZONE_NODES[zone].map((nodeId) => {
          const slot = LAB_MISSION.slots.find((item) => item.id === nodeId);
          const fixed = LAB_MISSION.fixedNodes.find((item) => item.id === nodeId);
          const outcome = nodeOutcome(nodeId, activeStage);
          if (slot) {
            const placed = placements[slot.id] ? componentById(placements[slot.id] ?? "") : undefined;
            return (
              <ArchitectureSlotCard
                key={slot.id}
                slot={slot}
                placed={placed}
                difficulty={difficulty}
                selectedComponentId={selectedComponentId}
                draggingId={draggingId}
                locked={locked}
                highlighted={highlighted.includes(slot.id) || inspectId === slot.id}
                outcome={outcome}
                purpose={slotPurpose(slot.id, difficulty)}
                onPlace={(componentId) => onPlace(componentId, slot.id)}
                onInspect={onInspect}
              />
            );
          }
          if (!fixed) {
            return null;
          }
          const className = [
            "lab-node",
            "lab-fixed",
            highlighted.includes(fixed.id) || inspectId === fixed.id ? "is-highlighted" : "",
            outcome ? `is-${outcome}` : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={fixed.id}
              type="button"
              className={className}
              data-node={fixed.id}
              onClick={() => onInspect(fixed.id)}
            >
              <span className="lab-node__kicker">Always present</span>
              <span className="lab-node__icon">
                <LabIcon name={FIXED_ICONS[fixed.id] ?? "building"} />
              </span>
              <strong>{fixed.name}</strong>
              <span className="lab-node__meta">{fixed.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function nodeOutcome(nodeId: ArchitectureNodeId, stage: ResolvedStage | null): StageOutcomeKind | null {
  if (!stage || !stage.highlight.includes(nodeId)) {
    return null;
  }
  return stage.outcome;
}

function inspectCopy(
  inspectId: ArchitectureNodeId | null,
  placements: LabPlacements,
): { title: string; body: string; links: string[] } | null {
  if (!inspectId) {
    return null;
  }
  const slot = LAB_MISSION.slots.find((item) => item.id === inspectId);
  const fixed = LAB_MISSION.fixedNodes.find((item) => item.id === inspectId);
  const links = DATAFLOWS.filter((edge) => edge.from === inspectId || edge.to === inspectId).map((edge) => {
    const other = edge.from === inspectId ? edge.to : edge.from;
    const otherSlot = LAB_MISSION.slots.find((item) => item.id === other);
    const otherFixed = LAB_MISSION.fixedNodes.find((item) => item.id === other);
    const otherName = otherSlot?.name ?? otherFixed?.name ?? other;
    return `${edge.label} → ${otherName}`;
  });
  if (slot) {
    const placed = placements[slot.id] ? componentById(placements[slot.id] ?? "") : undefined;
    return {
      title: placed ? `${placed.name} in ${slot.name}` : `${slot.name} is empty`,
      body: placed
        ? `${placed.description} Affects ${AREA_LABELS[placed.area]}.`
        : slot.purpose,
      links,
    };
  }
  if (fixed) {
    return { title: fixed.name, body: fixed.description, links };
  }
  return null;
}

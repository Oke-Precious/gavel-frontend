import React from 'react';
import { Check } from 'lucide-react';
import './Timeline.css';

/**
 * Timeline — 4-stage GAVEL lifecycle stepper.
 *
 * Horizontal on desktop, vertical on mobile.
 *
 * @param {number} currentStageIndex — 0-based index of the active stage
 * @param {Array<{ label, date?, stallReason? }>} stages — override default stage labels/dates
 * @param {boolean} compact — smaller rendering for card contexts
 */

const DEFAULT_STAGES = [
  { label: 'Arrest' },
  { label: 'Charge & Remand' },
  { label: 'DPP Advice / Adjournment' },
  { label: 'Trial or Discharge' },
];

export default function Timeline({
  currentStageIndex = 0,
  stages = DEFAULT_STAGES,
  compact = false,
}) {
  return (
    <div
      className={`timeline${compact ? ' timeline--compact' : ''}`}
      role="list"
      aria-label="Case lifecycle"
    >
      {stages.map((stage, i) => {
        const isCompleted = i < currentStageIndex;
        const isActive    = i === currentStageIndex;
        const isPending   = i > currentStageIndex;

        let stateClass = 'timeline__step--pending';
        if (isCompleted) stateClass = 'timeline__step--completed';
        if (isActive)    stateClass = 'timeline__step--active';

        return (
          <div
            key={i}
            className={`timeline__step ${stateClass}`}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
          >
            {/* Connector line (not for last item) */}
            {i < stages.length - 1 && (
              <div
                className={`timeline__connector${isCompleted ? ' timeline__connector--completed' : ''}`}
                aria-hidden="true"
              />
            )}

            {/* Node */}
            <div className="timeline__node" aria-hidden="true">
              {isCompleted ? (
                <Check size={compact ? 10 : 12} strokeWidth={3} />
              ) : (
                <span className="timeline__node-inner" />
              )}
            </div>

            {/* Labels */}
            <div className="timeline__label-group">
              <span className="timeline__label">{stage.label}</span>
              {stage.date && (
                <span className="timeline__date">{stage.date}</span>
              )}
              {isActive && stage.stallReason && (
                <span className="timeline__stall-reason">
                  {stage.stallReason}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

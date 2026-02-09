/**
 * A Lovelace view strategy that filters entities based on the
 * current user's access roles.
 *
 * If the user has no roles assigned, it falls back to showing everything
 * (identical to the original-states strategy).
 */

import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators";
import type { LovelaceViewConfig } from "../../../../data/lovelace/config/view";
import type { LovelaceCardConfig } from "../../../../data/lovelace/config/card";
import type { HomeAssistant } from "../../../../types";
import { resolveVisibleForCurrentUser } from "../../../../data/access_role";
import { generateDefaultViewConfig } from "../../../common/generate-lovelace-config";
import { computeDomain } from "../../../../common/entity/compute_domain";

export interface RoleFilteredViewStrategyConfig {
  type: "role-filtered";
}

@customElement("role-filtered-view-strategy")
export class RoleFilteredViewStrategy extends ReactiveElement {
  static async generate(
    _config: RoleFilteredViewStrategyConfig,
    hass: HomeAssistant
  ): Promise<LovelaceViewConfig> {
    const visibility = await resolveVisibleForCurrentUser(hass);

    if (visibility.entity_ids === null) {
      const [localize] = await Promise.all([
        hass.loadBackendTranslation("title"),
      ]);
      return generateDefaultViewConfig(hass, localize);
    }

    const allowedEntityIds = new Set(visibility.entity_ids);
    const allowedAreaIds = visibility.area_ids
      ? new Set(visibility.area_ids)
      : null;

    const filteredStates: Record<string, (typeof hass.states)[string]> = {};
    for (const entityId of Object.keys(hass.states)) {
      if (allowedEntityIds.has(entityId)) {
        filteredStates[entityId] = hass.states[entityId];
      }
    }

    const areaCards: LovelaceCardConfig[] = [];

    if (allowedAreaIds) {
      const areasWithEntities: Record<string, string[]> = {};

      for (const entityId of Object.keys(filteredStates)) {
        const entityEntry = hass.entities[entityId];
        if (!entityEntry) {
          continue;
        }

        const areaId =
          entityEntry.area_id ||
          (entityEntry.device_id &&
            hass.devices[entityEntry.device_id]?.area_id);

        if (areaId && allowedAreaIds.has(areaId)) {
          if (!areasWithEntities[areaId]) {
            areasWithEntities[areaId] = [];
          }
          areasWithEntities[areaId].push(entityId);
        }
      }

      for (const [areaId, entityIds] of Object.entries(areasWithEntities)) {
        const area = hass.areas[areaId];
        if (!area) {
          continue;
        }

        areaCards.push({
          type: "grid",
          square: false,
          columns: 1,
          cards: [
            {
              type: "entities",
              title: area.name,
              entities: entityIds.map((eid) => ({
                entity: eid,
              })),
            },
          ],
        });
      }
    }

    const areaEntityIds = new Set(
      areaCards.flatMap((card: any) =>
        card.cards?.[0]?.entities?.map((e: any) => e.entity) || []
      )
    );

    const remainingEntities = Object.keys(filteredStates).filter(
      (eid) => !areaEntityIds.has(eid)
    );

    const otherCards: LovelaceCardConfig[] = [];
    if (remainingEntities.length > 0) {
      const byDomain: Record<string, string[]> = {};
      for (const entityId of remainingEntities) {
        const domain = computeDomain(entityId);
        if (!byDomain[domain]) {
          byDomain[domain] = [];
        }
        byDomain[domain].push(entityId);
      }

      for (const [domain, entityIds] of Object.entries(byDomain)) {
        otherCards.push({
          type: "entities",
          title: domain.charAt(0).toUpperCase() + domain.slice(1),
          entities: entityIds,
        });
      }
    }

    const cards = [...areaCards, ...otherCards];

    if (cards.length === 0) {
      return {
        cards: [
          {
            type: "markdown",
            content:
              "No entities are assigned to your access roles. Please contact your administrator.",
          },
        ],
      };
    }

    return {
      title: "My Home",
      path: "role-filtered",
      cards,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "role-filtered-view-strategy": RoleFilteredViewStrategy;
  }
}
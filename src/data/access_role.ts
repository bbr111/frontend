/**
 * Access role data types and WebSocket API functions.
 */

import type { HomeAssistant } from "../types";

export interface AccessRole {
  access_role_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  entity_ids: string[];
  device_ids: string[];
  area_ids: string[];
  label_ids: string[];
  user_ids: string[];
  created_at: string;
  modified_at: string;
}

export interface AccessRoleVisibility {
  entity_ids: string[] | null; // null = show everything
  area_ids: string[] | null;
  device_ids: string[] | null;
}

export const fetchAccessRoles = (
  hass: HomeAssistant
): Promise<AccessRole[]> =>
  hass.callWS({ type: "config/access_role/list" });

export const createAccessRole = (
  hass: HomeAssistant,
  values: Partial<AccessRole> & { name: string }
): Promise<AccessRole> =>
  hass.callWS({
    type: "config/access_role/create",
    ...values,
  });

export const updateAccessRole = (
  hass: HomeAssistant,
  accessRoleId: string,
  updates: Partial<Omit<AccessRole, "access_role_id">>
): Promise<AccessRole> =>
  hass.callWS({
    type: "config/access_role/update",
    access_role_id: accessRoleId,
    ...updates,
  });

export const deleteAccessRole = (
  hass: HomeAssistant,
  accessRoleId: string
): Promise<void> =>
  hass.callWS({
    type: "config/access_role/delete",
    access_role_id: accessRoleId,
  });

export const fetchAccessRolesForCurrentUser = (
  hass: HomeAssistant
): Promise<AccessRole[]> =>
  hass.callWS({ type: "config/access_role/list_for_current_user" });

export const resolveVisibleForCurrentUser = (
  hass: HomeAssistant
): Promise<AccessRoleVisibility> =>
  hass.callWS({ type: "access_role/resolve_visible" });
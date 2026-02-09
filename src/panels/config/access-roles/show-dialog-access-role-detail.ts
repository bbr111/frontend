/**
 * Helper to show the access role detail dialog.
 */

import { fireEvent } from "../../../common/dom/fire_event";
import type { AccessRole } from "../../../data/access_role";

export interface AccessRoleDetailDialogParams {
  entry?: AccessRole;
  createEntry?: (values: AccessRole) => Promise<unknown>;
  updateEntry?: (updates: Partial<AccessRole>) => Promise<unknown>;
}

export const loadAccessRoleDetailDialog = () =>
  import("./dialog-access-role-detail");

export const showAccessRoleDetailDialog = (
  element: HTMLElement,
  params: AccessRoleDetailDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-access-role-detail",
    dialogImport: loadAccessRoleDetailDialog,
    dialogParams: params,
  });
};
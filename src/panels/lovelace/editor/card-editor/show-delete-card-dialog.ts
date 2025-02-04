import { fireEvent } from "../../../../common/dom/fire_event";
import type { LovelaceCardConfig } from "../../../../data/lovelace/config/card";

export interface DeleteCardDialogParams {
  deleteCard: () => void;
  cardConfig?: LovelaceCardConfig;
}

export const importDeleteCardDialog = () => import("./hui-dialog-delete-card");

export const showDeleteCardDialog = (
  element: HTMLElement,
  deleteCardDialogParams: DeleteCardDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "hui-dialog-delete-card",
    dialogImport: importDeleteCardDialog,
    dialogParams: deleteCardDialogParams,
  });
};

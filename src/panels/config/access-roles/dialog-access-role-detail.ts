import { mdiClose } from "@mdi/js";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { fireEvent } from "../../../common/dom/fire_event";
import "../../../components/ha-dialog";
import "../../../components/ha-dialog-header";
import "../../../components/ha-textfield";
import "../../../components/ha-icon-picker";
import "../../../components/entity/ha-entities-picker";
import "../../../components/device/ha-devices-picker";
import "../../../components/ha-areas-picker";
import "../../../components/ha-labels-picker";
import type { HomeAssistant } from "../../../types";
import type { AccessRole } from "../../../data/access_role";
import {
  createAccessRole,
  updateAccessRole,
} from "../../../data/access_role";
import { haStyleDialog } from "../../../resources/styles";
import type { AccessRoleDetailDialogParams } from "./show-dialog-access-role-detail";

@customElement("dialog-access-role-detail")
export class DialogAccessRoleDetail extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @state() private _params?: AccessRoleDetailDialogParams;

  @state() private _name = "";

  @state() private _description = "";

  @state() private _icon: string | null = null;

  @state() private _color: string | null = null;

  @state() private _entityIds: string[] = [];

  @state() private _deviceIds: string[] = [];

  @state() private _areaIds: string[] = [];

  @state() private _labelIds: string[] = [];

  @state() private _userIds: string[] = [];

  @state() private _submitting = false;

  public showDialog(params: AccessRoleDetailDialogParams): void {
    this._params = params;
    const entry = params.entry;
    if (entry) {
      this._name = entry.name;
      this._description = entry.description || "";
      this._icon = entry.icon;
      this._color = entry.color;
      this._entityIds = [...entry.entity_ids];
      this._deviceIds = [...entry.device_ids];
      this._areaIds = [...entry.area_ids];
      this._labelIds = [...entry.label_ids];
      this._userIds = [...entry.user_ids];
    } else {
      this._resetForm();
    }
  }

  public closeDialog(): void {
    this._params = undefined;
    this._resetForm();
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  protected render() {
    if (!this._params) {
      return nothing;
    }

    const isEdit = !!this._params.entry;
    const title = isEdit ? `Edit ${this._name}` : "Create access role";

    return html`
      <ha-dialog open @closed=${this.closeDialog} .heading=${title}>
        <ha-dialog-header slot="heading">
          <ha-icon-button
            slot="navigationIcon"
            dialogAction="cancel"
            .label=${this.hass.localize("ui.common.close")}
            .path=${mdiClose}
          ></ha-icon-button>
          <span slot="title">${title}</span>
        </ha-dialog-header>

        <div class="form">
          <ha-textfield
            .label=${"Name"}
            .value=${this._name}
            required
            @input=${this._nameChanged}
          ></ha-textfield>

          <ha-textfield
            .label=${"Description"}
            .value=${this._description}
            @input=${this._descriptionChanged}
          ></ha-textfield>

          <ha-icon-picker
            .hass=${this.hass}
            .label=${"Icon"}
            .value=${this._icon}
            @value-changed=${this._iconChanged}
          ></ha-icon-picker>

          <h3>Areas</h3>
          <ha-areas-picker
            .hass=${this.hass}
            .value=${this._areaIds}
            @value-changed=${this._areaIdsChanged}
          ></ha-areas-picker>

          <h3>Devices</h3>
          <ha-devices-picker
            .hass=${this.hass}
            .value=${this._deviceIds}
            @value-changed=${this._deviceIdsChanged}
          ></ha-devices-picker>

          <h3>Entities</h3>
          <ha-entities-picker
            .hass=${this.hass}
            .value=${this._entityIds}
            @value-changed=${this._entityIdsChanged}
          ></ha-entities-picker>

          <h3>Labels</h3>
          <ha-labels-picker
            .hass=${this.hass}
            .value=${this._labelIds}
            @value-changed=${this._labelIdsChanged}
          ></ha-labels-picker>

          <h3>Users</h3>
          <p class="description">
            Select users who should see only the elements in this role
            on their auto-generated dashboard.
          </p>
        </div>

        <ha-button
          slot="primaryAction"
          @click=${this._save}
          .disabled=${this._submitting || !this._name}
        >
          ${isEdit ? "Update" : "Create"}
        </ha-button>
        <ha-button slot="secondaryAction" dialogAction="cancel">
          Cancel
        </ha-button>
      </ha-dialog>
    `;
  }

  private _nameChanged(ev: Event): void {
    this._name = (ev.target as HTMLInputElement).value;
  }

  private _descriptionChanged(ev: Event): void {
    this._description = (ev.target as HTMLInputElement).value;
  }

  private _iconChanged(ev: CustomEvent): void {
    this._icon = ev.detail.value;
  }

  private _areaIdsChanged(ev: CustomEvent): void {
    this._areaIds = ev.detail.value;
  }

  private _deviceIdsChanged(ev: CustomEvent): void {
    this._deviceIds = ev.detail.value;
  }

  private _entityIdsChanged(ev: CustomEvent): void {
    this._entityIds = ev.detail.value;
  }

  private _labelIdsChanged(ev: CustomEvent): void {
    this._labelIds = ev.detail.value;
  }

  private async _save(): Promise<void> {
    this._submitting = true;

    try {
      const values = {
        name: this._name,
        description: this._description || null,
        icon: this._icon,
        color: this._color,
        entity_ids: this._entityIds,
        device_ids: this._deviceIds,
        area_ids: this._areaIds,
        label_ids: this._labelIds,
        user_ids: this._userIds,
      };

      if (this._params!.entry) {
        await updateAccessRole(
          this.hass,
          this._params!.entry.access_role_id,
          values
        );
        this._params!.updateEntry?.(values);
      } else {
        const created = await createAccessRole(this.hass, values);
        this._params!.createEntry?.(created);
      }
      this.closeDialog();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      this._submitting = false;
    }
  }

  private _resetForm(): void {
    this._name = "";
    this._description = "";
    this._icon = null;
    this._color = null;
    this._entityIds = [];
    this._deviceIds = [];
    this._areaIds = [];
    this._labelIds = [];
    this._userIds = [];
  }

  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      css`
        .form {
          padding: 16px;
        }
        .form > * {
          display: block;
          margin-bottom: 16px;
        }
        h3 {
          margin-top: 24px;
          margin-bottom: 8px;
          font-size: 1rem;
          font-weight: 500;
        }
        .description {
          color: var(--secondary-text-color);
          font-size: 0.875rem;
          margin-top: 0;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-access-role-detail": DialogAccessRoleDetail;
  }
}
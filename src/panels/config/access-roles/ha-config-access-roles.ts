import { mdiDelete, mdiPencil, mdiPlus, mdiShieldAccount } from "@mdi/js";
import type { CSSResultGroup, PropertyValues } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../components/ha-card";
import "../../../components/ha-fab";
import "../../../components/ha-icon-button";
import "../../../components/ha-svg-icon";
import "../../../components/ha-list";
import "../../../components/ha-list-item";
import { showConfirmationDialog } from "../../../dialogs/generic/show-dialog-box";
import type { HomeAssistant } from "../../../types";
import type { AccessRole } from "../../../data/access_role";
import {
  fetchAccessRoles,
  deleteAccessRole,
} from "../../../data/access_role";
import { showAccessRoleDetailDialog } from "./show-dialog-access-role-detail";

@customElement("ha-config-access-roles")
export class HaConfigAccessRoles extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @property({ type: Boolean })
  public narrow = false;

  @state()
  private _accessRoles: AccessRole[] = [];

  protected firstUpdated(_changedProps: PropertyValues): void {
    super.firstUpdated(_changedProps);
    this._loadAccessRoles();
  }

  protected render() {
    return html`
      <hass-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .header=${"Access roles"}
      >
        <div class="content">
          <ha-card outlined>
            <div class="card-header">
              <ha-svg-icon .path=${mdiShieldAccount}></ha-svg-icon>
              Access roles
            </div>
            <div class="card-content">
              <p>
                Create roles to control which devices, areas, entities, and
                labels each user can see on their auto-generated dashboard.
              </p>
            </div>
            ${this._accessRoles.length
              ? html`
                  <ha-list>
                    ${this._accessRoles.map(
                      (role) => html`
                        <ha-list-item
                          twoline
                          hasMeta
                          @click=${() => this._editRole(role)}
                        >
                          <span>${role.name}</span>
                          <span slot="secondary">
                            ${role.user_ids.length} users ·
                            ${role.entity_ids.length} entities ·
                            ${role.device_ids.length} devices ·
                            ${role.area_ids.length} areas ·
                            ${role.label_ids.length} labels
                          </span>
                          <ha-icon-button
                            slot="meta"
                            .path=${mdiPencil}
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              this._editRole(role);
                            }}
                          ></ha-icon-button>
                          <ha-icon-button
                            slot="meta"
                            .path=${mdiDelete}
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              this._deleteRole(role);
                            }}
                          ></ha-icon-button>
                        </ha-list-item>
                      `
                    )}
                  </ha-list>
                `
              : html`
                  <div class="empty card-content">
                    No access roles configured yet.
                  </div>
                `}
          </ha-card>
        </div>

        <ha-fab
          slot="fab"
          .label=${"Create role"}
          extended
          @click=${this._createRole}
        >
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </hass-subpage>
    `;
  }

  private async _loadAccessRoles(): Promise<void> {
    this._accessRoles = await fetchAccessRoles(this.hass);
  }

  private _createRole(): void {
    showAccessRoleDetailDialog(this, {
      createEntry: async (values) => {
        await this._loadAccessRoles();
        return values;
      },
    });
  }

  private _editRole(role: AccessRole): void {
    showAccessRoleDetailDialog(this, {
      entry: role,
      updateEntry: async (_updates) => {
        await this._loadAccessRoles();
      },
    });
  }

  private async _deleteRole(role: AccessRole): Promise<void> {
    const confirmed = await showConfirmationDialog(this, {
      title: "Delete access role",
      text: `Are you sure you want to delete the role "${role.name}"?`,
      confirmText: "Delete",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    await deleteAccessRole(this.hass, role.access_role_id);
    await this._loadAccessRoles();
  }

  static get styles(): CSSResultGroup {
    return css`
      .content {
        padding: 16px;
        max-width: 800px;
        margin: 0 auto;
      }
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        font-size: 1.25rem;
        font-weight: 500;
      }
      .empty {
        text-align: center;
        color: var(--secondary-text-color);
        padding: 32px 16px;
      }
      ha-fab {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 1;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-access-roles": HaConfigAccessRoles;
  }
}
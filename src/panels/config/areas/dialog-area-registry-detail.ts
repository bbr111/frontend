import "@material/mwc-button";
import "@material/mwc-list/mwc-list";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators";
import { fireEvent } from "../../../common/dom/fire_event";
import "../../../components/ha-alert";
import "../../../components/ha-aliases-editor";
import { createCloseHeading } from "../../../components/ha-dialog";
import "../../../components/ha-picture-upload";
import type { HaPictureUpload } from "../../../components/ha-picture-upload";
import "../../../components/ha-settings-row";
import "../../../components/ha-icon-picker";
import "../../../components/ha-floor-picker";
import "../../../components/ha-textfield";
import "../../../components/ha-labels-picker";
import type { AreaRegistryEntryMutableParams } from "../../../data/area_registry";
import type { CropOptions } from "../../../dialogs/image-cropper-dialog/show-image-cropper-dialog";
import { haStyleDialog } from "../../../resources/styles";
import type { HomeAssistant, ValueChangedEvent } from "../../../types";
import type { AreaRegistryDetailDialogParams } from "./show-dialog-area-registry-detail";

const cropOptions: CropOptions = {
  round: false,
  type: "image/jpeg",
  quality: 0.75,
  aspectRatio: 1.78,
};

class DialogAreaDetail extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _name!: string;

  @state() private _aliases!: string[];

  @state() private _labels!: string[];

  @state() private _picture!: string | null;

  @state() private _icon!: string | null;

  @state() private _floor!: string | null;

  @state() private _error?: string;

  @state() private _params?: AreaRegistryDetailDialogParams;

  @state() private _submitting?: boolean;

  public async showDialog(
    params: AreaRegistryDetailDialogParams
  ): Promise<void> {
    this._params = params;
    this._error = undefined;
    this._name = this._params.entry
      ? this._params.entry.name
      : this._params.suggestedName || "";
    this._aliases = this._params.entry ? this._params.entry.aliases : [];
    this._labels = this._params.entry ? this._params.entry.labels : [];
    this._picture = this._params.entry?.picture || null;
    this._icon = this._params.entry?.icon || null;
    this._floor = this._params.entry?.floor_id || null;
    await this.updateComplete;
  }

  public closeDialog(): void {
    this._error = "";
    this._params = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  protected render() {
    if (!this._params) {
      return nothing;
    }
    const entry = this._params.entry;
    const nameInvalid = !this._isNameValid();
    return html`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        .heading=${createCloseHeading(
          this.hass,
          entry
            ? this.hass.localize("ui.panel.config.areas.editor.update_area")
            : this.hass.localize("ui.panel.config.areas.editor.create_area")
        )}
      >
        <div>
          ${this._error
            ? html`<ha-alert alert-type="error">${this._error}</ha-alert>`
            : ""}
          <div class="form">
            ${entry
              ? html`
                  <ha-settings-row>
                    <span slot="heading">
                      ${this.hass.localize(
                        "ui.panel.config.areas.editor.area_id"
                      )}
                    </span>
                    <span slot="description"> ${entry.area_id} </span>
                  </ha-settings-row>
                `
              : nothing}

            <ha-textfield
              .value=${this._name}
              @input=${this._nameChanged}
              .label=${this.hass.localize("ui.panel.config.areas.editor.name")}
              .validationMessage=${this.hass.localize(
                "ui.panel.config.areas.editor.name_required"
              )}
              required
              dialogInitialFocus
            ></ha-textfield>

            <ha-icon-picker
              .hass=${this.hass}
              .value=${this._icon}
              @value-changed=${this._iconChanged}
              .label=${this.hass.localize("ui.panel.config.areas.editor.icon")}
            ></ha-icon-picker>

            <ha-floor-picker
              .hass=${this.hass}
              .value=${this._floor}
              @value-changed=${this._floorChanged}
              .label=${this.hass.localize("ui.panel.config.areas.editor.floor")}
            ></ha-floor-picker>

            <ha-labels-picker
              .hass=${this.hass}
              .value=${this._labels}
              @value-changed=${this._labelsChanged}
            ></ha-labels-picker>

            <ha-picture-upload
              .hass=${this.hass}
              .value=${this._picture}
              crop
              .cropOptions=${cropOptions}
              @change=${this._pictureChanged}
            ></ha-picture-upload>

            <h3 class="header">
              ${this.hass.localize(
                "ui.panel.config.areas.editor.aliases_section"
              )}
            </h3>

            <p class="description">
              ${this.hass.localize(
                "ui.panel.config.areas.editor.aliases_description"
              )}
            </p>
            <ha-aliases-editor
              .hass=${this.hass}
              .aliases=${this._aliases}
              @value-changed=${this._aliasesChanged}
            ></ha-aliases-editor>
          </div>
        </div>
        <mwc-button slot="secondaryAction" @click=${this.closeDialog}>
          ${this.hass.localize("ui.common.cancel")}
        </mwc-button>
        <mwc-button
          slot="primaryAction"
          @click=${this._updateEntry}
          .disabled=${nameInvalid || this._submitting}
        >
          ${entry
            ? this.hass.localize("ui.common.save")
            : this.hass.localize("ui.common.add")}
        </mwc-button>
      </ha-dialog>
    `;
  }

  private _isNameValid() {
    return this._name.trim() !== "";
  }

  private _nameChanged(ev) {
    this._error = undefined;
    this._name = ev.target.value;
  }

  private _floorChanged(ev) {
    this._error = undefined;
    this._floor = ev.detail.value;
  }

  private _iconChanged(ev) {
    this._error = undefined;
    this._icon = ev.detail.value;
  }

  private _labelsChanged(ev) {
    this._error = undefined;
    this._labels = ev.detail.value;
  }

  private _pictureChanged(ev: ValueChangedEvent<string | null>) {
    this._error = undefined;
    this._picture = (ev.target as HaPictureUpload).value;
  }

  private async _updateEntry() {
    const create = !this._params!.entry;
    this._submitting = true;
    try {
      const values: AreaRegistryEntryMutableParams = {
        name: this._name.trim(),
        picture: this._picture || (create ? undefined : null),
        icon: this._icon || (create ? undefined : null),
        floor_id: this._floor || (create ? undefined : null),
        labels: this._labels || null,
        aliases: this._aliases,
      };
      if (create) {
        await this._params!.createEntry!(values);
      } else {
        await this._params!.updateEntry!(values);
      }
      this.closeDialog();
    } catch (err: any) {
      this._error =
        err.message ||
        this.hass.localize("ui.panel.config.areas.editor.unknown_error");
    } finally {
      this._submitting = false;
    }
  }

  private _aliasesChanged(ev: CustomEvent): void {
    this._aliases = ev.detail.value;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      css`
        ha-textfield,
        ha-icon-picker,
        ha-floor-picker,
        ha-labels-picker,
        ha-picture-upload {
          display: block;
          margin-bottom: 16px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-area-registry-detail": DialogAreaDetail;
  }
}

customElements.define("dialog-area-registry-detail", DialogAreaDetail);

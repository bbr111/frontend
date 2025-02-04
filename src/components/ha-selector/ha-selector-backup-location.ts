import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { BackupLocationSelector } from "../../data/selector";
import type { HomeAssistant } from "../../types";
import "../ha-mount-picker";

@customElement("ha-selector-backup_location")
export class HaBackupLocationSelector extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public selector!: BackupLocationSelector;

  @property() public value?: any;

  @property() public label?: string;

  @property() public helper?: string;

  @property({ type: Boolean }) public disabled = false;

  @property({ type: Boolean }) public required = true;

  protected render() {
    return html`<ha-mount-picker
      .hass=${this.hass}
      .value=${this.value}
      .label=${this.label}
      .helper=${this.helper}
      .disabled=${this.disabled}
      .required=${this.required}
      usage="backup"
    ></ha-mount-picker>`;
  }

  static styles = css`
    ha-mount-picker {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-selector-backup_location": HaBackupLocationSelector;
  }
}

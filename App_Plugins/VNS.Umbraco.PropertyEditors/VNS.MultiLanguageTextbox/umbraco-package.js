import { css as g, property as p, state as h, customElement as c, html as r } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as d } from "@umbraco-cms/backoffice/lit-element";
import { UmbChangeEvent as _ } from "@umbraco-cms/backoffice/event";
import { UmbTextStyles as x } from "@umbraco-cms/backoffice/style";
var f = Object.defineProperty, m = Object.getOwnPropertyDescriptor, l = (e, t, s, a) => {
  for (var u = a > 1 ? void 0 : a ? m(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (u = (a ? o(t, s, u) : o(u)) || u);
  return a && u && f(t, s, u), u;
};
let i = class extends d {
  constructor() {
    super(...arguments), this._value = "", this._pendingValue = null, this._languages = [], this._textValues = /* @__PURE__ */ new Map(), this._initialized = !1;
  }
  get value() {
    return this._value;
  }
  set value(e) {
    const t = this._value;
    this._value = e, this._languages.length > 0 && t !== e ? this._parseValue() : t !== e && (this._pendingValue = e), this.requestUpdate("value", t);
  }
  get _rawConfig() {
    return this.config ?? {};
  }
  get _useTextArea() {
    return this._rawConfig.useTextArea ?? !1;
  }
  get _isMandatoryLanguageRequired() {
    return this._rawConfig.isMandatoryLanguageRequired ?? !1;
  }
  async connectedCallback() {
    super.connectedCallback(), this._pendingValue !== null && (this._value = this._pendingValue, this._pendingValue = null), this._parseValue(), this._initialized = !0, this._loadLanguagesFromContext();
  }
  async _loadLanguagesFromContext() {
    try {
      const { UmbLanguageCollectionRepository: e } = await import("@umbraco-cms/backoffice/language"), t = new e(this), { data: s } = await t.requestCollection({});
      if (s && s.items && s.items.length > 0) {
        this._languages = s.items.map((a) => ({
          culture: a.unique || a.isoCode,
          name: a.name,
          isMandatory: a.isDefault || !1
        })), this._languages.forEach((a) => {
          this._textValues.has(a.culture) || this._textValues.set(a.culture, "");
        }), this._parseValue(), this.requestUpdate();
        return;
      }
    } catch {
    }
    this._languages.length === 0 && (this._languages = [
      { culture: "en-US", name: "English (United States)", isMandatory: !0 },
      { culture: "da-DK", name: "Danish (Denmark)", isMandatory: !1 }
    ], this._parseValue(), this.requestUpdate());
  }
  _parseValue() {
    if (this._textValues.clear(), !this.value || this.value === "" || this.value === "[]") {
      this._languages.forEach((e) => {
        this._textValues.set(e.culture, "");
      });
      return;
    }
    try {
      let e;
      typeof this.value == "object" ? e = Array.isArray(this.value) ? this.value : [this.value] : typeof this.value == "string" ? e = JSON.parse(this.value) : e = [], this._languages.forEach((t) => {
        this._textValues.set(t.culture, "");
      }), Array.isArray(e) && e.forEach((t) => {
        t && t.culture && this._textValues.set(t.culture, t.text || "");
      });
    } catch {
      this._languages.forEach((e) => {
        this._textValues.set(e.culture, "");
      });
    }
    this.requestUpdate();
  }
  _onInput(e, t) {
    const a = t.target.value || "";
    this._textValues.set(e, a), this._updateValue(), this.requestUpdate();
  }
  _updateValue() {
    const e = this._languages.map((s) => ({
      culture: s.culture,
      text: this._textValues.get(s.culture) || ""
    })), t = JSON.stringify(e);
    this._value !== t && (this._value = t, this.dispatchEvent(new _()));
  }
  _getTextValue(e) {
    return this._textValues.get(e) || "";
  }
  render() {
    return this._initialized ? r`
      <div class="multilanguage-textbox-wrapper">
        ${this._languages.map((e) => r`
          <div class="language-input-group">
            <label class="language-label">
              ${e.name}
              ${this._isMandatoryLanguageRequired && e.isMandatory ? r`
                <strong class="required-indicator">*</strong>
              ` : ""}
            </label>
            ${this._useTextArea ? r`
              <textarea
                class="language-textarea"
                .value=${this._getTextValue(e.culture)}
                @input=${(t) => this._onInput(e.culture, t)}
                @change=${(t) => this._onInput(e.culture, t)}
                placeholder="Enter text for ${e.name}"
              ></textarea>
            ` : r`
              <uui-input
                class="language-input"
                label="text for ${e.name}"
                .value=${this._getTextValue(e.culture)}
                @input=${(t) => this._onInput(e.culture, t)}
                @change=${(t) => this._onInput(e.culture, t)}
              ></uui-input>
            `}
          </div>
        `)}
      </div>
    ` : r`<div>Loading languages...</div>`;
  }
};
i.styles = [
  x,
  g`
      .multilanguage-textbox-wrapper {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .language-input-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .language-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--uui-color-text);
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .required-indicator {
        color: var(--uui-color-danger);
      }

      .language-input {
        width: 100%;
      }

      .language-textarea {
        width: 100%;
        min-height: 100px;
        padding: 10px;
        border: 1px solid var(--uui-color-border);
        border-radius: 4px;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
      }

      .language-textarea:focus {
        outline: none;
        border-color: var(--uui-color-selected);
        box-shadow: 0 0 0 2px var(--uui-color-selected-emphasis);
      }
    `
];
l([
  p({ type: String })
], i.prototype, "value", 1);
l([
  p({ type: Object })
], i.prototype, "config", 2);
l([
  h()
], i.prototype, "_languages", 2);
l([
  h()
], i.prototype, "_textValues", 2);
l([
  h()
], i.prototype, "_initialized", 2);
i = l([
  c("vns-umbraco-property-editors-multilanguagetextbox-property-editor-ui")
], i);
export {
  i as default
};

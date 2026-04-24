import { html, css, customElement, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/property-editor';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

interface LanguageTextValue {
  culture: string;
  text: string;
}

interface CultureInfo {
  culture: string;
  name: string;
  isMandatory: boolean;
}

@customElement('vns-umbraco-property-editors-multilanguagetextbox-property-editor-ui')
export default class MultiLanguageTextboxPropertyEditorUIElement extends UmbLitElement implements UmbPropertyEditorUiElement {
  private _value: string = '';
  private _pendingValue: string | null = null;

  @property({ type: String })
  public get value(): string {
    return this._value;
  }
  public set value(newValue: string) {
    const oldValue = this._value;
    this._value = newValue;
    
    if (this._languages.length > 0 && oldValue !== newValue) {
      this._parseValue();
    } else if (oldValue !== newValue) {
      this._pendingValue = newValue;
    }
    
    this.requestUpdate('value', oldValue);
  }

  @property({ type: Object })
  public config?: {
    useTextArea?: boolean;
    isMandatoryLanguageRequired?: boolean;
  };

  @state()
  private _languages: CultureInfo[] = [];

  @state()
  private _textValues: Map<string, string> = new Map();

  @state()
  private _initialized: boolean = false;

  private get _useTextArea(): boolean {
    return this.config?.useTextArea ?? false;
  }

  private get _isMandatoryLanguageRequired(): boolean {
    return this.config?.isMandatoryLanguageRequired ?? false;
  }

  async connectedCallback() {
    super.connectedCallback();
    
    if (this._pendingValue !== null) {
      this._value = this._pendingValue;
      this._pendingValue = null;
    }
    
    // Initialize immediately with any data we have
    this._parseValue();
    this._initialized = true;
    
    // Start loading languages in background using Umbraco context
    this._loadLanguagesFromContext();
  }

  private async _loadLanguagesFromContext() {
    try {
      // Use dynamic import to load Umbraco's language repository
      const { UmbLanguageCollectionRepository } = await import('@umbraco-cms/backoffice/language');
      
      // Create repository instance
      const repository = new UmbLanguageCollectionRepository(this);
      
      // Request all languages
      const { data } = await repository.requestCollection({});
      
      if (data && data.items && data.items.length > 0) {
        this._languages = data.items.map((lang: any) => ({
          culture: lang.unique || lang.isoCode,
          name: lang.name,
          isMandatory: lang.isDefault || false
        }));
        
        // Ensure all languages have values in the map
        this._languages.forEach(lang => {
          if (!this._textValues.has(lang.culture)) {
            this._textValues.set(lang.culture, '');
          }
        });
        
        // Re-parse value to populate new languages
        this._parseValue();
        this.requestUpdate();
        return;
      }
    } catch (error) {
      // Silent fallback
    }
    
    // Fallback to hardcoded list
    if (this._languages.length === 0) {
      this._languages = [
        { culture: 'en-US', name: 'English (United States)', isMandatory: true },
        { culture: 'da-DK', name: 'Danish (Denmark)', isMandatory: false }
      ];
      this._parseValue();
      this.requestUpdate();
    }
  }

  private _parseValue() {
    this._textValues.clear();
    
    if (!this.value || this.value === '' || this.value === '[]') {
      this._languages.forEach(lang => {
        this._textValues.set(lang.culture, '');
      });
      return;
    }

    try {
      let values: LanguageTextValue[];
      
      if (typeof this.value === 'object') {
        values = Array.isArray(this.value) ? this.value : [this.value];
      } else if (typeof this.value === 'string') {
        values = JSON.parse(this.value);
      } else {
        values = [];
      }
      
      this._languages.forEach(lang => {
        this._textValues.set(lang.culture, '');
      });
      
      if (Array.isArray(values)) {
        values.forEach(v => {
          if (v && v.culture) {
            this._textValues.set(v.culture, v.text || '');
        }
      });
      }
    } catch (error) {
      this._languages.forEach(lang => {
        this._textValues.set(lang.culture, '');
      });
    }    this.requestUpdate();
  }

  private _onInput(culture: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value || '';
    this._textValues.set(culture, value);
    this._updateValue();
    this.requestUpdate();
  }

  private _updateValue() {
    const values: LanguageTextValue[] = this._languages.map(lang => ({
      culture: lang.culture,
      text: this._textValues.get(lang.culture) || ''
    }));

    const newValue = JSON.stringify(values);
    
    if (this._value !== newValue) {
      this._value = newValue;
      this.dispatchEvent(new UmbChangeEvent());
    }
  }

  private _getTextValue(culture: string): string {
    return this._textValues.get(culture) || '';
  }

  override render() {
    if (!this._initialized) {
      return html`<div>Loading languages...</div>`;
    }

    return html`
      <div class="multilanguage-textbox-wrapper">
        ${this._languages.map(lang => html`
          <div class="language-input-group">
            <label class="language-label">
              ${lang.name}
              ${this._isMandatoryLanguageRequired && lang.isMandatory ? html`
                <strong class="required-indicator">*</strong>
              ` : ''}
            </label>
            ${this._useTextArea ? html`
              <textarea
                class="language-textarea"
                .value=${this._getTextValue(lang.culture)}
                @input=${(e: Event) => this._onInput(lang.culture, e)}
                @change=${(e: Event) => this._onInput(lang.culture, e)}
                placeholder="Enter text for ${lang.name}"
              ></textarea>
            ` : html`
              <uui-input
                class="language-input"
                label="text for ${lang.name}"
                .value=${this._getTextValue(lang.culture)}
                @input=${(e: Event) => this._onInput(lang.culture, e)}
                @change=${(e: Event) => this._onInput(lang.culture, e)}
              ></uui-input>
            `}
          </div>
        `)}
      </div>
    `;
  }

  static override readonly styles = [
    UmbTextStyles,
    css`
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
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'vns-umbraco-property-editors-multilanguagetextbox-property-editor-ui': MultiLanguageTextboxPropertyEditorUIElement;
  }
}

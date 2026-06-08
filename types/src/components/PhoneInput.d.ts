import { default as React } from 'react';
import { InputProps, InputRef } from 'antd';
import { CountryCode } from 'libphonenumber-js';
/** Props for {@link PhoneInput}. */
export type PhoneInputProps = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> & {
    /** Controlled E.164 value (e.g. `+12133734253`). */
    value?: string;
    /** Initial E.164 value for uncontrolled usage. */
    defaultValue?: string;
    /** Called with an E.164 string when the value changes, or `undefined` when empty. */
    onChange?: (value: string | undefined) => void;
    /** Country pre-selected when the field has no value. Defaults to `"US"`. */
    defaultCountry?: CountryCode;
    /** Restrict the country dropdown to this subset of country codes. */
    allowedCountries?: CountryCode[];
    /** Countries pinned to the top of the dropdown list. */
    priorityCountries?: CountryCode[];
    /** Show a search box inside the country dropdown. Defaults to `true`. */
    searchable?: boolean;
    /** Show the dial code (e.g. `+1`) as a second addon. Defaults to `true`. */
    callingCode?: boolean;
};
/**
 * Phone number input that combines a country-flag selector, an optional dial-code label, and a national-format
 * text field.
 *
 * - Emits and accepts E.164 (`+12133734253`); displays in National format.
 * - Controlled via `value`/`onChange`; uncontrolled via `defaultValue`.
 * - Integrates with Ant Design `Form.Item` -- `onChange` emits an E.164 string
 *   (or `undefined`) compatible with `buildPhoneRule` from `phones.ts`.
 *
 * @example Standalone
 * ```tsx
 * <PhoneInput defaultCountry="KY" onChange={(e164) => console.log(e164)} />
 * ```
 *
 * @example Inside Form.Item
 * ```tsx
 * <Form.Item name="phone" rules={[buildPhoneRule()]}>
 *   <PhoneInput priorityCountries={["KY", "GB", "US"]} />
 * </Form.Item>
 * ```
 */
declare const PhoneInput: React.ForwardRefExoticComponent<Omit<InputProps, "type" | "defaultValue" | "onChange" | "value"> & {
    /** Controlled E.164 value (e.g. `+12133734253`). */
    value?: string;
    /** Initial E.164 value for uncontrolled usage. */
    defaultValue?: string;
    /** Called with an E.164 string when the value changes, or `undefined` when empty. */
    onChange?: (value: string | undefined) => void;
    /** Country pre-selected when the field has no value. Defaults to `"US"`. */
    defaultCountry?: CountryCode;
    /** Restrict the country dropdown to this subset of country codes. */
    allowedCountries?: CountryCode[];
    /** Countries pinned to the top of the dropdown list. */
    priorityCountries?: CountryCode[];
    /** Show a search box inside the country dropdown. Defaults to `true`. */
    searchable?: boolean;
    /** Show the dial code (e.g. `+1`) as a second addon. Defaults to `true`. */
    callingCode?: boolean;
} & React.RefAttributes<InputRef>>;
export default PhoneInput;

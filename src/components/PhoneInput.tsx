import React, {
	forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState,
} from "react";
import type { InputProps, InputRef } from "antd";
import type { CountryCode } from "libphonenumber-js";
import { Form, Input, Select, Space, theme, Typography } from "antd";
import { AsYouType, getCountries, getCountryCallingCode } from "libphonenumber-js";
import * as phones from "../utils/phones.ts";
import CountryDropdown from "./CountryDropdown";
import FlagIcon from "./FlagIcon";

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
const PhoneInput = forwardRef<InputRef, PhoneInputProps>(
	function PhoneInputInner(
		{
			value: controlledValue,
			defaultValue,
			onChange,
			defaultCountry = "US",
			allowedCountries,
			priorityCountries,
			searchable = true,
			callingCode = true,
			disabled,
			...inputProps
		},
		forwardedRef,
	) {
		// State -- lazy initializers so phone parsing only runs on mount
		const [country, setCountry] = useState<CountryCode>(() => {
			const seed = controlledValue ?? defaultValue;
			const raw = phones.resolveCountry(seed, defaultCountry);
			return allowedCountries?.length && !allowedCountries.includes(raw)
				? allowedCountries[0]
				: raw;
		});

		const [displayValue, setDisplayValue] = useState<string>(() => {
			const seed = controlledValue ?? defaultValue;
			if (!seed) return "";
			const raw = phones.resolveCountry(seed, defaultCountry);
			const c = allowedCountries?.length && !allowedCountries.includes(raw)
				? allowedCountries[0]
				: raw;
			return phones.toNationalDisplay(seed, c);
		});

		const [countrySearch, setCountrySearch] = useState("");
		const [dropdownOpen, setDropdownOpen] = useState(false);
		// Incremented each time the dropdown opens; passed as `key` to CountryDropdown
		// to force a fresh mount (and re-fire the focus effect) on every open.
		const [dropdownEpoch, setDropdownEpoch] = useState(0);
		// Measured wrapper width; updated when the dropdown opens so the popup
		// width matches the component without reading refs during render.
		const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);

		const wrapperRef = useRef<HTMLDivElement>(null);
		const inputRef = useRef<InputRef>(null);

		useImperativeHandle(forwardedRef, () => inputRef.current as InputRef);

		const countryList = useMemo<CountryCode[]>(() => {
			const all = getCountries() as CountryCode[];
			const allowedSet = allowedCountries?.length ? new Set(allowedCountries) : null;
			const base = allowedSet ? all.filter((c) => allowedSet.has(c)) : all;

			if (!priorityCountries?.length) return base;

			const prioritySet = new Set(priorityCountries);
			const pinned = priorityCountries.filter((c) => base.includes(c));
			const rest = base.filter((c) => !prioritySet.has(c));
			return [...pinned, ...rest];
		}, [allowedCountries, priorityCountries]);

		const countryLabels = useMemo(
			() => new Map(countryList.map((c) => [c, phones.countryLabel(c)])),
			[countryList],
		);

		const filteredCountries = useMemo(() => {
			if (!searchable || !countrySearch.trim()) return countryList;
			const lower = countrySearch.toLowerCase();
			return countryList.filter(
				(c) =>
					(countryLabels.get(c) ?? c).toLowerCase().includes(lower) ||
					c.toLowerCase().includes(lower) ||
					getCountryCallingCode(c).toString().includes(lower),
			);
		}, [countryList, countryLabels, countrySearch, searchable]);

		// Controlled value sync:
		// prevControlledRef detects when a controlled value is set or cleared.
		// lastEmittedRef tracks the last value we reported via onChange so the effect can skip form echo-backs 
		// (the form reflecting our own emit back as the new controlled value) that would corrupt the display 
		// with a partially-formatted intermediate E.164 string.
		const prevControlledRef = useRef<string | undefined>(controlledValue);
		const lastEmittedRef = useRef<string | undefined>(controlledValue);

		useEffect(() => {
			const incoming = controlledValue ?? undefined;
			const prev = prevControlledRef.current ?? undefined;

			// Run if the value changed AND at least one side is defined
			// (i.e. the component is - or was - controlled).
			if (incoming === prev) return;
			if (incoming === undefined && prev === undefined) return;

			prevControlledRef.current = incoming;

			// The form is echoing back a value we just emitted - local state is
			// already correct, so skip the reparse/reformat to avoid overwriting
			// displayValue with a raw partial E.164 string.
			if (incoming === lastEmittedRef.current) return;

			const parsedCountry = incoming ? phones.countryFromE164(incoming) : undefined;
			const clampedCountry =
				parsedCountry &&
				(!allowedCountries?.length || allowedCountries.includes(parsedCountry))
					? parsedCountry
					: undefined;
			const nextCountry = clampedCountry ?? country;
			const nextDisplay = incoming
				? phones.toNationalDisplay(incoming, nextCountry)
				: "";

			setCountry(nextCountry);
			setDisplayValue(nextDisplay);
			// country and allowedCountries are intentionally omitted - only reacts to controlled value changes.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [controlledValue]);

		const openDropdown = useCallback(() => {
			setDropdownOpen(true);
			setDropdownEpoch((n) => n + 1);
			setDropdownWidth(wrapperRef.current?.getBoundingClientRect().width ?? undefined);
		}, []);

		const handleOpenChange = useCallback(
			(open: boolean) => {
				if (open) {
					openDropdown();
				} else {
					setDropdownOpen(false);
					setCountrySearch("");
				}
			},
			[openDropdown],
		);

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const browserValue = e.target.value;
				// selectionStart in onChange reflects the cursor position after the edit.
				const browserCursor = e.target.selectionStart ?? browserValue.length;

				// How many digits appear before the cursor in the browser-modified value?
				// After reformatting we place the cursor after that same digit count.
				const targetDigitIndex = digitsBeforePos(browserValue, browserCursor);

				const formatter = new AsYouType(country);
				const digits = phones.digitsOnly(browserValue);
				const formatted = digits ? formatter.input(digits) : "";
				const e164 = formatter.getNumber()?.format("E.164");

				setDisplayValue(formatted);
				lastEmittedRef.current = e164;
				onChange?.(e164);

				// Only restore cursor when mid-string (at the end React's default is fine).
				if (browserCursor < browserValue.length) {
					const newCursor = posAfterNthDigit(formatted, targetDigitIndex);
					requestAnimationFrame(() => {
						const el = inputRef.current?.nativeElement as HTMLInputElement | null;
						el?.setSelectionRange(newCursor, newCursor);
					});
				}
			},
			[country, onChange],
		);

		// Keyboard handling on the phone input: 
		// Backspace / Delete: skip over formatting characters so the user always removes a digit.
		// ArrowDown: open the country dropdown (allows changing country mid-entry).
		const handleInputKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLInputElement>) => {
				// ArrowDown opens the country dropdown.
				if (e.key === "ArrowDown") {
					e.preventDefault();
					openDropdown();
					return;
				}

				const isBackspace = e.key === "Backspace";
				const isDelete = e.key === "Delete";
				if (!isBackspace && !isDelete) return;

				const input = e.currentTarget;
				const start = input.selectionStart ?? 0;
				const end = input.selectionEnd ?? 0;

				// Range selection: let the browser delete, onChange reformats the rest.
				if (start !== end) return;

				if (isBackspace) {
					if (start > 0 && /\d/.test(displayValue[start - 1])) return;
					e.preventDefault();
					const dbc = digitsBeforePos(displayValue, start);
					if (dbc === 0) return;
					const allDigits = phones.digitsOnly(displayValue);
					const newDigits = allDigits.slice(0, dbc - 1) + allDigits.slice(dbc);
					const formatter = new AsYouType(country);
					const newFormatted = newDigits ? formatter.input(newDigits) : "";
					const e164 = formatter.getNumber()?.format("E.164");
					const newCursor = posAfterNthDigit(newFormatted, dbc - 1);

					setDisplayValue(newFormatted);
					lastEmittedRef.current = e164;
					onChange?.(e164);

					requestAnimationFrame(() => {
						const el = inputRef.current?.nativeElement as HTMLInputElement | null;
						el?.setSelectionRange(newCursor, newCursor);
					});

				} else {
					if (start < displayValue.length && /\d/.test(displayValue[start])) return;

					e.preventDefault();

					const dbc = digitsBeforePos(displayValue, start);
					const allDigits = phones.digitsOnly(displayValue);
					if (dbc >= allDigits.length) return;

					const newDigits = allDigits.slice(0, dbc) + allDigits.slice(dbc + 1);
					const formatter = new AsYouType(country);
					const newFormatted = newDigits ? formatter.input(newDigits) : "";
					const e164 = formatter.getNumber()?.format("E.164");
					const newCursor = posAfterNthDigit(newFormatted, dbc);

					setDisplayValue(newFormatted);
					lastEmittedRef.current = e164;
					onChange?.(e164);

					requestAnimationFrame(() => {
						const el = inputRef.current?.nativeElement as HTMLInputElement | null;
						el?.setSelectionRange(newCursor, newCursor);
					});
				}
			},
			[country, displayValue, onChange, openDropdown],
		);

		const handleCountryChange = useCallback(
			(newCountry: CountryCode) => {
				setCountry(newCountry);
				setCountrySearch("");
				setDropdownOpen(false);

				const digits = phones.digitsOnly(displayValue);
				if (digits) {
					const formatter = new AsYouType(newCountry);
					const formatted = formatter.input(digits);
					const e164 = formatter.getNumber()?.format("E.164");
					setDisplayValue(formatted);
					lastEmittedRef.current = e164;
					onChange?.(e164);
				}

				// AntD Select steals focus back in the first rAF after selection; the second frame wins it back.
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						inputRef.current?.focus();
					});
				});
			},
			[displayValue, onChange],
		);

		const popupRender = useCallback(
			() => (
				<CountryDropdown
					key={dropdownEpoch}
					filteredCountries={filteredCountries}
					countryLabels={countryLabels}
					searchable={searchable}
					searchQuery={countrySearch}
					onSearchChange={setCountrySearch}
					onSelect={handleCountryChange}
					onClose={() => setDropdownOpen(false)}
				/>
			),
			[dropdownEpoch, filteredCountries, countryLabels, searchable, countrySearch, handleCountryChange],
		);

		const selectOptions = useMemo(
			() =>
				filteredCountries.map((c) => ({
					value: c,
					label: c,
					title: `${countryLabels.get(c) ?? c} +${getCountryCallingCode(c)}`,
				})),
			[filteredCountries, countryLabels],
		);

		const labelRender = useCallback(
			() => (
				<span style={{ display: "inline-flex", alignItems: "center", overflow: "visible" }}>
					<FlagIcon country={country} />
				</span>
			),
			[country],
		);

		const phoneMaxLength = phones.maxNationalLength(country);

		type ValidateStatus = "" | "success" | "warning" | "error" | "validating";
		const { status: formItemStatus = "" } = useContext(
			(Form.Item.useStatus as unknown as { Context: React.Context<{ status?: ValidateStatus }> }).Context,
		);
		const { token } = theme.useToken();

		return (
			<div ref={wrapperRef} style={{ display: "flex", width: "100%" }}>
				<Space.Compact style={{ width: "100%" }}>
					<Select<CountryCode>
						value={country}
						onChange={handleCountryChange}
						disabled={disabled}
						options={selectOptions}
						labelRender={labelRender}
						style={{ width: 64 }}
						popupMatchSelectWidth={false}
						styles={{
							content: {
								overflow: "visible",
								display: "flex",
								alignItems: "center",
							},
							popup: {
								root: {
									width: dropdownWidth,
									padding: 0,
								},
							},
							input: { caretColor: "transparent" },
						}}
						popupRender={popupRender}
						open={dropdownOpen}
						onOpenChange={handleOpenChange}
						showSearch={
							searchable
								? {
									searchValue: countrySearch,
									onSearch: setCountrySearch,
									filterOption: false,
								}
								: false
						}
						aria-label="Select country"
					/>

					{callingCode && (
						<Space.Addon status={formItemStatus} style={{
							background: token.colorBgContainer,
							pointerEvents: "none",
							borderInlineStartWidth: token.lineWidth,
						}}>
							<Typography.Text type="secondary">
								+{getCountryCallingCode(country)}
							</Typography.Text>
						</Space.Addon>
					)}

					<Input
						aria-label="Phone number"
						{...inputProps}
						ref={inputRef}
						value={displayValue}
						onChange={handleInputChange}
						onKeyDown={handleInputKeyDown}
						type="tel"
						disabled={disabled}
						maxLength={phoneMaxLength}
						style={{ flex: 1, ...inputProps.style }}
					/>
				</Space.Compact>
			</div>
		);
	},
);

export default PhoneInput;

/**
 * Returns the number of digit characters that appear strictly before position `pos` in `value`.
 * Used to anchor cursor position across a format-in-place rewrite.
 */
function digitsBeforePos(value: string, pos: number): number {
	let count = 0;
	for (let i = 0; i < pos; i++) {
		if (/\d/.test(value[i])) count++;
	}
	return count;
}

/**
 * Returns the string index immediately after the `n`-th digit in `value`, or `value.length` when fewer than `n`
 * digits exist. Used to restore cursor position after a format-in-place rewrite.
 */
function posAfterNthDigit(value: string, n: number): number {
	if (n <= 0) return 0;
	let seen = 0;
	for (let i = 0; i < value.length; i++) {
		if (/\d/.test(value[i])) {
			seen++;
			if (seen === n) return i + 1;
		}
	}
	return value.length;
}

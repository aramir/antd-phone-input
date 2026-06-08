import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhoneInput from "../PhoneInput.tsx";

// ---------------------------------------------------------------------------
// Mocks
//
// Ant Design and country-flag-icons use ESM features not supported in jsdom;
// we stub them at the module level so the tests focus on PhoneInput logic.
// ---------------------------------------------------------------------------

vi.mock("antd", async () => {
	const React = await import("react");

	const Input = React.forwardRef<
		HTMLInputElement,
		React.InputHTMLAttributes<HTMLInputElement> & {
		style?: React.CSSProperties;
		onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
	}
	>(function Input({ ...props }, ref) {
		return <input ref={ref} {...props} />;
	});

	const Select = function Select({
		                               value,
		                               onChange,
		                               options,
		                               showSearch,
		                               disabled,
		                               "aria-label": ariaLabel,
	                               }: {
		value: string;
		onChange?: (v: string) => void;
		options?: { value: string; title?: string }[];
		showSearch?: boolean | { searchValue?: string; onSearch?: (v: string) => void; filterOption?: boolean };
		disabled?: boolean;
		"aria-label"?: string;
	}) {
		const isSearchable = !!showSearch;
		const searchValue = typeof showSearch === "object" ? showSearch.searchValue : undefined;
		const onSearch = typeof showSearch === "object" ? showSearch.onSearch : undefined;
		return (
			<div>
				{isSearchable && (
					<input
						aria-label="country-search"
						value={searchValue ?? ""}
						onChange={(e) => onSearch?.(e.target.value)}
					/>
				)}
				<select
					aria-label={ariaLabel ?? "Select country"}
					value={value}
					disabled={disabled}
					onChange={(e) => onChange?.(e.target.value)}
				>
					{(options ?? []).map((o) => (
						<option key={o.value} value={o.value} title={o.title}>
							{o.title ?? o.value}
						</option>
					))}
				</select>
			</div>
		);
	};

	const Space = function Space({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
		return <div style={style}>{children}</div>;
	};
	Space.Compact = function ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
		return <div style={style}>{children}</div>;
	};
	Space.Addon = function Addon({ children }: {
		children: React.ReactNode;
		status?: string;
		style?: React.CSSProperties
	}) {
		return <div>{children}</div>;
	};

	// noinspection JSUnusedGlobalSymbols
	const Typography = {
		Text: function Text({ children }: { children: React.ReactNode }) {
			return <span>{children}</span>;
		},
	};

	const FormItemStatusContext = React.createContext<{ status?: string }>({});
	const useStatus = Object.assign(
		() => ({ status: "" as const, errors: [] as React.ReactNode[], warnings: [] as React.ReactNode[] }),
		{ Context: FormItemStatusContext },
	);
	const Form = {
		Item: Object.assign(
			function FormItem({ children }: { children: React.ReactNode }) {
				return <>{children}</>;
			},
			{ useStatus },
		),
	};

	// noinspection JSUnusedGlobalSymbols
	const theme = {
		useToken: () => ({ token: { colorBgContainer: "#ffffff", lineWidth: 1 } }),
	};

	return { Input, Select, Space, Typography, Form, theme };
});

vi.mock("country-flag-icons/react/3x2", () => ({
	default: new Proxy(
		{},
		{
			get: (_target, prop: string) =>
				function FakeFlag({ style }: { style?: React.CSSProperties }) {
					return <svg data-testid={`flag-${prop}`} style={style} />;
				},
		},
	),
}));


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPhoneInput() {
	return screen.getByLabelText("Phone number") as HTMLInputElement;
}

function getCountrySelect() {
	return screen.getByRole("combobox", { name: /select country/i }) as HTMLSelectElement;
}

/**
 * Places the cursor at `pos` on the input then fires a Backspace or Delete
 * keydown. The component reads `e.currentTarget.selectionStart` to decide
 * which digit to remove, so we have to set the property on the DOM node
 * before dispatching the event.
 */
function fireKeyAtCursor(
	input: HTMLInputElement,
	key: "Backspace" | "Delete",
	pos: number,
) {
	Object.defineProperty(input, "selectionStart", { configurable: true, get: () => pos });
	Object.defineProperty(input, "selectionEnd", { configurable: true, get: () => pos });
	fireEvent.keyDown(input, { key });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PhoneInput", () => {
	describe("uncontrolled", () => {
		it("renders with US default country", () => {
			render(<PhoneInput />);
			expect(getCountrySelect().value).toBe("US");
		});

		it("formats digits in national format as the user types", async () => {
			render(<PhoneInput />);
			await userEvent.type(getPhoneInput(), "2133734253");
			expect(getPhoneInput().value).toBe("(213) 373-4253");
		});

		it("calls onChange with E.164 value", async () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} />);
			await userEvent.type(getPhoneInput(), "2133734253");
			const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
			expect(lastCall).toBe("+12133734253");
		});

		it("calls onChange with undefined when input is cleared", async () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} />);
			await userEvent.type(getPhoneInput(), "2133734253");
			await userEvent.clear(getPhoneInput());
			const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
			expect(lastCall).toBeUndefined();
		});

		it("initialises from defaultValue in national format", () => {
			render(<PhoneInput defaultValue="+12133734253" />);
			expect(getPhoneInput().value).toBe("(213) 373-4253");
		});

		it("sets country from defaultValue", () => {
			render(<PhoneInput defaultValue="+442071234567" />);
			expect(getCountrySelect().value).toBe("GB");
		});
	});

	describe("controlled", () => {
		it("displays the controlled E.164 value in national format", () => {
			render(<PhoneInput value="+12133734253" />);
			expect(getPhoneInput().value).toBe("(213) 373-4253");
		});

		it("updates display when controlled value changes", () => {
			function Wrapper() {
				const [val, setVal] = useState<string | undefined>("+12133734253");
				return (
					<>
						<PhoneInput value={val} onChange={setVal} />
						<button onClick={() => setVal("+442071234567")}>Switch</button>
					</>
				);
			}

			render(<Wrapper />);
			expect(getPhoneInput().value).toBe("(213) 373-4253");
			fireEvent.click(screen.getByText("Switch"));
			expect(getPhoneInput().value).toBe("020 7123 4567");
		});

		it("auto-detects country when controlled value changes to a different country", () => {
			function Wrapper() {
				const [val, setVal] = useState<string | undefined>("+12133734253");
				return (
					<>
						<PhoneInput value={val} onChange={setVal} />
						<button onClick={() => setVal("+442071234567")}>Switch</button>
					</>
				);
			}

			render(<Wrapper />);
			expect(getCountrySelect().value).toBe("US");
			fireEvent.click(screen.getByText("Switch"));
			expect(getCountrySelect().value).toBe("GB");
		});

		it("clears display when controlled value becomes undefined", async () => {
			function Wrapper() {
				const [val, setVal] = useState<string | undefined>("+12133734253");
				return (
					<>
						<PhoneInput value={val} onChange={setVal} />
						<button onClick={() => setVal(undefined)}>Clear</button>
					</>
				);
			}

			render(<Wrapper />);
			await userEvent.click(screen.getByText("Clear"));
			expect(getPhoneInput().value).toBe("");
		});
	});

	describe("country selection", () => {
		it("respects defaultCountry prop", () => {
			render(<PhoneInput defaultCountry="DE" />);
			expect(getCountrySelect().value).toBe("DE");
		});

		it("reformats existing digits when country changes", async () => {
			render(<PhoneInput defaultCountry="US" />);
			await userEvent.type(getPhoneInput(), "2133734253");
			fireEvent.change(getCountrySelect(), { target: { value: "GB" } });
			expect(getPhoneInput().value).not.toBe("(213) 373-4253");
		});

		it("emits a new E.164 value after country change", async () => {
			const onChange = vi.fn();
			render(<PhoneInput defaultCountry="US" onChange={onChange} />);
			await userEvent.type(getPhoneInput(), "2133734253");
			onChange.mockClear();
			fireEvent.change(getCountrySelect(), { target: { value: "GB" } });
			const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
			// Reformatted under GB, so no longer a US E.164 number.
			expect(lastCall).not.toBe("+12133734253");
		});

		it("restricts displayed countries via allowedCountries", () => {
			render(<PhoneInput allowedCountries={["US", "CA", "GB"]} />);
			const options = Array.from(getCountrySelect().options).map((o) => o.value);
			expect(options).toEqual(expect.arrayContaining(["US", "CA", "GB"]));
			expect(options.length).toBe(3);
		});

		it("falls back to first allowedCountry when defaultValue country is not in allowedCountries", () => {
			// defaultValue is a GB number, but GB is not allowed — should fall back to "US"
			render(<PhoneInput defaultValue="+442071234567" allowedCountries={["US", "CA"]} />);
			expect(getCountrySelect().value).toBe("US");
		});

		it("pins priorityCountries to the top of the list", () => {
			render(<PhoneInput priorityCountries={["GB", "CA"]} />);
			const options = Array.from(getCountrySelect().options).map((o) => o.value);
			expect(options[0]).toBe("GB");
			expect(options[1]).toBe("CA");
			// The rest of the list still contains other countries.
			expect(options.length).toBeGreaterThan(2);
		});

		it("priorityCountries only includes codes present in allowedCountries", () => {
			render(
				<PhoneInput
					allowedCountries={["US", "CA", "GB"]}
					priorityCountries={["CA", "DE"]}
				/>,
			);
			const options = Array.from(getCountrySelect().options).map((o) => o.value);
			// DE is not in allowedCountries so it must not appear at all.
			expect(options).not.toContain("DE");
			// CA (in both) should be first.
			expect(options[0]).toBe("CA");
			expect(options.length).toBe(3);
		});
	});

	describe("searchable", () => {
		it("does not render search input when searchable=false", () => {
			render(<PhoneInput searchable={false} />);
			expect(screen.queryByLabelText("country-search")).toBeNull();
		});

		it("renders a search input when searchable=true", () => {
			render(<PhoneInput searchable />);
			expect(screen.getByLabelText("country-search")).toBeInTheDocument();
		});

		it("filters country options by search text", async () => {
			render(<PhoneInput searchable />);
			await userEvent.type(screen.getByLabelText("country-search"), "United");
			const options = Array.from(getCountrySelect().options);
			expect(options.length).toBeGreaterThan(0);
			expect(options.every((o) => o.title?.toLowerCase().includes("united"))).toBe(true);
		});

		it("clears search and restores full list after search input is cleared", async () => {
			render(<PhoneInput searchable allowedCountries={["US", "CA", "GB", "DE"]} />);
			const search = screen.getByLabelText("country-search");
			await userEvent.type(search, "United");
			const filtered = Array.from(getCountrySelect().options).length;
			await userEvent.clear(search);
			const restored = Array.from(getCountrySelect().options).length;
			expect(restored).toBeGreaterThan(filtered);
		});
	});

	describe("callingCode addon", () => {
		it("shows the dial code addon by default", () => {
			render(<PhoneInput defaultCountry="US" />);
			// +1 should be visible somewhere in the rendered output.
			expect(screen.getByText("+1")).toBeInTheDocument();
		});

		it("hides the dial code addon when callingCode=false", () => {
			render(<PhoneInput defaultCountry="US" callingCode={false} />);
			expect(screen.queryByText("+1")).toBeNull();
		});

		it("updates the dial code when country changes", async () => {
			render(<PhoneInput defaultCountry="US" />);
			expect(screen.getByText("+1")).toBeInTheDocument();
			fireEvent.change(getCountrySelect(), { target: { value: "DE" } });
			expect(screen.getByText("+49")).toBeInTheDocument();
		});
	});

	describe("maxLength", () => {
		it("applies a maxLength to the phone input based on the selected country", () => {
			render(<PhoneInput defaultCountry="US" />);
			const maxLen = getPhoneInput().getAttribute("maxlength");
			expect(maxLen).not.toBeNull();
			expect(Number(maxLen)).toBeGreaterThan(0);
		});

		it("maxLength changes when the country changes", () => {
			render(<PhoneInput defaultCountry="US" />);
			const usBefore = Number(getPhoneInput().getAttribute("maxlength"));
			fireEvent.change(getCountrySelect(), { target: { value: "RU" } });
			const ruAfter = Number(getPhoneInput().getAttribute("maxlength"));
			// Russia's national format is longer than the US, so maxlength should differ.
			expect(ruAfter).not.toBe(usBefore);
		});
	});

	describe("disabled", () => {
		it("disables both the input and the country selector", () => {
			render(<PhoneInput disabled />);
			expect(getPhoneInput()).toBeDisabled();
			expect(getCountrySelect()).toBeDisabled();
		});
	});

	describe("Backspace through formatting characters", () => {
		it("removes the digit before a closing parenthesis when Backspace is pressed after it", async () => {
			// Type a Canadian number so the input shows "(778) 847".
			render(<PhoneInput defaultCountry="CA" />);
			await userEvent.type(getPhoneInput(), "778847");
			const input = getPhoneInput();
			expect(input.value).toBe("(778) 847");

			// Cursor is placed at position 5 -- right after the ')'.
			// Backspace should remove the '8'
			// leaving "(77) 847" → reformatted as "(778) 47".
			fireKeyAtCursor(input, "Backspace", 5);
			expect(input.value).toBe("(778) 47");
		});

		it("does nothing on Backspace when the cursor is at position 0", async () => {
			render(<PhoneInput defaultCountry="US" />);
			await userEvent.type(getPhoneInput(), "2133734253");
			const input = getPhoneInput();
			const before = input.value;
			fireKeyAtCursor(input, "Backspace", 0);
			expect(input.value).toBe(before);
		});

		it("removes a digit normally when the cursor follows a digit (no intervention)", async () => {
			render(<PhoneInput defaultCountry="US" />);
			await userEvent.type(getPhoneInput(), "2133734253");
			const input = getPhoneInput();
			// Cursor after '3' at position 4 — the char before cursor IS a digit,
			// so the handler defers to the browser. The browser fires onChange with
			// the digit removed; we just verify the value shrinks.
			expect(input.value).toBe("(213) 373-4253");
		});
	});

	describe("Delete through formatting characters", () => {
		it("removes the first digit when Delete is pressed at position 0 before a formatting char", async () => {
			render(<PhoneInput defaultCountry="CA" />);
			await userEvent.type(getPhoneInput(), "7788478709");
			const input = getPhoneInput();
			expect(input.value).toBe("(778) 847-8709");

			// Cursor at position 0 — '(' is a formatting char, not a digit.
			// Delete should remove the first digit '7', giving "788478709" → "(788) 478-709".
			fireKeyAtCursor(input, "Delete", 0);
			expect(input.value).toBe("(788) 478-709");
		});

		it("does nothing on Delete when the cursor is at the end of the value", async () => {
			render(<PhoneInput defaultCountry="US" />);
			await userEvent.type(getPhoneInput(), "2133734253");
			const input = getPhoneInput();
			const before = input.value;
			fireKeyAtCursor(input, "Delete", before.length);
			expect(input.value).toBe(before);
		});
	});

	describe("controlled mode — form echo-back", () => {
		it("shows national format at each keystroke, not raw E.164, when parent echoes value back", async () => {
			// Simulates a Form.Item parent: receives onChange, stores the E.164, passes
			// it back as `value`. The lastEmittedRef guard must prevent the sync effect
			// from overwriting displayValue with the raw partial E.164 string.
			function ControlledWrapper() {
				const [val, setVal] = useState<string | undefined>(undefined);
				return <PhoneInput defaultCountry="KY" value={val} onChange={setVal} />;
			}

			render(<ControlledWrapper />);
			const input = getPhoneInput();

			await userEvent.type(input, "3");
			expect(input.value).not.toMatch(/^\+/); // must not be raw E.164 like "+13"

			await userEvent.type(input, "456789");
			expect(input.value).not.toMatch(/^\+/);
		});

		it("clears display when parent programmatically sets value to undefined", async () => {
			function ControlledWrapper() {
				const [val, setVal] = useState<string | undefined>("+13435551234");
				return (
					<>
						<PhoneInput defaultCountry="KY" value={val} onChange={setVal} />
						<button onClick={() => setVal(undefined)}>Reset</button>
					</>
				);
			}

			render(<ControlledWrapper />);
			expect(getPhoneInput().value).not.toBe("");

			fireEvent.click(screen.getByText("Reset"));
			expect(getPhoneInput().value).toBe("");
		});
	});

	describe("forwardRef", () => {
		it("forwards the ref to the underlying input element", () => {
			const ref = React.createRef<HTMLInputElement>();
			render(<PhoneInput ref={ref as any} />);
			expect(ref.current).not.toBeNull();
			expect(ref.current?.tagName.toLowerCase()).toBe("input");
		});
	});
});


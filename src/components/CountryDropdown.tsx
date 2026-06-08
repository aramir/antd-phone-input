import type { InputRef } from "antd";
import { Input, Typography } from "antd";
import type { CountryCode } from "libphonenumber-js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import List from "@rc-component/virtual-list";
import CountryOption from "./CountryOption";

const COUNTRY_ITEM_HEIGHT = 32;
const COUNTRY_LIST_HEIGHT = 260;

export type CountryDropdownProps = {
	filteredCountries: CountryCode[];
	countryLabels: Map<CountryCode, string>;
	searchable: boolean;
	searchQuery: string;
	onSearchChange: (q: string) => void;
	onSelect: (country: CountryCode) => void;
	onClose: () => void;
};


export default function CountryDropdown({
	                                filteredCountries,
	                                countryLabels,
	                                searchable,
	                                searchQuery,
	                                onSearchChange,
	                                onSelect,
	                                onClose,
                                }: CountryDropdownProps) {
	const searchRef = useRef<InputRef>(null);
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const listRef = useRef<React.ComponentRef<typeof List>>(null);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHighlightedIndex(0);
	}, [filteredCountries]);

	useEffect(() => {
		listRef.current?.scrollTo({ index: highlightedIndex, align: "auto" });
	}, [highlightedIndex]);

	// Focus the search input on mount (= every dropdown open, because
	// CountryDropdown receives a new `key` each time the popup opens).
	useEffect(() => {
		if (searchable) {
			requestAnimationFrame(() => {
				searchRef.current?.focus();
			});
		}
		// Intentionally mount-only.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSearchKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) return;
			// Prevent AntD Select from consuming these navigation keys.
			e.stopPropagation();
			e.preventDefault();

			if (e.key === "ArrowDown") {
				setHighlightedIndex((i) =>
					Math.min(i + 1, filteredCountries.length - 1),
				);
			} else if (e.key === "ArrowUp") {
				setHighlightedIndex((i) => Math.max(i - 1, 0));
			} else if (e.key === "Enter") {
				const selected = filteredCountries[highlightedIndex];
				if (selected) onSelect(selected);
			} else if (e.key === "Escape") {
				onClose();
			}
		},
		[filteredCountries, highlightedIndex, onSelect, onClose],
	);

	return (
		<div>
			{searchable && (
				<div style={{ padding: "6px 8px" }}>
					<Input
						ref={searchRef}
						placeholder="Search..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						onKeyDown={handleSearchKeyDown}
					/>
				</div>
			)}

			{filteredCountries.length === 0 ? (
				<div style={{ padding: "8px 12px" }}>
					<Typography.Text type="secondary">No results</Typography.Text>
				</div>
			) : (
				<div role="listbox" aria-label="Countries">
					<List<CountryCode>
						ref={listRef}
						data={filteredCountries}
						height={Math.min(filteredCountries.length * COUNTRY_ITEM_HEIGHT, COUNTRY_LIST_HEIGHT)}
						itemHeight={COUNTRY_ITEM_HEIGHT}
						itemKey={(c: any) => c}
						virtual
						styles={{
							verticalScrollBar: { width: 8 },
							verticalScrollBarThumb: {
								background: "rgba(0,0,0,0.2)",
								borderRadius: 4,
							},
						}}
					>
						{(c, index) => (
							<div
								key={c}
								role="option"
								aria-selected={index === highlightedIndex}
								onMouseEnter={() => setHighlightedIndex(index)}
								onMouseDown={(e) => {
									e.preventDefault();
									onSelect(c);
								}}
							>
								<CountryOption
									country={c}
									label={countryLabels.get(c) ?? c}
									highlighted={index === highlightedIndex}
								/>
							</div>
						)}
					</List>
				</div>
			)}
		</div>
	);
}

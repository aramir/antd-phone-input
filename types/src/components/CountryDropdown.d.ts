import { CountryCode } from 'libphonenumber-js';
import { default as React } from 'react';
export type CountryDropdownProps = {
    filteredCountries: CountryCode[];
    countryLabels: Map<CountryCode, string>;
    searchable: boolean;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onSelect: (country: CountryCode) => void;
    onClose: () => void;
};
export default function CountryDropdown({ filteredCountries, countryLabels, searchable, searchQuery, onSearchChange, onSelect, onClose, }: CountryDropdownProps): React.JSX.Element;

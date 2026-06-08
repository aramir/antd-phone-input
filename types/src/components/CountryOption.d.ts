import { CountryCode } from 'libphonenumber-js';
export type CountryOptionProps = {
    country: CountryCode;
    label: string;
    highlighted?: boolean;
};
/**
 * A single row inside the country-picker dropdown list.
 */
export default function CountryOption({ country, label, highlighted }: CountryOptionProps): import("react").JSX.Element;

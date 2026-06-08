# AntD Phone Input

A lightweight phone number input for [Ant Design](https://ant.design/) that shows numbers in national format while storing and emitting 
the international [E.164](https://en.wikipedia.org/wiki/E.164) standard (`+12133734253`).

## Features

- **Uses [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)** -- reliable formatting and validation used in production across thousands of apps
- **National-format display** -- users see `(213) 373-4253` instead of `+12133734253`, which feels natural; the E.164 value is handled internally
- **Ant Design Form integration** -- works as a controlled form field out of the box; includes `buildPhoneRule()` for one-line validation
- **Country search** -- searchable dropdown filtered by country name, ISO code, or dial code
- **Controlled & uncontrolled** -- supports both `value`/`onChange` and `defaultValue`
- **Full keyboard navigation**

## [View Demo Site](https://aramir.github.io/antd-phone-input)

## Installation

```sh
npm install antd-phone-input
```

## Usage

```tsx
import { PhoneInput } from "antd-phone-input";

function App() {
  return (
    <PhoneInput
      onChange={(e164) => console.log(e164)} // "+12133734253"
    />
  );
}
```

## Controlled

```tsx
import { useState } from "react";
import { PhoneInput } from "antd-phone-input";

function App() {
  const [phone, setPhone] = useState<string | undefined>();

  return (
    <PhoneInput
      value={phone}
      onChange={setPhone}
      defaultCountry="GB"
    />
  );
}
```

## Ant Design Form

Use `buildPhoneRule()` to wire up validation. The component emits `undefined` when the field is empty, so pair it with a `required` rule if the field is mandatory.

```tsx
import { Button, Form } from "antd";
import { PhoneInput, buildPhoneRule } from "antd-phone-input";

function ContactForm() {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={(values) => console.log(values)}>
      <Form.Item
        name="phone"
        label="Phone"
        rules={[
          { required: true, message: "Phone is required" },
          buildPhoneRule(),
        ]}
      >
        <PhoneInput />
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
}
```

## Restricting available countries

```tsx
<PhoneInput
  allowedCountries={["US", "CA", "GB", "AU"]}
  defaultCountry="US"
/>
```

## Pinning priority countries to the top

```tsx
<PhoneInput
  priorityCountries={["KY", "GB", "US"]}
  onChange={(e164) => console.log(e164)}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | -- | Controlled E.164 value, e.g. `"+12133734253"` |
| `defaultValue` | `string` | -- | Initial E.164 value for uncontrolled usage |
| `onChange` | `(value: string \| undefined) => void` | -- | Called with an E.164 string on change, or `undefined` when empty |
| `defaultCountry` | `CountryCode` | `"US"` | Country pre-selected when the field has no value |
| `allowedCountries` | `CountryCode[]` | -- | Restrict the dropdown to this subset of countries |
| `priorityCountries` | `CountryCode[]` | -- | Countries pinned to the top of the dropdown list |
| `searchable` | `boolean` | `true` | Show a search box inside the country dropdown |
| `callingCode` | `boolean` | `true` | Show the dial code (e.g. `+1`) as a label between the flag and the input |
| `disabled` | `boolean` | `false` | Disables both the country selector and the phone input |

All other props from Ant Design's `Input` component are forwarded to the underlying input element (e.g. `size`, `status`, `style`, `placeholder`).

## `buildPhoneRule(message?)`

Returns an Ant Design `Rule` that validates a phone number using `libphonenumber-js`. Empty values always pass -- add a `required` rule separately if needed.

```ts
import { buildPhoneRule } from "antd-phone-input";

const rules = [
  { required: true, message: "Phone is required" },
  buildPhoneRule("Not a valid phone number"),
];
```

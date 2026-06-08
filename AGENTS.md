# AGENTS.md — @aramir/antd-phone-input

Agent-oriented guide for working with this codebase. Read before making changes.

---

## What this project is

A React/Ant Design phone number input component published to npm as `@aramir/antd-phone-input`.
It ships a single `PhoneInput` component and a `buildPhoneRule` validator for Ant Design forms.

The repo doubles as its own demo app (`vite.config.ts` / `demo/` or `index.html`) and as the
publishable library (`vite.lib.config.ts` → `dist/`).

---

## Public API surface

Everything exported from `src/index.ts`:

| Export            | Kind      | Description                                                                  |
|-------------------|-----------|------------------------------------------------------------------------------|
| `PhoneInput`      | Component | Main phone input (country selector + dial code + national format text field) |
| `PhoneInputProps` | Type      | Props for `PhoneInput`                                                       |
| `buildPhoneRule`  | Function  | Returns an Ant Design `Rule` that validates an E.164 phone string            |

### PhoneInputProps

| Prop                | Type                                   | Default | Notes                                       |
|---------------------|----------------------------------------|---------|---------------------------------------------|
| `value`             | `string \| undefined`                  | —       | Controlled E.164 value, e.g. `+12133734253` |
| `defaultValue`      | `string \| undefined`                  | —       | Uncontrolled seed, E.164                    |
| `onChange`          | `(value: string \| undefined) => void` | —       | Emits E.164 or `undefined` when cleared     |
| `defaultCountry`    | `CountryCode`                          | `"US"`  | Country preselected when field has no value |
| `allowedCountries`  | `CountryCode[]`                        | —       | Restricts dropdown to this subset           |
| `priorityCountries` | `CountryCode[]`                        | —       | Pins these to the top of the dropdown       |
| `searchable`        | `boolean`                              | `true`  | Shows a search box in the country dropdown  |
| `callingCode`       | `boolean`                              | `true`  | Shows the dial code (+1) as an addon        |

Remaining `InputProps` from Ant Design are forwarded to the underlying `<Input>`.
`value`, `defaultValue`, `onChange`, and `type` are omitted from the spread.

### buildPhoneRule

```ts
buildPhoneRule(message)
```

Empty/undefined values always pass. Pair with a `required` rule if the field is mandatory.

---

## Value contract

- **External format (in/out):** E.164 strings (`+12133734253`).
- **Display format:** National format (`(213) 373-4253`) — never stored; derived live from state.
- The component accepts `value` in E.164 and emits E.164 via `onChange`.
- Ant Design `Form.Item` echoes the last `onChange` value back as the new controlled `value`;
  `lastEmittedRef` in `PhoneInput.tsx` guards against this causing a display corruption loop.

---

## Source layout

```
src/
  index.ts                          — public exports
  components/
    PhoneInput.tsx                  — main component (all state/logic lives here)
    CountryDropdown.tsx             — virtualised country list popup
    CountryOption.tsx               — single row in the country list
    FlagIcon.tsx                    — renders country-flag-icons SVG or dial-code fallback
    __tests__/
      PhoneInput.test.tsx           — integration tests (jsdom, antd/flags mocked)
  utils/
    phones.ts                       — pure helpers: E.164 parsing, national display, digit stripping
    rules.ts                        — buildPhoneRule
    __tests__/
      buildPhoneRule.test.ts        — unit tests for the rule builder
```

---

## Key design decisions

### Virtual list for the country dropdown
`CountryDropdown` uses `@rc-component/virtual-list` (the same list Ant Design uses internally)
to render the ~250-country list efficiently. This package is **external** in the lib build and
must be present in the consumer's `node_modules` (it comes as a transitive dep of `antd`).

### Cursor preservation on format-in-place
`PhoneInput` reformats the input on every keystroke using `AsYouType` from `libphonenumber-js`.
When the cursor is mid-string, it counts digits before the cursor, reformats, then restores
the cursor to after the same digit count via `requestAnimationFrame`. Same logic applies for
custom Backspace/Delete handling over formatting characters.

### `CountryDropdown` remount on open
`dropdownEpoch` is incremented every time the dropdown opens and passed as `key` to
`CountryDropdown`. This forces a fresh mount so the `useEffect` that focuses the search input
fires again on every open.

### Form echo-back guard
`lastEmittedRef` tracks the last E.164 string emitted via `onChange`. The controlled-value sync
`useEffect` skips updates where `controlledValue === lastEmittedRef.current` to avoid replacing
the national-format display string with the partial E.164 the form just echoed back.

---

## Build system

| Config file          | Purpose                                             |
|----------------------|-----------------------------------------------------|
| `vite.lib.config.ts` | Library build → `dist/index.js` + `dist/index.d.ts` |
| `vite.config.ts`     | Demo app dev server / demo production build         |
| `vitest.config.ts`   | Test runner (jsdom environment)                     |
| `tsconfig.lib.json`  | TypeScript for the library (`src/**/*`)             |
| `tsconfig.json`      | TypeScript for the demo (`demo/`)                   |

### Library build externals

The following are **not bundled** and must be present in the consumer's project:

```
react
react/jsx-runtime        ← MUST be external or rolldown bundles the CJS version
react/jsx-dev-runtime    ← same
react-dom
antd
@rc-component/virtual-list
libphonenumber-js
libphonenumber-js/examples.mobile.json
country-flag-icons
country-flag-icons/react/3x2
```

**Critical:** `react/jsx-runtime` and `react/jsx-dev-runtime` must stay in the external list.
The JSX transform injects imports of these sub-paths into every JSX file. If they are not
externalized, rolldown bundles the CJS versions and injects a `require()` shim that throws
in browser ESM environments:
> `Error: Calling require for "react" in an environment that doesn't expose the require function`

### npm scripts

```
npm run build:lib     # build dist/ (runs prepublishOnly chain: lint → test → build)
npm run dev           # start demo dev server
npm run build:demo    # build demo app
npm run test          # run all tests once
npm run lint          # ESLint
npm publish           # alias: npm run publish (--access public)
```

---

## Testing

- Framework: **Vitest** + **@testing-library/react**, jsdom environment.
- `antd` is fully mocked at the module level — tests must not depend on real Ant Design renders.
- `country-flag-icons/react/3x2` is mocked with a `Proxy` that returns stub SVG components.
- `@rc-component/virtual-list` is not mocked; `antd` mock indirectly avoids it.
- All tests are in `__tests__/` directories co-located with the source they test.
- Do not test implementation details of cursor positioning or internal state directly;
  test observable DOM output (input value, selected country, etc.).

---

## Common pitfalls

1. **Adding a new dependency** — decide whether it should be bundled or external. If it's a
   React-ecosystem package or already a dependency of `antd`, make it external.

2. **Forgetting `react/jsx-runtime` in externals** — never remove it. See "Critical" note above.

3. **`@rc-component/virtual-list` is NOT in peerDependencies** — it arrives via `antd`. Don't
   add it as a direct dependency; consumers already have it transitively.

4. **E.164 ↔ national format boundary** — `PhoneInput` stores `displayValue` as national format,
   never E.164. All external communication (props, onChange) uses E.164. Don't mix formats.

5. **`CountryDropdown` receives `key={dropdownEpoch}`** — this is intentional. Don't remove it
   or replace it with a stable key; the search-focus `useEffect` depends on remount.

6. **The antd mock in tests is complex** — when adding new antd components to the source, add
   corresponding stubs in `PhoneInput.test.tsx`. The mock must export exactly what the component
   imports or tests will fail with import errors.

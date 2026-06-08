import { Rule } from 'antd/lib/form';
/**
 * Returns an Ant Design `Rule` that validates a phone field using `libphonenumber-js`.
 * Empty / undefined values pass — pair with a `required` rule if the field is mandatory.
 *
 * @param message Custom rejection message.
 */
export declare function buildPhoneRule(message?: string): Rule;

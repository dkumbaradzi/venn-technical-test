import PhoneInput, { type Props as PhoneInputProps } from "react-phone-number-input/react-hook-form-input"
import { parsePhoneNumber, type DefaultInputComponentProps } from 'react-phone-number-input';
import { get, useFormContext, type FieldValues } from 'react-hook-form';
import classNames from 'classnames';
import FormControl from "./FormControl";

type Props = PhoneInputProps<DefaultInputComponentProps, FieldValues> & {
  className?: string;
  label: string
};

export const PhoneInputFormControl = ({ className, name, label, onChange, value, ...props }: Props) => {
  const {
    formState: { errors },
    control
  } = useFormContext();
  const hasError = !!get(errors, name);

  return (
    <FormControl name={name} label={label} className={className}>
      <PhoneInput
        name={name}
        control={control}
        className={classNames("border border-gray-300 rounded-lg px-4 py-3 w-full", {
          'border-2 border-red-500': hasError,
        })}
        country="CA"
        value={value}
        onChange={(value: string) => {
          onChange?.(value);
        }}
        {...props}
        rules={{
          required: 'Please enter phone number',
          validate: (value: string | undefined) => {
            if (!value) return 'Please enter phone number';
            const phoneNumber = parsePhoneNumber(value, 'CA');

            if (phoneNumber?.country !== 'CA') {
              return 'Please enter a valid Canadian phone number';
            }

            console.log('Validating phone number:', value, phoneNumber?.country);
          }
        }}
        maxLength={15}
      />
    </FormControl>
  )
}

export default PhoneInputFormControl;
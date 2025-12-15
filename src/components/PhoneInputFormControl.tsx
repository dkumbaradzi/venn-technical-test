import { useMemo } from 'react';
import PhoneInput, { type Props as PhoneInputProps } from "react-phone-number-input/react-hook-form-input"
import { parsePhoneNumber, type DefaultInputComponentProps } from 'react-phone-number-input';
import { get, useFormContext, type FieldValues } from 'react-hook-form';
import classNames from 'classnames';
import throttle from 'lodash/throttle';
import FormControl from "./FormControl";

type Props = PhoneInputProps<DefaultInputComponentProps, FieldValues> & {
  className?: string;
  label: string
};

export const PhoneInputFormControl = ({ className, name, label, ...props }: Props) => {
  const {
    formState: { errors },
    control, setValue
  } = useFormContext();
  const hasError = !!get(errors, name);

  // Throttle onChange to prevent excessive updates due to library bug when typing very fast
  const throttledOnChange = useMemo(
    () => throttle((value: string | undefined) => {
      setValue(name, value);
    }, 300),
    [name, setValue]
  );

  return (
    <FormControl name={name} label={label} className={className}>
      <PhoneInput
        name={name}
        control={control}
        className={classNames("border border-gray-300 rounded-lg px-4 py-3 w-full", {
          'border-2 border-red-500': hasError,
        })}
        country="CA"
        onChange={throttledOnChange}
        {...props}
        rules={{
          required: 'Please enter phone number',
          validate: (value: string | undefined) => {
            if (!value) return 'Please enter phone number';
            const phoneNumber = parsePhoneNumber(value, 'CA');

            if (phoneNumber?.country !== 'CA') {
              return 'Please enter a valid Canadian phone number';
            }
          }
        }}
        maxLength={15}
      />
    </FormControl>
  )
}

export default PhoneInputFormControl;
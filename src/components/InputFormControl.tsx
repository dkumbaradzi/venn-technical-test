import { useFormContext, get, type ValidationRule } from 'react-hook-form';
import FormControl from './FormControl';
import classNames from 'classnames';

type Props = {
  name: string;
  defaultValue?: string;
  label: string;
  className?: string;
  required?: boolean | string;
  pattern?: ValidationRule<RegExp>;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean | string | Promise<boolean | string>;
};

export const InputFormControlComponent = ({
  name,
  label,
  className,
  required,
  pattern,
  onChange,
  validate,
}: Props) => {
  const {
    formState: { errors },
    register,
  } = useFormContext();
  const hasError = !!get(errors, name);

  return (
    <FormControl name={name} label={label} className={className}>
      <input
        autoComplete='off'
        id={name}
        maxLength={50}
        className={classNames('border border-gray-300 rounded-lg p-3', {
          'border-2 border-red-500': hasError,
        })}
        type="text"
        {...register(name, {
          required,
          pattern,
          onChange: (e) => {
            onChange?.(e.target.value);
          },
          validate,
        })}
      />
    </FormControl>
  )
};

export default InputFormControlComponent;

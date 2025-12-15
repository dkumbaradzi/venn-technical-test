import { useFormContext } from 'react-hook-form';
import classNames from 'classnames';
import { ErrorMessage } from '@hookform/error-message';
import { type ReactNode } from 'react';

type Props = {
  name: string;
  className?: string;
  label: string;
  children: ReactNode;
};

export const FormControlComponent = ({ name, className, label, children }: Props) => {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div
      className={classNames('flex flex-col gap-2 w-full text-left', className)}
    >
      <label htmlFor={name} className="text-left font-semibold">
        {label}
      </label>
      {children}
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => (
          <p className="text-red-500 text-sm font-semibold">{message}</p>
        )}
      />
    </div>
  );
};

export default FormControlComponent;
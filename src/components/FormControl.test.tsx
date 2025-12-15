import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { FormControlComponent } from './FormControl';

const FormWrapper = ({
  children,
  defaultValues = {},
  mode = 'onBlur' as const
}: {
  children: (methods: ReturnType<typeof useForm>) => React.ReactNode;
  defaultValues?: Record<string, string>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
}) => {
  const methods = useForm({ defaultValues, mode });
  return <FormProvider {...methods}>{children(methods)}</FormProvider>;
};

describe('FormControlComponent', () => {
  it('should render label correctly', () => {
    render(
      <FormWrapper defaultValues={{ testField: '' }}>
        {({ register }) => (
          <FormControlComponent name="testField" label="Test Label">
            <input {...register('testField')} id="testField" />
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    render(
      <FormWrapper defaultValues={{ testField: '' }}>
        {({ register }) => (
          <FormControlComponent name="testField" label="Test Label">
            <input
              {...register('testField')}
              id="testField"
              data-testid="test-input"
              placeholder="Test Input"
            />
          </FormControlComponent>
        )}
      </FormWrapper>
    );
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument();
  });

  it('should display error message when validation fails', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ testField: '' }}>
        {({ register }) => (
          <FormControlComponent name="testField" label="Test Label">
            <input
              {...register('testField', {
                required: 'This field is required'
              })}
              id="testField"
            />
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Label');

    // Focus and blur without entering value to trigger validation
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('should display error message with red styling', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ testField: '' }}>
        {({ register }) => (
          <FormControlComponent name="testField" label="Test Label">
            <input
              {...register('testField', {
                required: 'Error message'
              })}
              id="testField"
            />
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Label');

    // Trigger validation
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      const errorElement = screen.getByText('Error message');
      expect(errorElement).toHaveClass('text-red-500');
    });

    await waitFor(() => {
      const errorElement = screen.getByText('Error message');
      expect(errorElement).toHaveClass('text-sm');
    });

    await waitFor(() => {
      const errorElement = screen.getByText('Error message');
      expect(errorElement).toHaveClass('font-semibold');
    });
  });

  it('should not display error message when no error exists', () => {
    render(
      <FormWrapper defaultValues={{ testField: '' }}>
        {({ register }) => (
          <FormControlComponent name="testField" label="Test Label">
            <input {...register('testField')} id="testField" />
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    const errorElement = screen.queryByRole('paragraph');
    expect(errorElement).not.toBeInTheDocument();
  });

  it('should apply custom className to wrapper', () => {
    const { container } = render(
      <FormWrapper defaultValues={{ testField: '' }}>
        {({ register }) => (
          <FormControlComponent
            name="testField"
            label="Test Label"
            className="custom-class"
          >
            <input {...register('testField')} id="testField" />
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
  });

  it('should render label with correct htmlFor attribute', () => {
    render(
      <FormWrapper defaultValues={{ myField: '' }}>
        {({ register }) => (
          <FormControlComponent name="myField" label="My Field">
            <input {...register('myField')} id="myField" />
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    const label = screen.getByText('My Field');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'myField');
  });

  it('should render multiple children correctly', () => {
    render(
      <FormWrapper defaultValues={{ testField: '' }}>
        {({ register }) => (
          <FormControlComponent name="testField" label="Test Label">
            <input {...register('testField')} id="testField" data-testid="input-1" />
            <input data-testid="input-2" />
            <span data-testid="helper-text">Helper text</span>
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    expect(screen.getByTestId('input-1')).toBeInTheDocument();
    expect(screen.getByTestId('input-2')).toBeInTheDocument();
    expect(screen.getByTestId('helper-text')).toBeInTheDocument();
  });

  it('should display different error messages for different errors', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper
        defaultValues={{ field1: '', field2: '' }}
      >
        {({ register }) => (
          <>
            <FormControlComponent name="field1" label="Field 1">
              <input
                {...register('field1', {
                  required: 'Error for field 1'
                })}
                id="field1"
              />
            </FormControlComponent>
            <FormControlComponent name="field2" label="Field 2">
              <input
                {...register('field2', {
                  required: 'Error for field 2'
                })}
                id="field2"
              />
            </FormControlComponent>
          </>
        )}
      </FormWrapper>
    );

    const input1 = screen.getByLabelText('Field 1');
    const input2 = screen.getByLabelText('Field 2');

    // Trigger validation on both fields
    await user.click(input1);
    await user.tab();
    await user.click(input2);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Error for field 1')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Error for field 2')).toBeInTheDocument();
    });
  });

  it('should clear error when valid input is provided', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper
        defaultValues={{ testField: '' }}
        mode="all"
      >
        {({ register }) => (
          <FormControlComponent name="testField" label="Test Label">
            <input
              {...register('testField', {
                required: 'This field is required'
              })}
              id="testField"
            />
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Label');

    // Trigger validation error by focusing and blurring
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    // Fix the error by typing
    await user.click(input);
    await user.type(input, 'Valid input');

    await waitFor(() => {
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });
  });

  it('should display validation error for invalid input pattern', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ email: '' }}>
        {({ register }) => (
          <FormControlComponent name="email" label="Email">
            <input
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              id="email"
            />
          </FormControlComponent>
        )}
      </FormWrapper>
    );

    const input = screen.getByLabelText('Email');

    // Enter invalid email
    await user.type(input, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { InputFormControlComponent } from './InputFormControl';

const FormWrapper = ({
  children,
  defaultValues = {},
  mode = 'onBlur' as const
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, string>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
}) => {
  const methods = useForm({ defaultValues, mode });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('InputFormControlComponent', () => {
  it('should render input with label', () => {
    render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent name="testInput" label="Test Input" />
      </FormWrapper>
    );

    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    expect(screen.getByText('Test Input')).toBeInTheDocument();
  });

  it('should have correct input attributes', () => {
    render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent name="testInput" label="Test Input" />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Input');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('id', 'testInput');
    expect(input).toHaveAttribute('name', 'testInput');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('maxLength', '50');
  });

  it('should apply custom className to FormControl wrapper', () => {
    const { container } = render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent
          name="testInput"
          label="Test Input"
          className="custom-class"
        />
      </FormWrapper>
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('should display required validation error', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent
          name="testInput"
          label="Test Input"
          required="This field is required"
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Input');

    // Trigger validation by focusing and blurring
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('should show red border when there is an error', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent
          name="testInput"
          label="Test Input"
          required="Required field"
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Input');

    // Initially no error border
    expect(input).not.toHaveClass('border-red-500');

    // Trigger validation error
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(input).toHaveClass('border-2');
      expect(input).toHaveClass('border-red-500');
    });
  });

  it('should not show red border when no error exists', () => {
    render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent name="testInput" label="Test Input" />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Input');
    expect(input).not.toHaveClass('border-red-500');
    expect(input).toHaveClass('border-gray-300');
  });

  it('should validate with pattern', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ email: '' }}>
        <InputFormControlComponent
          name="email"
          label="Email"
          pattern={{
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email format',
          }}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Email');

    // Enter invalid email
    await user.type(input, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(input).toHaveClass('border-red-500');
    });
  });

  it('should call onChange callback when value changes', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();

    render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent
          name="testInput"
          label="Test Input"
          onChange={onChangeMock}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Input');

    await user.type(input, 'test');

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalled();
      expect(onChangeMock).toHaveBeenCalledWith('t');
    });
  });

  it('should use custom validate function', async () => {
    const user = userEvent.setup();
    const validateMock = vi.fn((value: string) => {
      if (value.length < 3) {
        return 'Must be at least 3 characters';
      }
      return true;
    });

    render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent
          name="testInput"
          label="Test Input"
          validate={validateMock}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Input');

    // Enter short text
    await user.type(input, 'ab');
    await user.tab();

    await waitFor(() => {
      expect(validateMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(input).toHaveClass('border-red-500');
    });
  });

  it('should clear error when valid input is provided', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ testInput: '' }} mode="all">
        <InputFormControlComponent
          name="testInput"
          label="Test Input"
          required="This field is required"
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Input');

    // Trigger error
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(input).toHaveClass('border-red-500');
    });

    // Fix error
    await user.click(input);
    await user.type(input, 'Valid input');

    await waitFor(() => {
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(input).not.toHaveClass('border-red-500');
    });
  });

  it('should accept valid pattern input', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ email: '' }}>
        <InputFormControlComponent
          name="email"
          label="Email"
          pattern={{
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email format',
          }}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Email');

    // Enter valid email
    await user.type(input, 'test@example.com');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      expect(input).not.toHaveClass('border-red-500');
    });
  });

  it('should respect maxLength attribute', () => {
    render(
      <FormWrapper defaultValues={{ testInput: '' }}>
        <InputFormControlComponent name="testInput" label="Test Input" />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Test Input') as HTMLInputElement;
    expect(input.maxLength).toBe(50);
  });

  it('should handle async validate function', async () => {
    const user = userEvent.setup();
    const asyncValidate = vi.fn(async (value: string) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (value === 'taken') {
        return 'This value is already taken';
      }
      return true;
    });

    render(
      <FormWrapper defaultValues={{ username: '' }}>
        <InputFormControlComponent
          name="username"
          label="Username"
          validate={asyncValidate}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Username');

    await user.type(input, 'taken');
    await user.tab();

    await waitFor(() => {
      expect(asyncValidate).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('This value is already taken')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(input).toHaveClass('border-red-500');
    });
  });
});

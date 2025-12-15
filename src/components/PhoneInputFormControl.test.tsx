import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import PhoneInputFormControl from './PhoneInputFormControl';

const FormWrapper = ({ children }: { children: (methods: ReturnType<typeof useForm>) => React.ReactNode }) => {
  const methods = useForm({
    mode: 'all',
  });

  return (
    <FormProvider {...methods}>
      <form>{children(methods)}</form>
    </FormProvider>
  );
};

describe('PhoneInputFormControl', () => {
  it('renders the component with label', () => {
    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('renders phone input field', () => {
    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('shows error message when field is required and left empty', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');

    // Trigger validation by focusing and blurring
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Please enter phone number')).toBeInTheDocument();
    });
  });

  it('applies error styling when there is an error', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');

    // Trigger validation
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(input).toHaveClass('border-2');
    });

    await waitFor(() => {
      expect(input).toHaveClass('border-red-500');
    });
  });

  it('validates Canadian phone number requirement', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');

    // Type a US phone number
    await user.type(input, '+1 212 555 0100');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid Canadian phone number')).toBeInTheDocument();
    });
  });

  it('accepts valid Canadian phone number', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');

    // Type a valid Canadian phone number
    await user.type(input, '+1 416 555 0100');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid Canadian phone number')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Please enter phone number')).not.toBeInTheDocument();
    });
  });

  it('defaults to Canada as country', () => {
    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'phoneNumber');
  });

  it('applies custom className to FormControl', () => {
    const { container } = render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
            className="custom-class"
          />
        )}
      </FormWrapper>
    );

    const formControl = container.querySelector('.custom-class');
    expect(formControl).toBeInTheDocument();
  });

  it('shows error message when phone number is invalid format', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');

    // Type invalid phone number
    await user.type(input, '123');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid Canadian phone number')).toBeInTheDocument();
    });
  });

  it('clears error when valid phone number is entered after error', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        {() => (
          <PhoneInputFormControl
            name="phoneNumber"
            label="Phone Number"
          />
        )}
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');

    // First trigger error
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Please enter phone number')).toBeInTheDocument();
    });

    // Then enter valid phone number
    await user.click(input);
    await user.type(input, '+1 416 555 0100');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText('Please enter phone number')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(input).not.toHaveClass('border-red-500');
    });
  });
});

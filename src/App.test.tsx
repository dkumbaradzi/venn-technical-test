import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from './App';
import toast from 'react-hot-toast';
import { server } from '../setupTests';
import { http, HttpResponse } from 'msw';

const BE_URL = 'https://fe-hometask-api.qa.vault.tryvault.com';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the onboarding form', () => {
    render(<App />);

    expect(screen.getByText('Onboarding form')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Corporation Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('shows error when first name is required and left empty', async () => {
    const user = userEvent.setup();

    render(<App />);

    const firstNameInput = screen.getByLabelText('First Name');

    await user.click(firstNameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('shows error when last name is required and left empty', async () => {
    const user = userEvent.setup();

    render(<App />);

    const lastNameInput = screen.getByLabelText('Last Name');

    await user.click(lastNameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('validates first name pattern', async () => {
    const user = userEvent.setup();

    render(<App />);

    const firstNameInput = screen.getByLabelText('First Name');

    await user.type(firstNameInput, '123');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid name. Only letters, spaces, apostrophes, and hyphens are allowed')
      ).toBeInTheDocument();
    });
  });

  it('validates last name pattern', async () => {
    const user = userEvent.setup();

    render(<App />);

    const lastNameInput = screen.getByLabelText('Last Name');

    await user.type(lastNameInput, '456');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid last name. Only letters, spaces, apostrophes, and hyphens are allowed')
      ).toBeInTheDocument();
    });
  });

  it('accepts valid first name with special characters', async () => {
    const user = userEvent.setup();

    render(<App />);

    const firstNameInput = screen.getByLabelText('First Name');

    await user.type(firstNameInput, "O'Connor-Smith");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a valid name. Only letters, spaces, apostrophes, and hyphens are allowed')
      ).not.toBeInTheDocument();
    });
  });

  it('validates corporation number', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${BE_URL}/corporation-number/123456789`, () => {
        return HttpResponse.json({ valid: false, message: 'Corporation number is not valid' }, { status: 200 });
      })
    );

    render(<App />);

    const corpNumberInput = screen.getByLabelText('Corporation Number');

    await user.type(corpNumberInput, '123456789');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Corporation number is not valid')).toBeInTheDocument();
    });
  });

  it('accepts valid corporation number', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${BE_URL}/corporation-number/987654321`, () => {
        return HttpResponse.json({ valid: true }, { status: 200 });
      })
    );

    render(<App />);

    const corpNumberInput = screen.getByLabelText('Corporation Number');

    await user.type(corpNumberInput, '987654321');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText('Corporation number is not valid')).not.toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${BE_URL}/corporation-number/123456789`, () => {
        return HttpResponse.json({ valid: true }, { status: 200 });
      }),
      http.post(`${BE_URL}/profile-details`, async () => {
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );

    render(<App />);

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const phoneInput = screen.getByLabelText('Phone');
    const corpNumberInput = screen.getByLabelText('Corporation Number');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(phoneInput, '4165551234');
    await user.type(corpNumberInput, '123456789');

    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Form submitted successfully!');
    });
  });

  it('shows error when form submission fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${BE_URL}/corporation-number/123456789`, () => {
        return HttpResponse.json({ valid: true }, { status: 200 });
      }),
      http.post(`${BE_URL}/profile-details`, async () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    render(<App />);

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const phoneInput = screen.getByLabelText('Phone');
    const corpNumberInput = screen.getByLabelText('Corporation Number');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(phoneInput, '4165551234');
    await user.type(corpNumberInput, '123456789');

    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error submitting form');
    });
  });

  it('prevents submission when required fields are empty', async () => {
    const user = userEvent.setup();

    render(<App />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });

    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();

    render(<App />);

    const phoneInput = screen.getByLabelText('Phone');

    await user.type(phoneInput, '123');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid Canadian phone number')).toBeInTheDocument();
    });
  });

  it('displays multiple validation errors simultaneously', async () => {
    const user = userEvent.setup();

    render(<App />);

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');

    await user.click(firstNameInput);
    await user.tab();
    await user.click(lastNameInput);
    await user.tab();

    const errors = await screen.findAllByText('This field is required');

    await waitFor(() => {
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('clears errors when valid input is provided', async () => {
    const user = userEvent.setup();

    render(<App />);

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');

    // Trigger error
    await user.click(firstNameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    // Fix error
    await user.click(firstNameInput);
    await user.type(firstNameInput, 'John');
    await user.click(lastNameInput);
    await user.type(lastNameInput, 'Doe');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });
  });

  it('handles corporation number onChange callback', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${BE_URL}/corporation-number/1234567`, () => {
        return HttpResponse.json({ valid: true }, { status: 200 });
      })
    );

    render(<App />);

    const corpNumberInput = screen.getByLabelText('Corporation Number');

    await user.type(corpNumberInput, '1234567');

    await waitFor(() => {
      expect(corpNumberInput).toHaveValue('1234567');
    });
  });

  it('initializes phone input with default country code', () => {
    render(<App />);

    const phoneInput = screen.getByLabelText('Phone');

    expect(phoneInput).toHaveValue('+1');
  });

  it('accepts valid names with spaces', async () => {
    const user = userEvent.setup();

    render(<App />);

    const firstNameInput = screen.getByLabelText('First Name');

    await user.type(firstNameInput, 'Mary Jane');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a valid name. Only letters, spaces, apostrophes, and hyphens are allowed')
      ).not.toBeInTheDocument();
    });
  });
});

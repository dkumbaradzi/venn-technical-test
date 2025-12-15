// Static Helpers

export type ProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  corporationNumber: string;
};

const verifyCorporationNumber = async (
  corporationNumberValue: string
): Promise<{
  valid: boolean;
  message?: string;
  corporationNumber?: string;
}> => {
  try {
    const response = await fetch(
      `https://fe-hometask-api.qa.vault.tryvault.com/corporation-number/${corporationNumberValue}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validating corporation number:', error);
    return {
      valid: false,
      message: 'An error occurred while validating the corporation number.',
    };
  }
};

export const submitForm = async (data: ProfileData) => {
  try {
    const response = await fetch(
      'https://fe-hometask-api.qa.vault.tryvault.com/profile-details',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    return {
      success: response.ok,
    };
  } catch {
    return {
      success: false,
    };
  }
}

export const validateCorporationNumber = async (value: string | undefined) => {
  if (!value) return 'Corporation number is required';
  const response = await verifyCorporationNumber(value);
  return response.valid || response.message || 'Invalid corporation number';
}
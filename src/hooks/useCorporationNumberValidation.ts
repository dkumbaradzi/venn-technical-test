import debounce from 'lodash/debounce';
import { useFormContext } from 'react-hook-form';

type Props = {
  name: string;
}

export const useCorporationNumberValidation = ({ name }: Props) => {
  const { setError, clearErrors } = useFormContext();
  const validateCorporationNumber = async (
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

      console.log('data', data);
      return data;
    } catch (error) {
      console.error('Error validating corporation number:', error);
      return {
        valid: false,
        message: 'An error occurred while validating the corporation number.',
      };
    }
  };

  const onCorporationNumberChange = debounce(async (value: string | undefined) => {
    console.log('Debounced validation for corporation number:', value);
    if (!value) return;

    const validationResponse = await validateCorporationNumber(value);

    if (!validationResponse.valid) {
      setError(name, {
        type: 'validation',
        message: validationResponse.message || 'Invalid corporation number',
      });
    } else {
      clearErrors(name);
    }
  }, 200);

  return {
    validate: async (value: string | undefined) => {
      console.log('Validating corporation number:', value);
      if (!value) return 'Corporation number is required';
      const response = await validateCorporationNumber(value);
      return response.valid || response.message || 'Invalid corporation number';
    },
    onCorporationNumberChange,
  };
};

export default useCorporationNumberValidation;
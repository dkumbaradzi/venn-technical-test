import { useCallback, useState } from 'react';
import { validateCorporationNumber } from '../helpers';

export const useCorporationNumberValidation = () => {
  const [isValid, setIsValid] = useState<boolean | null>(false);

  const onCorporationNumberChange = useCallback(() => {
    setIsValid(false);
  }, [])

  const validate = useCallback(async (value: string | undefined) => {
    // prevents the same API call from firing if the previous valid value was not changed
    if (isValid) {
      return true;
    }
    if (!value) return 'Corporation number is required';

    if (value.length < 9) return 'Invalid corporation number';

    const validationResult = await validateCorporationNumber(value);

    if (validationResult === true) {
      setIsValid(true);
    }

    return validationResult;

  }, [isValid]);

  return {
    validate,
    isValid,
    onCorporationNumberChange,
  };
};

export default useCorporationNumberValidation;
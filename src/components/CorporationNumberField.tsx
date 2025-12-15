import Input from './InputFormControl';
import useCorporationNumberValidation from '../hooks/useCorporationNumberValidation';
export const CorporationNumberFieldComponent = () => {
  const { validate, onCorporationNumberChange } = useCorporationNumberValidation({
    name: 'corporationNumber',
  });

  console.log('Rendering CorporationNumberFieldComponent');
  return (
    <Input
      className="px-4"
      name="corporationNumber"
      label="Corporation Number"
      validate={validate}
      onChange={onCorporationNumberChange}
    />
  )
}

export default CorporationNumberFieldComponent;
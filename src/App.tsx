
import './App.css'
import { useForm, FormProvider } from 'react-hook-form';
import Input from './components/InputFormControl';
import PhoneInput from './components/PhoneInputFormControl';
import CorporationNumberField from './components/CorporationNumberField';

const NAME_VALIDATION_REGEX = /^[a-zA-Z]+([ '-]?[a-zA-Z]+)*$/;

type FormData = {
  name: string;
  lastName: string;
  phone: string;
  corporationNumber: string;
};

function App() {
  const { setError, clearErrors, ...formMethods } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      lastName: '',
      phone: '+1',
      corporationNumber: '',
    },
  });

  const submitForm = async (data: FormData) => {
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
    } catch (error) {
      console.error('Error submitting form:', error);
      return {
        success: false,
      };
    }
  };

  return (
    <FormProvider
      {...formMethods}
      setError={setError}
      clearErrors={clearErrors}
    >
      <div className="w-full h-full flex justify-center items-center flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 bg-white w-[600px] h-[500px] rounded-xl border border-solid border-gray-300">
          <h2 className="font-bold text-2xl pt-4">Onboarding form</h2>
          <div className="flex flex-col gap-4 px-4">
            <div className="flex justify-between px-4 gap-4">
              <Input
                name="firstName"
                label="First Name"
                required="This field is required"
                pattern={{
                  value: NAME_VALIDATION_REGEX,
                  message:
                    'Please enter a valid name. Only letters, spaces, apostrophes, and hyphens are allowed',
                }}
              />
              <Input
                name="lastName"
                label="Last Name"
                required="This field is required"
                pattern={{
                  value: NAME_VALIDATION_REGEX,
                  message:
                    'Please enter a valid last name. Only letters, spaces, apostrophes, and hyphens are allowed',
                }}
              />
            </div>
            <PhoneInput
              className="px-4"
              name="phone"
              label="Phone"
              country="CA"
              international
              withCountryCallingCode
              useNationalFormatForDefaultCountryValue
            />
            <CorporationNumberField />
          </div>
          <button
            type="button"
            className="bg-black hover:bg-gray-700 transition-colors duration-200 ease-in-out text-white rounded-lg mx-8 mb-6 py-2"
            onClick={() => {
              formMethods.handleSubmit((data) => {
                submitForm(data)
                  .then((response) => {
                    if (response.success) {
                      // toast.success('Form submitted successfully!');
                    } else {
                      // toast.error('Error submitting form');
                    }
                  })
                  .catch(() => {
                    // toast.error('Error submitting form');
                  });
              })();
            }}
          >
            Submit
          </button>
        </div>
        {/* <Toaster /> */}
      </div>
    </FormProvider>
  );
}

export default App

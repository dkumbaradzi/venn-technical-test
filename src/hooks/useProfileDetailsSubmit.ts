import toast from 'react-hot-toast';
import { submitForm, type ProfileData } from '../helpers';

export const useProfileDetailsSubmit = () => {
  const onSubmit = async (data: ProfileData) => {
    return submitForm(data).then((response) => {
      if (response.success) {
        toast.success('Form submitted successfully!');
      } else {
        toast.error('Error submitting form');
      }
    })
      .catch(() => {
        toast.error('Error submitting form');
      });;
  }

  return { onSubmit };
}

export default useProfileDetailsSubmit;
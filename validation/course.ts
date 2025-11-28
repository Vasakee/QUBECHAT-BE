import Validator from 'validator';
import isEmpty from './is-empty';

export default function validateCourseInput(data: any) {
  const errors: Record<string, string> = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.description = !isEmpty(data.description) ? data.description : '';


  if (!Validator.isLength(data.title, {min: 3, max: 30})){
    errors.title = 'Course Name must not be less than 3 Characters';
  }


  if(Validator.isEmpty(data.title)) {
    errors.title = 'Course Name is required';
  }

  if(!data.files || data.files.length < 1){
    errors.files = 'At least one file is required'
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}

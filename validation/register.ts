import Validator from 'validator';
import isEmpty from './is-empty';

export default function validateRegisterInput(data: any) {
  const errors: Record<string, string> = {};

  data.email = !isEmpty(data.email) ? data.email : '';
  data.username = !isEmpty(data.username) ? data.username : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : '';

  if (!Validator.equals(data.password, data.confirm_password)){
    errors.confirm_password = 'Passwords do not match';
  }

  if (!Validator.isLength(data.password, {min: 4, max: 30})){
    errors.password = 'Password must not be less than 4 Characters';
  }

  if (!Validator.isLength(data.username, {min: 4, max: 30})){
    errors.username = 'Username must not be less than 4 Characters';
  }

  if (!Validator.isEmail(data.email)){
    errors.email = 'Invalid Email';
  }

  if(Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  }

  if(Validator.isEmpty(data.username)) {
    errors.username = 'Username field is required';
  }

  if(Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  if(Validator.isEmpty(data.confirm_password)) {
    errors.confirm_password = 'Confirm Password field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}

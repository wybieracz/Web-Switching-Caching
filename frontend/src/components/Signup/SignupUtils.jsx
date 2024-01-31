import { post } from "../../utils/fetch";

export async function handleSignUp(setValidation, setSent, data, navigate, notification) {
  setValidation(true);
  if(data.name !== '' && data.surname !== '' && checkEmail(data.email) && checkPassword(data.password)) {
    setSent(true);
    await post('/user', data).then(res => {
      if(res.ok) {
        navigate('/');
        notification.make('success', 'Register', 'You have been successfully registered.');
      } else {
        console.error(`${res.status} ${res.statusText}`);
        notification.make('danger', 'Register', res.body.detail || 'Something went wrong.');
      }
    }).catch(err => {
      console.error(err);
      notification.make('danger', 'Register', 'Something went wrong.');
    })
    setSent(false);
  }
}

export function checkEmail(email) {
  const emailRegExp = RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  return emailRegExp.test(email)
}
  
export function checkPassword(password) {
  const emailRegExp = RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/);
  return emailRegExp.test(password);
}

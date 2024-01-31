import { get, put } from '../../utils/fetch';
import { deleteCookie } from '../../utils/cookie';
import { defaultUser } from '../../consts/defaultUser';

export async function handleSaveUser(user, setSent, setUser, sessionExpired, notification) {
  setSent(true);
  
  const res = await put('/user', { 
    email: user.email,
    name: user.name,
    surname: user.surname
  });

  if(res.ok) {
    setUser({ ...res.body, loaded: true });
    setSent(false);
    notification.make('success', 'User saved', 'You have successfully saved your settings.');
  }
  else {
    if(res.code === 403) sessionExpired(notification)
    setSent(false);
    notification.make('danger', 'User error', 'Could not save user settings.');
  }
}

export function checkInitYear(year) {
  return year &&
  !isNaN(parseInt(year)) &&
  (parseInt(year) < 1900 ||
  parseInt(year) > new Date().getFullYear())
}

export function compareChanges(user, newUser) {
  return (
    user.name === newUser.name &&
    user.surname === newUser.surname &&
    user.email === newUser.email
  )
}

export function handleLogout(setUser, navigate) {
  deleteCookie('token');
  setUser(defaultUser);
  navigate('/?logout=true')
}

export async function checkCached(id, notification) {
  get(`/user/${id}`).then(res => {
    if(res.ok) {
      notification.make('secondary', 'User cached', `${res.body.name} ${res.body.surname} - ${res.body.email}\t`);
    } else {
      notification.make('danger', 'User cached', 'Could not get user cached data.');
    }
  })
}
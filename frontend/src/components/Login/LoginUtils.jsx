import sha256 from 'crypto-js/sha256';
import { patch, post } from '../../utils/fetch';

export async function handleLogin(setSent, data, setError, setUser, navigate, notification) {

  setSent(true)
  
  let nonce = '';
  const pre = await patch('/nonce', { email: data.email })

  if(pre.ok) {
    nonce = pre.body.nonce;
  } else {
    if(pre.code === 404) setError({ email: true, password: false });
    notification.make('danger', 'Couldn\'t login', pre.body.detail || 'Error during fetching nonce.' );
    setSent(false);
    return;
  }

  const passwordHash = sha256(data.password).toString();
  const hash = sha256(passwordHash + nonce).toString();

  post('/login', { email: data.email, password: hash }).then(res => {
    if(res.ok) {
      setUser({ ...res.body, loaded: true });
      setSent(false);
      navigate('/profile')
    } else {
      switch(res.code) {
        case 401: setError({ email: false, password: true }); setSent(false); break;
        case 404: setError({ email: true, password: false }); setSent(false); break;
        default: console.error(`${res.status} ${res.statusText}`); setSent(false); break;
      }
      notification.make('danger', 'Couldn\'t login', res.body.detail || 'Something went wrong.');
    }
  })
}
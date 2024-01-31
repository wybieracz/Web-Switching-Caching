import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from '@nextui-org/react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import '../../App.css';
import { defaultLoginData } from './LoginConsts';
import { handleLogin } from './LoginUtils';
import { useNotification } from '../../hooks/useNotification';

export default function Login({ setUser }) {

  const navigate = useNavigate();
  const notification = useNotification();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(defaultLoginData);
  const [error, setError] = useState({ email: false, password: false });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if(searchParams.get('expired')) {
      notification.make('warning', 'Session expired', 'Please log in.');
    }
    if(searchParams.get('logout')) {
      notification.make('success', 'Logout', 'You have successfully logout.');
    }
  }, [searchParams]) //eslint-disable-line

  return (
    <div className='page'>
      <Card className='w-full max-w-xl min-w-0 h-fit'>
        <CardHeader className='flex gap-5'>
          <div className='flex flex-col'>
            <p className='text-xl font-medium'>Login</p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody className='flex gap-3'>
          <Input
            type='email'
            size='sm'
            label='Email'
            value={data.email}
            isInvalid={error.email}
            errorMessage={error.email ? 'This user does not exist.' : ''}
            onChange={e => {
              setData(prev => { return { ...prev, email: e.target.value }})
              if(error.email) setError({ email: false, password: false })
            }}
          />
          <Input
            type='password'
            size='sm'
            label='Password'
            value={data.password}
            isInvalid={error.password}
            errorMessage={error.password ? 'Invalid password.' : null}
            onChange={e => {
              setData(prev => { return { ...prev, password: e.target.value }})
              if(error.password) setError({ email: false, password: false })
            }}
          />
        </CardBody>
        <Divider/>
        <CardFooter className='justify-around'>
          <Button
            className='flex'
            variant='light'
            color='primary'
            onPress={() => navigate('/register')}
          >
            Sign Up
          </Button>
          <Button
            className='flex'
            variant='solid'
            color='primary'
            isDisabled={!data.email || !data.password}
            onPress={() => handleLogin(setSent, data, setError, setUser, navigate, notification)}
            isLoading={sent}
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
import { useMemo, useState } from 'react';
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from '@nextui-org/react';

import '../../App.css';
import { checkEmail } from '../Signup/SignupUtils';
import { useNotification } from '../../hooks/useNotification';
import { compareChanges, handleSaveUser, handleLogout, checkCached } from './ProfileUtils';
import { useNavigate } from 'react-router';

export default function Profile ({ user, setUser, sessionExpired }) {

  const navigate = useNavigate();
  const notification = useNotification();
  const [newUser, setNewUser] = useState(user);
  const [sent, setSent] = useState(false);

  const error = useMemo(() => {
    return {
      name: newUser.name === '',
      surname: newUser.surname === '',
      email: !checkEmail(newUser.email),
    };
  }, [newUser]);

  return (
    <div className='page'>
      <Card className='w-full max-w-xl min-w-0 h-fit'>
        <CardHeader className='flex flex-col gap-5 justify-center'>
          <Avatar
            className='sm:w-28 w-20 sm:h-28 h-20 sm:text-5xl text-2xl mt-2'
            fallback={`${newUser.name[0] || ''}${newUser.surname[0] || ''}`}
            color='secondary'
          />
          <div className='text-center'>
            <h1 className='text-xl'>{`${newUser.title || ''} ${newUser.name || ''} ${newUser.surname || ''}`}</h1>
            <p className='text-sm text-zinc-400'>{newUser.email}</p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody className='flex gap-3'>
          <Input
            type='text'
            size='sm'
            label='Name'
            isInvalid={error.name}
            value={newUser.name}
            onChange={e => setNewUser(prev => { return { ...prev, name: e.target.value }})}
          />
          <Input
            type='text'
            size='sm'
            label='Surname'
            isInvalid={error.surname}
            value={newUser.surname}
            onChange={e => setNewUser(prev => { return { ...prev, surname: e.target.value }})}
          />
          <Input
            type='email'
            size='sm'
            label='Email'
            isInvalid={error.email}
            value={newUser.email}
            onChange={e => setNewUser(prev => { return { ...prev, email: e.target.value }})}
          />
        </CardBody>
        <Divider/>
        <CardFooter className='justify-between'>
          <Button
            className='flex'
            variant='light'
            color='danger'
            onPress={() => handleLogout(setUser, navigate)}
          >
            Logout
          </Button>
          <Button
            className='flex'
            variant='light'
            color='secondary'
            onPress={() => checkCached(user.id, notification)}
          >
            Cached
          </Button>
          <Button
            className='flex'
            variant='light'
            color='primary'
            isDisabled={compareChanges(user, newUser)}
            onPress={() => setNewUser({ ...user })}
          >
            Discard
          </Button>
          <Button
            className='flex'
            variant='solid'
            color='primary'
            isDisabled={compareChanges(user, newUser) || (error.name || error.surname || error.email)}
            onPress={() => handleSaveUser(newUser, setSent, setUser, sessionExpired, notification)}
            isLoading={sent}
          >
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
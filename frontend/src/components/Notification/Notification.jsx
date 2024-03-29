import { Chip } from '@nextui-org/chip'
import { useContext, useEffect, useRef, useState } from 'react';
import { IconX } from '@tabler/icons-react';

import './Notification.css'

import { getIcon } from './NotificationUtils';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function Notification ({ type, id, title, text, setHeight, closing, top }) {

  const notification = useContext(NotificationContext);
  const ref = useRef();
  const [isGone, setGone] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        setGone(false)
      })
    }, 100);
  }, [])


  useEffect(() => {
    setHeight(id, ref.current.offsetHeight / 2 + 5)
    setTimeout(() => {
      notification.clear(id)
    }, 10000)
  }, []) //eslint-disable-line

  return (
    <div
      className='notification'
      style={{ '--y': top + 'px', '--gone': isGone || closing ? 1 : 0 }}
    >
      <Chip
        ref={ref}
        color={type}
        radius='md'
        variant='shadow'
        startContent={getIcon(type)}
        endContent={<IconX size={15} className='cursor-pointer' onClick={() => notification.clear(id)} />}
        className='w-96 p-2 mb-2 h-auto notification'
      >
        <h2 className='font-bold'>{title}</h2>
        <p className='whitespace-normal text-xs'>{text}</p>
      </Chip>
    </div>
  )
}

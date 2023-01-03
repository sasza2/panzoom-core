import { expect, it,  } from 'vitest';

import { createComponentQueue, render, useEffect, useState } from './effects';

it('effect - useEffect, mount, unmount', () => {
  let mountCounter = 0
  let unMountCounter = 0
  const props = { count: 1 }
  const initializeComponent = createComponentQueue()
  const component = initializeComponent(() => {
    useEffect(() => {
      mountCounter++
      return () => {
        unMountCounter++
      }
    }, [props.count])
  })

  render([component])
  expect(mountCounter).toBe(1)
  expect(unMountCounter).toBe(0)
  props.count++
  render([component])
  expect(mountCounter).toBe(2)
  expect(unMountCounter).toBe(1)
});

it ('effects - useState', () => {
  const initialValue = 'abc'
  const nextValue = 'def'

  let mountCounter = 0

  const initializeComponent = createComponentQueue()
  const component = initializeComponent(() => {
    const [value, setValue] = useState<string>(initialValue)
    useEffect(() => {
      setValue(nextValue)
    }, [])

    useEffect(() => {
      if (value === initialValue) return

      expect(value).toBe(nextValue)
      mountCounter++
    }, [value])
  })

  render([component])
  setTimeout(() => {
    expect(mountCounter).toBe(1)
  }, 0)
})
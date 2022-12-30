import { expect, it,  } from 'vitest';

import { initializeComponent, useEffect, useState } from './effects';

it('effect - useEffect, mount, unmount', () => {
  let mountCounter = 0
  let unMountCounter = 0
  const props = { count: 1 }
  const render = initializeComponent(() => {
    useEffect(() => {
      mountCounter++
      return () => {
        unMountCounter++
      }
    }, [props.count])
  })

  render()
  expect(mountCounter).toBe(1)
  expect(unMountCounter).toBe(0)
  props.count++
  render()
  expect(mountCounter).toBe(2)
  expect(unMountCounter).toBe(1)
});

it ('effects - useState', () => {
  const initialValue = 'abc'
  const nextValue = 'def'

  let mountCounter = 0

  const render = initializeComponent(() => {
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

  render()
  expect(mountCounter).toBe(0)
  render()
  expect(mountCounter).toBe(1)
})
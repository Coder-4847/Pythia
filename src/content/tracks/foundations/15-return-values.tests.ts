import { call, check } from '@/content/helpers'

export default {
  e1: [
    call('add', [2, 3], 5),
    call('add', [-4, 4], 0, { hidden: true }),
    call('add', [0.5, 0.25], 0.75, { hidden: true }),
    check('returns instead of printing', String.raw`assert "return" in src, "Use return to hand the sum back."`, { hidden: true }),
  ],
  e2: [
    call('is_even', [4], true),
    call('is_even', [7], false),
    call('is_even', [0], true, { hidden: true }),
    call('is_even', [-3], false, { hidden: true }),
  ],
  e3: [
    call('average', [1, 2, 3], 2),
    call('average', [10, 20, 60], 30),
    call('average', [0, 0, 1], 1 / 3, { hidden: true }),
  ],
  e4: [
    call('double', [4], 8),
    call('double', [-1], -2, { hidden: true }),
    check('no longer prints', String.raw`assert "print" not in src, "The function should return the value, not print it."`, { hidden: true }),
  ],
  e5: [
    call('full_name', ['Ada', 'Lovelace'], 'Lovelace, Ada'),
    call('full_name', ['Grace', 'Hopper'], 'Hopper, Grace', { hidden: true }),
  ],
}

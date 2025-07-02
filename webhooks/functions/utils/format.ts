import type {Birthday} from '../types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const SUFFIXES = ['st', 'nd', 'rd', 'th']

export const formatBirthday = (birthday: Birthday) => {
  const suffix = SUFFIXES[(birthday.day - 1) % 10] || 'th'
  return `${birthday.day}${suffix} ${MONTHS[birthday.month - 1]}`
}

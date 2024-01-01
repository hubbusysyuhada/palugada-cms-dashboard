import dayjs, { UnitType } from "dayjs"

export default function (date: dayjs.Dayjs) {
  if (date.get('h') >= 17) date = date.add(1, 'days')
  const units: UnitType[] = ['hour', 'minute', 'second']
  units.forEach(f => { date = date.set(f, 0) })
  return date
}
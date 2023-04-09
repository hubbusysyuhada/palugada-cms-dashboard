export default function (data: Record<string, string>) {
  for (const key in data) localStorage.setItem(key, data[key])
}
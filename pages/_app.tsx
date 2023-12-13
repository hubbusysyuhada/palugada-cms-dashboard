import store from '@/store'
import '@/styles/globals.scss'
import { LocalizationProvider } from '@mui/x-date-pickers'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Component {...pageProps}>
          <h1>LOADING</h1>
        </Component>
      </LocalizationProvider>
    </Provider>
  )
}

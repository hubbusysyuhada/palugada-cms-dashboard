import style from 'styles/Auth.module.scss'
import React, { MouseEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { Alert, Button, Divider, Snackbar, TextField } from '@mui/material'
import { useSelector } from 'react-redux'
import { TURN_OFF_LOGIN_ERROR, USER_LOGIN } from '@/store/actions/AuthAction'
import { RootStateType, useAppDispatch } from '@/store'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Auth() {
  const dispatch = useAppDispatch()
  const route = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [openError, setOpenError] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const loginErrorStore = useSelector((state: RootStateType) => state.AuthReducer.isLoginError)
  const userStore = useSelector((state: RootStateType) => state.AuthReducer.user)
  const COMPANY_TITLE = process.env.NEXT_PUBLIC_COMPANY_TITLE
  const COMPANY_SUBTITLE = process.env.NEXT_PUBLIC_COMPANY_SUBTITLE

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      dispatch(USER_LOGIN({ username, password }))
      route.push('/')
    }
    else setIsReady(true)
  }, [])

  useEffect(() => {
    if (loginErrorStore) {
      setOpenError(true)
      dispatch(TURN_OFF_LOGIN_ERROR())
    }
  }, [loginErrorStore])

  useEffect(() => {
    if (userStore) {
      setOpenSuccess(true)
      setTimeout(() => {
        setOpenSuccess(false)
        route.push('/')
      }, 2000)
    }
  }, [userStore])

  const login = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent) => {
    e.preventDefault()
    if (username && password) {
      dispatch(USER_LOGIN({ username, password }))
    }
    else setOpenError(true)
  }

  const handleClose = (reason: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
    setOpenSuccess(false);
  };

  const handlePressEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login(e)
  }

  if (!isReady) return (<></>)
  return (
    <>
      <Head>
        <title>LOGIN</title>
        <link rel="shortcut icon" href="/company-logo.ico" />
      </Head>
      <div className={style.root}>
        <div className={style["sub-root"]}>
          <Image
            className={style.illustration}
            src="/home-illustration.png"
            alt="illustration"
            width={45}
            height={37}
            priority
          />
        </div>
        <div className={style["sub-root"]}>
          <>
            <h1 className={style["mb-10"]}>{COMPANY_TITLE}</h1>
            <h4 className={style["mb-10"]}>{COMPANY_SUBTITLE}</h4>
            <Divider className={style.divider} />
            <TextField
              size="small"
              type="text"
              label="Username"
              name="Username"
              variant="outlined"
              className={`${style.input} ${style["mb-10"]}`}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handlePressEnter}
            />
            <TextField
              size="small"
              type="password"
              name="Password"
              label="Password"
              variant="outlined"
              className={`${style.input} ${style["mb-10"]}`}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handlePressEnter}
            />
            <Button className={style["primary-color"]} onClick={login}>Login</Button>
          </>
        </div>
      </div>


      <Snackbar open={openError || loginErrorStore} autoHideDuration={2000} onClose={(_, reason) => handleClose(reason)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => handleClose('')} severity="error">
          Invalid Username/Password!
        </Alert>
      </Snackbar>

      <Snackbar open={openSuccess} autoHideDuration={2000} onClose={(_, reason) => handleClose(reason)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => handleClose('')} severity="success">
          Welcome! Redirecting...
        </Alert>
      </Snackbar>
    </>
  )
}

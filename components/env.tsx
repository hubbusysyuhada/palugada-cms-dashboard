import { IconButton, TextField, Button, Box } from '@mui/material';
import { Visibility, VisibilityOff, Delete } from '@mui/icons-material'

import styles from 'styles/Env.module.scss'
import { useEffect, useState } from 'react';
import setLocalStorage from '@/helper/setLocalStorage';
import makeKey from '@/helper/makeKey';

export type EnvObj = {
  key: string;
  value: string;
  isProtected: boolean;
}


export type AddNewEnv = (key: string) => void
export type DeleteEnv = (key: string) => void
export type UpdateEnv = (data: { key: string; value: string; index: number; }) => void

export default function Env() {
  const [envVar, setEnvVar] = useState<EnvObj[]>([])
  const envList = envVar.map(({ key }) => key)

  const [newEnv, setNewEnv] = useState("")
  const [showEnv, setShowEnv] = useState<
    Record<string, boolean>
  >(envList.reduce((o, key) => Object.assign(o, { [key]: false }), {}))

  const handleClickShowPassword = (key: string) => setShowEnv({ ...showEnv, [key]: !showEnv[key] });

  const customTextInput = {
    style: { fontSize: "12px" },
    disableUnderline: true
  }

  const addEnv: AddNewEnv = (key) => {
    const existedKeys = envVar.map(v => v.key)
    if (!existedKeys.includes(key)) {
      const newEnv: EnvObj[] = [...envVar, { key, value: "", isProtected: false }]
      setEnvVar(newEnv)
      setLocalStorage({ "ENV_VAR": JSON.stringify(newEnv) })
    }
  }

  const deleteEnv: DeleteEnv = (key) => {
    const newEnv: EnvObj[] = envVar.filter(v => v.key !== key)
    setEnvVar(newEnv)
    setLocalStorage({ "ENV_VAR": JSON.stringify(newEnv) })
  }

  const updateEnv: UpdateEnv = (data) => {
    const { key, value, index } = data
    const newEnv = JSON.parse(JSON.stringify(envVar))
    newEnv[index] = { ...newEnv[index], key: key.replaceAll(' ', '_').toUpperCase(), value }
    if (key) {
      setEnvVar(newEnv)
      setLocalStorage({ "ENV_VAR": JSON.stringify(newEnv) })
    }
  }

  useEffect(() => {
    const currentEnv = localStorage.getItem('ENV_VAR')
    if (currentEnv) {
      const parsedEnv = JSON.parse(currentEnv)
      setEnvVar(parsedEnv)
    }
    else {
      const initialState: EnvObj[] = [
        {
          key: "APP_KEY",
          value: makeKey(24),
          isProtected: true
        },
        {
          key: "DB_TYPE",
          value: "",
          isProtected: true
        },
        {
          key: "DB_HOST",
          value: "",
          isProtected: true
        },
        {
          key: "DB_PORT",
          value: "",
          isProtected: true
        },
        {
          key: "DB_NAME",
          value: "",
          isProtected: true
        },
        {
          key: "DB_USERNAME",
          value: "",
          isProtected: true
        },
        {
          key: "DB_PASSWORD",
          value: "",
          isProtected: true
        },
      ]
      setEnvVar(initialState)
      localStorage.setItem('ENV_VAR', JSON.stringify(initialState))
    }
  }, [])

  return (
    <div className={styles.root}>
      <div className={styles['env-container']}>
        {envVar.map(({ key, value, isProtected }, index) => (
          <div key={index} style={{ display: "flex" }}>
            <TextField className={styles['env-input-key']} placeholder='KEY' disabled={isProtected} value={key} variant="standard" InputProps={{ ...customTextInput }} onChange={e => updateEnv({ index, key: e.target.value, value })} />
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextField className={styles['env-input-val']} placeholder='VALUE' value={value} variant="standard" type={showEnv[key] ? 'text' : 'password'} InputProps={{ ...customTextInput, readOnly: key === 'APP_KEY' }} onChange={e => updateEnv({ index, key, value: e.target.value })} />
              <IconButton
                size='small'
                onClick={() => handleClickShowPassword(key)}
                edge="end"
              >
                {showEnv[key] ? <VisibilityOff style={{ height: "12px", width: "12px" }} /> : <Visibility style={{ height: "12px", width: "12px" }} />}
              </IconButton>
              {!isProtected && <IconButton
                size='small'
                onClick={() => { deleteEnv(key) }}
                edge="end"
              >
                <Delete style={{ height: "12px", width: "12px" }} />
              </IconButton>}
            </Box>
          </div>
        ))}
        <div style={{ marginTop: "36px" }}>
          <TextField className={styles['env-input-key']} value={newEnv} onChange={e => setNewEnv(e.target.value.replaceAll(' ', '_').toUpperCase())} placeholder='KEY' variant="standard" InputProps={{
            ...customTextInput,
          }} />
          <Button size='small' variant="outlined" disabled={!newEnv ? true : false} onClick={() => { addEnv(newEnv); setNewEnv("") }} style={{
            height: "25px",
            color: "#08011b",
            borderColor: "#08011b"
          }}>Add ENV</Button>
        </div>
      </div>
    </div>
  )
}
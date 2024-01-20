import React, { useEffect, useState } from 'react';
import style from 'styles/Navbar.module.scss'
import { useSelector } from 'react-redux'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Tabs, TextField } from '@mui/material';
import { RootStateType, useAppDispatch } from '@/store';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { USER_CHANGE_PASSWORD, USER_LOGOUT } from '@/store/actions/AuthAction';
import _ from 'lodash'
import { SET_ROUTE } from '@/store/actions/GlobalContextAction';
import SwalModal from '@/helper/SwalModal';

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function Navbar() {
  const reduxFeatures = useSelector((state: RootStateType) => state.AuthReducer.features)
  const reduxUser = useSelector((state: RootStateType) => state.AuthReducer.user)
  const ReduxchangePasswordError = useSelector((state: RootStateType) => state.AuthReducer.isChangePasswordError)
  const ReduxchangePasswordSuccess = useSelector((state: RootStateType) => state.AuthReducer.isChangePasswordSuccess)
  const reduxCurrentRoute = useSelector((state: RootStateType) => state.GlobalContextReducer.routeName)
  const dispatch = useAppDispatch()
  const route = useRouter()
  const location = route.pathname
  const [changePasswordVal, setChangePasswordVal] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [disableBtn, setDisableBtn] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [value, setValue] = useState(0);
  const [showAccountSetting, setShowAccountSetting] = useState(false);
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);
  const COMPANY_TITLE = process.env.NEXT_PUBLIC_COMPANY_TITLE
  const features = [
    "transactions",
    "catalogs",
    "categories",
    "sub_categories",
    "items",
    "racks",
    "suppliers",
    "supplies",
    "employees",
    "roles",
    // "route_permissions", // commented because of security reasons. User should add it manually via database if they want to make a new route permissions
    "user"
  ]
  const featureNames: Record<string, string> = {
    transactions: "transaksi",
    catalogs: "katalog",
    categories: "kategori",
    sub_categories: "sub kategori",
    items: "barang",
    racks: "rak",
    suppliers: "supplier",
    supplies: "supply barang",
    employees: "karyawan",
    roles: "roles",
    // route_permissions, // commented because of security reasons. User should add it manually via database if they want to make a new route permissions
    user: "user"
  }

  useEffect(() => {
    if (reduxFeatures.length > 0) {
      const allowed = features.filter(feature => reduxFeatures.includes(feature))
      setAllowedFeatures(allowed)
      setValue(allowed.indexOf(location.split('/')[1]))
    }
  }, [reduxFeatures])

  useEffect(() => {
    const { new: newPassword, confirm, current } = changePasswordVal
    if (current && newPassword && (confirm === newPassword)) setDisableBtn(false)
    else setDisableBtn(true)
  }, [changePasswordVal])

  async function logout(event: any) {
    event.preventDefault()
    SwalModal({
      icon: 'question',
      text: `ARE YOU SURE WANT TO LOG OUT AS ${reduxUser?.external_id}?`,
      action: () => {
        SwalModal({
          icon: 'success',
          text: 'LOGGED OUT',
          hideDenyButton: true
        })
        dispatch(USER_LOGOUT())
        localStorage.removeItem('access_token')
        route.push('/auth')
      }
    })
  }

  const moveTab = (index: number, event: any) => {
    event.preventDefault()

    const move = () => {
      const allowed = features.filter(feature => reduxFeatures.includes(feature))
      setShowAccountSetting(false)
      setValue(index)
      dispatch(SET_ROUTE(allowed[index]))
    }
    if (['create-supply', 'create-transaction-in', 'create-transaction-out'].includes(reduxCurrentRoute)) {
      const routeName = reduxCurrentRoute.includes('supply') ? 'supply' : 'transaksi'
      SwalModal({
        icon: 'question',
        title: `Ingin meninggalkan halaman buat ${routeName} baru?`,
        text: `Semua perubahan tidak akan tersimpan`,
        action: move
      })
    }
    else move()
  }

  const accountSetting = (event: any) => {
    event.preventDefault()
    setShowAccountSetting(!showAccountSetting)
  }

  const renderAccountSettingBtn = () => {
    if (!showAccountSetting) return null
    return (
      <>
        <Button
          className={style['account-setting-btn']}
          onClick={(e) => setOpenModal(true)}
        >
          <span className={style['primary-color']} style={{ marginLeft: '15px' }}>GANTI PASSWORD</span>
        </Button>
        <Button
          className={style['account-setting-btn']}
          onClick={logout}
        >
          <span className={style['primary-color']} style={{ marginLeft: '15px' }}>LOG OUT</span>
        </Button>
      </>
    )
  }

  const renderTabs = () => {
    const el: JSX.Element[] = []
    allowedFeatures.forEach((feature, index) => {
      el.push(
        <Button
          className={style['button-tab']}
          onClick={(e) => moveTab(index, e)}
        >
          <span className={style['primary-color']} style={{ marginLeft: '15px' }}>{featureNames[feature]}</span>
        </Button>
      )
    })
    return el
  }

  const closeModal = () => {
    setOpenModal(false)
    setChangePasswordVal({
      current: '',
      new: '',
      confirm: ''
    })
    setDisableBtn(true)
  }

  const updatePassword = (e: any) => {
    e.preventDefault()
    closeModal()
    const payload = {
      username: reduxUser?.external_id || '',
      password: changePasswordVal.current,
      newPassword: changePasswordVal.new
    }
    dispatch(USER_CHANGE_PASSWORD(payload))
  }

  const handleCloseSnackbar = (reason: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch({ type: 'auth/turnOffChangePasswordError' })
    dispatch({ type: 'auth/turnOffChangePasswordSuccess' })
  };

  return (
    <div className={style.root}>
      <div className={style["image-container"]}>
        <Image
          className={style.illustration}
          src="/company-logo.png"
          alt="logo"
          width={50}
          height={50}
          priority
        />
      </div>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        className={style.tabs}
        TabIndicatorProps={{
          style: {
            backgroundColor: "#6A32CB",
          }
        }}
      >
        {renderTabs()}
      </Tabs>
      <div className={style['account-tab-container']}>
        <div className={style['account-tab']}>
          <Button
            className={style['button-tab']}
            onClick={(e) => accountSetting(e)}
          >
            <span className={style['primary-color']} style={{ marginLeft: '15px' }}>ACCOUNT</span>
          </Button>
          {renderAccountSettingBtn()}
        </div>
      </div>
      <h5 className="text-center mb-40">{COMPANY_TITLE}™<br /> 2023</h5>

      <Dialog open={openModal} onClose={closeModal} aria-labelledby="form-dialog-title" style={{ width: '500px', margin: 'auto', textAlign: 'center' }}>
        <DialogTitle id="form-dialog-title">Change Password for {reduxUser?.external_id}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            value={changePasswordVal.current}
            onChange={(e) => {
              setChangePasswordVal({
                ...changePasswordVal, current: e.target.value
              })
            }}
            InputProps={{ ...customTextInput }}
            variant="standard"
            fullWidth
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            value={changePasswordVal.new}
            onChange={(e) => {
              setChangePasswordVal({
                ...changePasswordVal, new: e.target.value
              })
            }}
            InputProps={{ ...customTextInput }}
            variant="standard"
            fullWidth
          />
          <TextField
            margin="dense"
            label="Confirm Password"
            type="password"
            value={changePasswordVal.confirm}
            onChange={(e) => {
              setChangePasswordVal({
                ...changePasswordVal, confirm: e.target.value
              })
            }}
            InputProps={{ ...customTextInput }}
            variant="standard"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={updatePassword}
            color="primary"
            disabled={disableBtn}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>



      <Snackbar open={ReduxchangePasswordError} autoHideDuration={2000} onClose={(_, reason) => handleCloseSnackbar(reason)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => handleCloseSnackbar('')} severity="error">
          Invalid Password!
        </Alert>
      </Snackbar>

      <Snackbar open={ReduxchangePasswordSuccess} autoHideDuration={2000} onClose={(_, reason) => handleCloseSnackbar(reason)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => handleCloseSnackbar('')} severity="success">
          Password Successfully Changed
        </Alert>
      </Snackbar>


    </div>
  );
}
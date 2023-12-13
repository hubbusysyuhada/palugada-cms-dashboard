import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { FETCH_ROLES } from '@/store/actions/RBACAction'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemText, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import { CHANGE_ROLE, CREATE_USER, FETCH_ALL_USERS } from '@/store/actions/UserAction'
import NoData from '../NoData'
import { Role } from '@/store/reducer/RBACReducer'

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function User() {
  const reduxRoles = useSelector((state: RootStateType) => state.RBACReducer.allRoles)
  const reduxUsers = useSelector((state: RootStateType) => state.UserReducer.users)
  const totalRow = useSelector((state: RootStateType) => state.UserReducer.totalRow)
  const [newForm, setNewForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: ''
  })
  const [disableAddBtn, setDisableAddBtn] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [roleSearchNames, setRoleSearchNames] = useState<string[]>(['No Role Chosen'])
  const roleSearchIds = useRef<string[]>([])
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const searchName = useRef('')
  const dispatch = useAppDispatch()

  useEffect(() => {
    const { username, password, confirmPassword, role } = newForm
    if (username && password && confirmPassword && role && password === confirmPassword) setDisableAddBtn(false)
    else setDisableAddBtn(true)
  }, [newForm])

  useEffect(() => {
    filterSearch()
    dispatch(FETCH_ROLES())
  }, [])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page])

  const closeModal = () => {
    setOpenModal(false)
    setNewForm({
      username: '',
      password: '',
      confirmPassword: '',
      role: ''
    })
    setDisableAddBtn(true)
  }

  const createUser = (e: any) => {
    e.preventDefault()
    const payload = {
      external_id: newForm.username,
      password: newForm.password,
      role_id: newForm.role
    }
    dispatch(CREATE_USER(payload))
    closeModal()
  }

  const changeRole = (userId: string, roleId: string) => {
    dispatch(CHANGE_ROLE(userId, roleId))
  }

  const handleRoleSeach = (ids: string[]) => {
    const role = reduxRoles.find(r => r.id === ids[ids.length - 1]) as Role
    const idIndexOf = roleSearchIds.current.indexOf(role.id)
    const nameIndexOf = roleSearchNames.indexOf(role.name)
    let roleNames: string[] = []
    let roleIds: string[] = []

    if (idIndexOf === -1) roleIds = [...roleSearchIds.current, role.id]
    else roleIds = roleSearchIds.current.filter((_, i) => i !== idIndexOf)

    if (nameIndexOf === -1) roleNames = [...roleSearchNames, role.name]
    else roleNames = roleSearchNames.filter((_, i) => i !== nameIndexOf)

    if (roleIds.length !== 0 && roleNames.includes('No Role Chosen')) {
      roleNames.shift()
    }
    else if (roleIds.length === 0) roleNames.push('No Role Chosen')

    setRoleSearchNames(roleNames)
    roleSearchIds.current = roleIds

    filterSearch()
  }

  const handleSearchName = (value: string) => {
    searchName.current = value
    clearTimeout(debounceTimer)
    const timeout = setTimeout(() => {
      filterSearch()
    }, 1000)
    setDebounceTimer(timeout)
  }

  const filterSearch = () => {
    let offset = page * rowsPerPage
    if (offset >= totalRow) offset = 0
    dispatch(FETCH_ALL_USERS({ name: searchName.current, roleIds: roleSearchIds.current, limit: rowsPerPage, offset }))
  }

  const renderData = () => {
    if (reduxUsers.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={'10%'}>No.</TableCell>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="center">Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxUsers.filter(u => u.role.name !== 'owner').map((user, index) => (
                    <TableRow
                      key={user.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center" width={'10%'}>{index + 1 + (page * rowsPerPage)}</TableCell>
                      <TableCell align="left">{user.external_id}</TableCell>
                      <TableCell align="center">
                        <Select
                          labelId="demo-select-small-label"
                          value={user.role.id}
                          label="Role"
                          variant="standard"
                          disableUnderline
                          onChange={e => changeRole(user.id, e.target.value)}
                          fullWidth
                        >
                          {reduxRoles.filter(r => r.name !== 'owner').map(r => (
                            <MenuItem value={r.id} selected={user.role === r}>{r.name}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              className='table-pagination'
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={totalRow}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => { setPage(newPage) }}
              onRowsPerPageChange={(e) => { setRowsPerPage(+(e.target.value)) }}
            />
          </Paper>
        </div>
      )
    }
    return <NoData />
  }

  return (
    <div className="root-with-filter">
      <div className="register-container">
        <Button variant="contained" className="global-btn" onClick={() => setOpenModal(true)}>Register Account</Button>
      </div>
      <div className='table-content'>
        <div className='filter-group mb-50'>
          <div className='width-50'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Name</b></p>
              <TextField placeholder="User Name" variant="outlined" size='small' fullWidth value={searchName.current} onChange={e => handleSearchName(e.target.value)} />
            </div>
          </div>
          <div className='width-30'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Role</b></p>
              <Select
                className='text-align-left'
                renderValue={(selected: string[]) => selected.join(', ')}
                value={roleSearchNames}
                variant="outlined"
                size='small'
                onChange={(e) => handleRoleSeach(e.target.value as string[])}
                fullWidth
                multiple
              >
                {reduxRoles.filter(r => r.name !== 'owner').map((r, i) => (
                  <MenuItem value={r.id}>
                    <Checkbox size='small' checked={roleSearchIds.current.includes(r.id)} />
                    <ListItemText primary={r.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        {renderData()}
      </div>

      {/* register user modal */}
      <Dialog open={openModal} onClose={closeModal} aria-labelledby="form-dialog-title" style={{ width: '500px', margin: 'auto', textAlign: 'center' }}>
        <DialogTitle id="form-dialog-title">Register New Account</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newForm.username}
            onChange={(e) => {
              setNewForm({
                ...newForm, username: e.target.value
              })
            }}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            value={newForm.password}
            onChange={(e) => {
              setNewForm({
                ...newForm, password: e.target.value
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
            value={newForm.confirmPassword}
            onChange={(e) => {
              setNewForm({
                ...newForm, confirmPassword: e.target.value
              })
            }}
            InputProps={{ ...customTextInput }}
            variant="standard"
            fullWidth
          />
          <FormControl size="medium" fullWidth variant="standard" sx={{ textAlign: "left" }}>
            <InputLabel id="demo-select-small-label">Role</InputLabel>
            <Select
              labelId="demo-select-small-label"
              value={newForm.role}
              label="Role"
              onChange={e => setNewForm({ ...newForm, role: e.target.value })}
            >
              {reduxRoles.filter(r => r.name !== 'owner').map(r => (
                <MenuItem value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={createUser}
            color="primary"
            disabled={disableAddBtn}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

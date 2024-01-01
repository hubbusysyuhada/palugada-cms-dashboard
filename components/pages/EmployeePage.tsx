import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip } from '@mui/material'
import NoData from '../NoData'
import { CREATE_EMPLOYEE, DEACTIVE_EMPLOYEE, FETCH_ALL_EMPLOYEES, UPDATE_EMPLOYEE } from '@/store/actions/EmployeeAction'
import { Block, Edit } from '@mui/icons-material';
import { Employee as EmployeeType } from '@/store/reducer/EmployeeReducer'
import Swal from 'sweetalert2'
import SwalModal from '@/helper/SwalModal'

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function Employee() {
  const reduxEmployees = useSelector((state: RootStateType) => state.EmployeeReducer.employees)
  const totalRow = useSelector((state: RootStateType) => state.EmployeeReducer.totalRow)
  const [newName, setNewName] = useState('')
  const [newIdKaryawan, setNewIdKaryawan] = useState('')
  const [editEmployee, setEditEmployee] = useState<EmployeeType>({
    id: '',
    name: '',
    idKaryawan: ''
  })
  const [duplicateError, setDuplicateError] = useState(true)
  const [disableAddBtn, setDisableAddBtn] = useState(true)
  const [disableEditBtn, setDisableEditBtn] = useState(true)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const searchName = useRef('')
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (newName) setDisableAddBtn(false)
    else setDisableAddBtn(true)
  }, [newName])

  useEffect(() => {
    const duplicate = reduxEmployees.filter(v => v.id !== editEmployee.id && v.name === editEmployee.name)
    if (!duplicate.length && editEmployee.name) setDisableEditBtn(false)
    else setDisableEditBtn(true)

    if (duplicate.length) setDuplicateError(true)
    else setDuplicateError(false)
  }, [editEmployee])

  useEffect(() => {
    filterSearch()
  }, [])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page])

  const closeCreateModal = () => {
    setOpenCreateModal(false)
    setNewName('')
    setDisableAddBtn(true)
  }

  const createEmployee = (e: any) => {
    e.preventDefault()
    dispatch(CREATE_EMPLOYEE({name: newName, idKaryawan: newIdKaryawan}))
    closeCreateModal()
  }

  const deactiveEmployee = async (employee: EmployeeType) => {
    SwalModal({
      icon: 'question',
      text: `APAKAH KAMU YAKIN INGIN MENONAKTIFKAN ${employee.name} SEBAGAI KARYAWAN?`,
      action: () => dispatch(DEACTIVE_EMPLOYEE(employee.id))
    })
  }

  const closeEditModal = () => {
    setOpenEditModal(false)
    setEditEmployee({ id: '', name: '', idKaryawan: '' })
    setDisableEditBtn(true)
  }

  const openEditEmployeeModal = (employee: EmployeeType) => {
    setEditEmployee(employee)
    setOpenEditModal(true)
  }

  const saveEmployee = (e: any) => {
    e.preventDefault()
    dispatch(UPDATE_EMPLOYEE(editEmployee.id, {name: editEmployee.name, idKaryawan: editEmployee.idKaryawan}))
    closeEditModal()
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
    dispatch(FETCH_ALL_EMPLOYEES({ name: searchName.current, limit: rowsPerPage, offset, isActiveOnly: true }))
  }

  const renderData = () => {
    if (reduxEmployees.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={'10%'}>No.</TableCell>
                    <TableCell align="left">Nama</TableCell>
                    <TableCell align="left">ID Karyawan</TableCell>
                    <TableCell align="center" width={'20%'}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxEmployees.map((employee, index) => (
                    <TableRow
                      key={employee.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center" width={'10%'}>{index + 1 + (page * rowsPerPage)}</TableCell>
                      <TableCell align="left">{employee.name}</TableCell>
                      <TableCell align="left">{employee.idKaryawan}</TableCell>
                      <TableCell align="center" width={'20%'}>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => openEditEmployeeModal(employee)}>
                            <Edit fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Nonaktifkan">
                          <IconButton onClick={() => deactiveEmployee(employee)}>
                            <Block fontSize='small' />
                          </IconButton>
                        </Tooltip>
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
        <Button variant="contained" className="global-btn" onClick={() => setOpenCreateModal(true)}>Tambahkan Karyawan</Button>
      </div>
      <div className='table-content'>
        <div className='filter-group mb-50'>
          <div className='width-50'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Nama</b></p>
              <TextField placeholder="Nama atau ID Karyawan" variant="outlined" size='small' fullWidth value={searchName.current} onChange={e => handleSearchName(e.target.value)} />
            </div>
          </div>
        </div>
        {renderData()}
      </div>

      {/* register employee modal */}
      <Dialog open={openCreateModal} onClose={closeCreateModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Tambahkan Karyawan</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
          <TextField
            margin="dense"
            label="ID Karyawan"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newIdKaryawan}
            onChange={(e) => setNewIdKaryawan(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={createEmployee}
            color="primary"
            disabled={disableAddBtn}
          >
            Tambahkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* edit employee modal */}
      <Dialog open={openEditModal} onClose={closeEditModal}>
        <DialogTitle>Edit Karyawan</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editEmployee.name}
            onChange={(e) => setEditEmployee({ id: editEmployee.id, name: e.target.value, idKaryawan: editEmployee.idKaryawan })}
            fullWidth
            helperText={duplicateError ? "Nama tidak boleh sama" : ""}
            error={duplicateError}
          />
          <TextField
            margin="dense"
            label="ID Karyawan"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editEmployee.idKaryawan}
            onChange={(e) => setEditEmployee({ id: editEmployee.id, idKaryawan: e.target.value, name: editEmployee.name })}
            fullWidth
            helperText={duplicateError ? "Nama tidak boleh sama" : ""}
            error={duplicateError}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={saveEmployee}
            color="primary"
            disabled={disableEditBtn}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

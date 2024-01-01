import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, InputLabel, FormControl, TablePagination, Checkbox, ListItemText } from '@mui/material'
import NoData from '../NoData'
import { Edit, Delete } from '@mui/icons-material';
import { CREATE_RACK, DELETE_RACK, FETCH_ALL_RACKS, UPDATE_RACK } from '@/store/actions/RackAction'
import { Rack as RackType } from '@/store/reducer/RackReducer'
import SwalModal from '@/helper/SwalModal'

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function Rack() {
  const reduxRacks = useSelector((state: RootStateType) => state.RackReducer.racks)
  const totalRow = useSelector((state: RootStateType) => state.RackReducer.totalRow)
  const [newRack, setNewRack] = useState<{ name: string; storage_number: number }>({
    name: '',
    storage_number: 0
  })
  const [editRack, setEditRack] = useState<{ id: string; name: string; storage_number: string }>({
    id: '',
    name: '',
    storage_number: ''
  })
  const [disableAddBtn, setDisableAddBtn] = useState(true)
  const [disableEditBtn, setDisableEditBtn] = useState(true)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const keywords = useRef('')
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (newRack) setDisableAddBtn(false)
    else setDisableAddBtn(true)
  }, [newRack])

  useEffect(() => {
    if (editRack.name) setDisableEditBtn(false)
    else setDisableEditBtn(true)
  }, [editRack])

  useEffect(() => {
    dispatch(FETCH_ALL_RACKS({ limit: rowsPerPage, offset: page * rowsPerPage }))
  }, [])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page])

  const closeCreateModal = () => {
    setOpenCreateModal(false)
    setNewRack({ name: '', storage_number: 0 })
    setDisableAddBtn(true)
  }

  const createRack = (e: any) => {
    e.preventDefault()
    dispatch(CREATE_RACK(newRack))
    closeCreateModal()
  }

  const deleteRack = async (rack: RackType) => {
    SwalModal({
      icon: 'question',
      text: `APAKAH KAMU YAKIN INGIN MENGHAPUS RAK ${rack.name}?`,
      action: () => dispatch(DELETE_RACK(rack.id))
    })
  }

  const closeEditModal = () => {
    setOpenEditModal(false)
    setEditRack({ id: '', name: '', storage_number: '' })
    setDisableEditBtn(true)
  }

  const openEditRackModal = (rack: RackType) => {
    setEditRack(rack)
    setOpenEditModal(true)
  }

  const saveRack = (e: any) => {
    e.preventDefault()
    dispatch(UPDATE_RACK(editRack))
    closeEditModal()
  }

  const handleSearchName = (value: string) => {
    keywords.current = value
    clearTimeout(debounceTimer)
    const timeout = setTimeout(() => {
      filterSearch()
    }, 1000)
    setDebounceTimer(timeout)
  }

  const filterSearch = () => {
    let offset = page * rowsPerPage
    if (offset >= totalRow) offset = 0
    dispatch(FETCH_ALL_RACKS({ keywords: keywords.current, limit: rowsPerPage, offset }))
  }

  const renderData = () => {
    if (reduxRacks.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={'10%'}>No.</TableCell>
                    <TableCell align="left" width={'50%'}>Nama</TableCell>
                    <TableCell align="left">Nomor Lemari</TableCell>
                    <TableCell align="center" width={'20%'}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxRacks.map((rack, index) => (
                    <TableRow
                      key={rack.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center" width={'10%'}>{index + 1 + (page * rowsPerPage)}</TableCell>
                      <TableCell align="left">{rack.name}</TableCell>
                      <TableCell align="left">{rack.storage_number}</TableCell>
                      <TableCell align="center" width={'20%'}>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => openEditRackModal(rack)}>
                            <Edit fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton onClick={() => deleteRack(rack)}>
                            <Delete fontSize='small' />
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
        <Button variant="contained" className="global-btn" onClick={() => setOpenCreateModal(true)}>Buat Rak Baru</Button>
      </div>
      <div className='table-content'>
        <div className='filter-group mb-50'>
          <div className='width-40'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Name</b></p>
              <TextField placeholder="Nama Rak atau Nomor Lemari" variant="outlined" size='small' fullWidth value={keywords.current} onChange={e => handleSearchName(e.target.value)} />
            </div>
          </div>
        </div>
        {renderData()}
      </div>

      {/* create new rack modal */}
      <Dialog open={openCreateModal} onClose={closeCreateModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Buat Rak Baru</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newRack.name}
            onChange={(e) => setNewRack({ ...newRack, name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Nomor Lemari"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newRack.storage_number}
            onChange={(e) => setNewRack({ ...newRack, storage_number: +(e.target.value) })}
            fullWidth
            className='mb-5 mt-5'
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={createRack}
            color="primary"
            disabled={disableAddBtn}
          >
            Tambahkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* edit rack modal */}
      <Dialog open={openEditModal} onClose={closeEditModal}>
        <DialogTitle>Edit Rak</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editRack.name}
            onChange={(e) => setEditRack({ ...editRack, name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Nomor Lemari"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editRack.storage_number}
            onChange={(e) => setEditRack({ ...editRack, storage_number: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={saveRack}
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

import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, InputLabel, FormControl, TablePagination, Checkbox, ListItemText, Collapse, Box, Typography } from '@mui/material'
import NoData from '../NoData'
import { Edit, Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import Swal from 'sweetalert2'
import { Supplier as SupplierType } from '@/store/reducer/SupplierReducer'
import { CREATE_SUPPLIER, DELETE_SUPPLIER, FETCH_ALL_SUPPLIERS, UPDATE_SUPPLIER } from '@/store/actions/SupplierAction'
import SwalModal from '@/helper/SwalModal'

const supplierDefaultValue = {
  name: '',
  account_name: '',
  account_number: '',
  address: '',
  bank_name: '',
  contact_info: '',
  contact_person: '',
  notes: ''
}

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function Supplier() {
  const reduxSuppliers = useSelector((state: RootStateType) => state.SupplierReducer.suppliers)
  const totalRow = useSelector((state: RootStateType) => state.SupplierReducer.totalRow)
  const [newSupplier, setNewSupplier] = useState<Partial<SupplierType>>(supplierDefaultValue)
  const [editSupplier, setEditSupplier] = useState<SupplierType>({ ...supplierDefaultValue, id: '' })
  const [expandRow, setExpandRow] = useState(-1)
  const [disableAddBtn, setDisableAddBtn] = useState(true)
  const [disableEditBtn, setDisableEditBtn] = useState(true)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const keywords = useRef('')
  const [hover, setHover] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const dispatch = useAppDispatch()

  useEffect(() => {
    let isValidated = true
    for (const key in newSupplier) {
      if (key !== 'address' && !newSupplier[key as keyof SupplierType]) isValidated = false
    }
    setDisableAddBtn(!isValidated)
  }, [newSupplier])

  useEffect(() => {
    let isValidated = true
    for (const key in editSupplier) {
      if (key !== 'address' && key !== 'id' && !editSupplier[key as keyof SupplierType]) isValidated = false
    }
    setDisableEditBtn(!isValidated)
  }, [editSupplier])

  useEffect(() => {
    dispatch(FETCH_ALL_SUPPLIERS({ limit: rowsPerPage, offset: page * rowsPerPage }))
  }, [])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page])

  const closeCreateModal = () => {
    setOpenCreateModal(false)
    setNewSupplier(supplierDefaultValue)
    setDisableAddBtn(true)
  }

  const createSupplier = (e: any) => {
    e.preventDefault()
    dispatch(CREATE_SUPPLIER(newSupplier))
    closeCreateModal()
  }

  const deleteSupplier = async (supplier: SupplierType) => {
    SwalModal({
      icon: 'question',
      text: `ARE YOU SURE WANT TO DELETE ${supplier.name}?`,
      action: () => dispatch(DELETE_SUPPLIER(supplier.id))
    })
  }

  const closeEditModal = () => {
    setOpenEditModal(false)
    setEditSupplier({ ...supplierDefaultValue, id: '' })
    setDisableEditBtn(true)
  }

  const openEditSupplierModal = (supplier: SupplierType) => {
    setEditSupplier(supplier)
    setOpenEditModal(true)
  }

  const saveSupplier = (e: any) => {
    e.preventDefault()
    dispatch(UPDATE_SUPPLIER(editSupplier))
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
    dispatch(FETCH_ALL_SUPPLIERS({ keywords: keywords.current, limit: rowsPerPage, offset }))
  }

  const handleExpandRow = (index: number) => {
    if (expandRow === index) setExpandRow(-1)
    else setExpandRow(index)
  }

  const renderCollapsibleArrow = (index: number) => {
    const isOpened = index === expandRow

    if (isOpened) {
      return (
        <Tooltip title="Tutup">
          <IconButton onClick={(e) => {
            e.stopPropagation()
            handleExpandRow(index)
          }}>
            <KeyboardArrowUp fontSize='small' />
          </IconButton>
        </Tooltip>
      )
    }
    return (
      <Tooltip title="Buka">
        <IconButton onClick={(e) => {
          e.stopPropagation()
          handleExpandRow(index)
        }}>
          <KeyboardArrowDown fontSize='small' />
        </IconButton>
      </Tooltip>
    )

  }

  const renderData = () => {
    if (reduxSuppliers.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={'10%'}>No.</TableCell>
                    <TableCell align="left" width={'30%'}>Nama</TableCell>
                    <TableCell align="left" width={'20%'}>Whatsapp/Email</TableCell>
                    <TableCell align="center" width={'20%'}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxSuppliers.map((supplier, index) => (
                    <>
                      <TableRow
                        key={supplier.id}
                        sx={{ '& > *': { borderBottom: 'unset !important' } }}
                        onMouseOver={() => setHover(index + 1) }
                        onMouseOut={() => setHover(0) }
                        onClick={() => { handleExpandRow(index) }}
                        className={hover === index + 1 ? "table-row-hover" : ""}
                      >
                        <TableCell align="center" width={'10%'}>{index + 1 + (page * rowsPerPage)}</TableCell>
                        <TableCell align="left">{supplier.name}</TableCell>
                        <TableCell align="left">{supplier.contact_info}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton onClick={(e) => {
                              e.stopPropagation()
                              openEditSupplierModal(supplier)
                            }}>
                              <Edit fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus">
                            <IconButton onClick={(e) => {
                              e.stopPropagation()
                              deleteSupplier(supplier)
                            }}>
                              <Delete fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          {renderCollapsibleArrow(index)}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        className={hover === index + 1 ? "table-row-hover" : ""}
                        onMouseOver={() => setHover(index + 1) }
                        onMouseOut={() => setHover(0) }
                      >
                        <TableCell className='p-0' />
                        <TableCell align="left" colSpan={2} className='p-0'>
                          <Collapse in={expandRow === index} timeout="auto" unmountOnExit>
                            <Box className='ml-20'>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Nama</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-75 ml-10'>{supplier.name}</Box>
                              </Box>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Alamat</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-75 ml-10'>
                                  <Typography variant='caption'>{supplier.address}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>PIC</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-75 ml-10'>
                                  <Typography variant='caption'>{supplier.contact_person}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Whatsapp/Email</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-75 ml-10'>
                                  <Typography variant='caption'>{supplier.contact_info}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Nomor Rekening</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-75 ml-10'>
                                  <Typography variant='caption'>{supplier.account_number}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Nama Rekening</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-75 ml-10'>
                                  <Typography variant='caption'>{supplier.account_name}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Bank</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-75 ml-10'>
                                  <Typography variant='caption'>{supplier.bank_name}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Keterangan</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-75 ml-10'>
                                  <Typography variant='caption'>{supplier.notes || "-"}</Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                        <TableCell className='p-0' />
                      </TableRow>
                    </>
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
        <Button variant="contained" className="global-btn" onClick={() => setOpenCreateModal(true)}>Buat Supplier Baru</Button>
      </div>
      <div className='table-content'>
        <div className='filter-group mb-50'>
          <div className='width-40'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Kata Kunci</b></p>
              <TextField placeholder="Masukkan Kata Kunci" variant="outlined" size='small' fullWidth value={keywords.current} onChange={e => handleSearchName(e.target.value)} />
            </div>
          </div>
        </div>
        {renderData()}
      </div>

      {/* create new supplier modal */}
      <Dialog open={openCreateModal} onClose={closeCreateModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Buat Supplier Baru</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSupplier.name}
            onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Alamat"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSupplier.address}
            onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
            multiline
            rows={4}
          />
          <TextField
            margin="dense"
            label="Person In Charge *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSupplier.contact_person}
            onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Whatsapp/Email *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSupplier.contact_info}
            onChange={(e) => setNewSupplier({ ...newSupplier, contact_info: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Nomor Rekening *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSupplier.account_number}
            onChange={(e) => setNewSupplier({ ...newSupplier, account_number: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Nama Rekening *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSupplier.account_name}
            onChange={(e) => setNewSupplier({ ...newSupplier, account_name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Bank *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSupplier.bank_name}
            onChange={(e) => setNewSupplier({ ...newSupplier, bank_name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Keterangan"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSupplier.notes}
            onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={createSupplier}
            color="primary"
            disabled={disableAddBtn}
          >
            Tambahkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* edit supplier modal */}
      <Dialog open={openEditModal} onClose={closeEditModal}>
        <DialogTitle>Edit Supplier</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSupplier.name}
            onChange={(e) => setEditSupplier({ ...editSupplier, name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Alamat"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSupplier.address}
            onChange={(e) => setEditSupplier({ ...editSupplier, address: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
            multiline
            rows={4}
          />
          <TextField
            margin="dense"
            label="Person In Charge *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSupplier.contact_person}
            onChange={(e) => setEditSupplier({ ...editSupplier, contact_person: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Whatsapp/Email *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSupplier.contact_info}
            onChange={(e) => setEditSupplier({ ...editSupplier, contact_info: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Nomor Rekening *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSupplier.account_number}
            onChange={(e) => setEditSupplier({ ...editSupplier, account_number: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Nama Rekening *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSupplier.account_name}
            onChange={(e) => setEditSupplier({ ...editSupplier, account_name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Bank *"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSupplier.bank_name}
            onChange={(e) => setEditSupplier({ ...editSupplier, bank_name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Keterangan"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSupplier.notes}
            onChange={(e) => setEditSupplier({ ...editSupplier, notes: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={saveSupplier}
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

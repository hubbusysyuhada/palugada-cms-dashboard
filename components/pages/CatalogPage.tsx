import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip } from '@mui/material'
import NoData from '../NoData'
import { Edit, Delete } from '@mui/icons-material';
import { Catalog as CatalogType } from '@/store/reducer/CatalogReducer'
import Swal from 'sweetalert2'
import { CREATE_CATALOG, DELETE_CATALOG, FETCH_ALL_CATALOGS, UPDATE_CATALOG } from '@/store/actions/CatalogAction'
import SwalModal from '@/helper/SwalModal'

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function Catalog() {
  const reduxCatalogs = useSelector((state: RootStateType) => state.CatalogReducer.catalogs)
  const totalRow = useSelector((state: RootStateType) => state.CatalogReducer.totalRow)
  const [newName, setNewName] = useState('')
  const [editCatalog, setEditCatalog] = useState<CatalogType>({
    id: '',
    name: ''
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
    const duplicate = reduxCatalogs.filter(v => v.id !== editCatalog.id && v.name === editCatalog.name)
    if (!duplicate.length && editCatalog.name) setDisableEditBtn(false)
    else setDisableEditBtn(true)

    if (duplicate.length) setDuplicateError(true)
    else setDuplicateError(false)
  }, [editCatalog])

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

  const createCatalog = (e: any) => {
    e.preventDefault()
    dispatch(CREATE_CATALOG(newName))
    closeCreateModal()
  }

  const deleteCatalog = async (catalog: CatalogType) => {
    SwalModal({
      icon: 'question',
      text: `APAKAH KAMU YAKIN INGIN MENGHAPUS ${catalog.name}?`,
      action: () => dispatch(DELETE_CATALOG(catalog.id))
    })
  }

  const closeEditModal = () => {
    setOpenEditModal(false)
    setEditCatalog({ id: '', name: '' })
    setDisableEditBtn(true)
  }

  const openEditCatalogModal = (catalog: CatalogType) => {
    setEditCatalog(catalog)
    setOpenEditModal(true)
  }

  const saveCatalog = (e: any) => {
    e.preventDefault()
    dispatch(UPDATE_CATALOG(editCatalog.id, editCatalog.name))
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
    dispatch(FETCH_ALL_CATALOGS({ name: searchName.current, limit: rowsPerPage, offset }))
  }

  const renderData = () => {
    if (reduxCatalogs.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={'10%'}>No.</TableCell>
                    <TableCell align="left">Nama</TableCell>
                    <TableCell align="center" width={'20%'}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxCatalogs.map((catalog, index) => (
                    <TableRow
                      key={catalog.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center" width={'10%'}>{index + 1 + (page * rowsPerPage)}</TableCell>
                      <TableCell align="left">{catalog.name}</TableCell>
                      <TableCell align="center" width={'20%'}>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => openEditCatalogModal(catalog)}>
                            <Edit fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton onClick={() => deleteCatalog(catalog)}>
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
        <Button variant="contained" className="global-btn" onClick={() => setOpenCreateModal(true)}>Buat Katalog Baru</Button>
      </div>

      <div className='table-content'>
        <div className='filter-group mb-50'>
          <div className='width-50'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Name</b></p>
              <TextField placeholder="Nama Katalog" variant="outlined" size='small' fullWidth value={searchName.current} onChange={e => handleSearchName(e.target.value)} />
            </div>
          </div>
        </div>
        {renderData()}
      </div>

      {/* create new catalog modal */}
      <Dialog open={openCreateModal} onClose={closeCreateModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Buat Katalog Baru</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button
            onClick={createCatalog}
            color="primary"
            disabled={disableAddBtn}
          >
            Tambahkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* edit catalog modal */}
      <Dialog open={openEditModal} onClose={closeEditModal}>
        <DialogTitle>Edit Catalog</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editCatalog.name}
            onChange={(e) => setEditCatalog({ id: editCatalog.id, name: e.target.value })}
            fullWidth
            helperText={duplicateError ? "Nama tidak boleh sama" : ""}
            error={duplicateError}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={saveCatalog}
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

import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, InputLabel, FormControl, TablePagination, Checkbox, ListItemText } from '@mui/material'
import NoData from '../NoData'
import { Edit, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2'
import { CREATE_CATEGORY, DELETE_CATEGORY, FETCH_ALL_CATEGORIES, UPDATE_CATEGORY } from '@/store/actions/CategoryAction'
import { Category as CategoryType } from '@/store/reducer/CategoryReducer'
import { Catalog } from '@/store/reducer/CatalogReducer'
import SwalModal from '@/helper/SwalModal'

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function Category() {
  const reduxCatalogs = useSelector((state: RootStateType) => state.CatalogReducer.catalogs)
  const totalRow = useSelector((state: RootStateType) => state.CategoryReducer.totalRow)
  const reduxCategories = useSelector((state: RootStateType) => state.CategoryReducer.categories)
  const [newCategory, setNewCategory] = useState({
    name: '',
    catalog_id: ''
  })
  const [editCategory, setEditCategory] = useState<{ id: string; name: string; catalog_id: string }>({
    id: '',
    name: '',
    catalog_id: ''
  })
  const [disableAddBtn, setDisableAddBtn] = useState(true)
  const [disableEditBtn, setDisableEditBtn] = useState(true)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const [catalogSearchNames, setCatalogSearchNames] = useState<string[]>(['Pilih Katalog'])
  const searchName = useRef('')
  const catalogSearchIds = useRef<string[]>([])
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (newCategory.name) setDisableAddBtn(false)
    else setDisableAddBtn(true)
  }, [newCategory])

  useEffect(() => {
    setNewCategory({ ...newCategory, catalog_id: reduxCatalogs[0]?.id || '' })
  }, [reduxCatalogs])

  useEffect(() => {
    if (editCategory.name) setDisableEditBtn(false)
    else setDisableEditBtn(true)
  }, [editCategory])

  useEffect(() => {
    dispatch(FETCH_ALL_CATEGORIES({ limit: rowsPerPage, offset: page * rowsPerPage }))
  }, [])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page])

  const closeCreateModal = () => {
    setOpenCreateModal(false)
    setNewCategory({ name: '', catalog_id: reduxCatalogs[0].id })
    setDisableAddBtn(true)
  }

  const createCategory = (e: any) => {
    e.preventDefault()
    dispatch(CREATE_CATEGORY(newCategory))
    closeCreateModal()
  }

  const deleteCategory = async (category: CategoryType) => {
    SwalModal({
      icon: 'question',
      text: `APA KAMU YAKIN INGIN MENGHAPUS ${category.name}?`,
      action: () => dispatch(DELETE_CATEGORY(category.id))
    })
  }

  const closeEditModal = () => {
    setOpenEditModal(false)
    setEditCategory({ id: '', name: '', catalog_id: reduxCatalogs[0]?.id || '' })
    setDisableEditBtn(true)
  }

  const openEditCategoryModal = (category: CategoryType) => {
    setEditCategory({ ...category, catalog_id: category.catalog.id })
    setOpenEditModal(true)
  }

  const saveCategory = (e: any) => {
    e.preventDefault()
    dispatch(UPDATE_CATEGORY(editCategory))
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

  const handleCatalogSeach = (ids: string[]) => {
    const catalog = reduxCatalogs.find(c => c.id === ids[ids.length - 1]) as Catalog
    const idIndexOf = catalogSearchIds.current.indexOf(catalog.id)
    const nameIndexOf = catalogSearchNames.indexOf(catalog.name)
    let catalogNames: string[] = []
    let catalogIds: string[] = []

    if (idIndexOf === -1) catalogIds = [...catalogSearchIds.current, catalog.id]
    else catalogIds = catalogSearchIds.current.filter((_, i) => i !== idIndexOf)

    if (nameIndexOf === -1) catalogNames = [...catalogSearchNames, catalog.name]
    else catalogNames = catalogSearchNames.filter((_, i) => i !== nameIndexOf)

    if (catalogIds.length !== 0 && catalogNames.includes('Pilih Katalog')) {
      catalogNames.shift()
    }
    else if (catalogIds.length === 0) catalogNames.push('Pilih Katalog')

    setCatalogSearchNames(catalogNames)
    catalogSearchIds.current = catalogIds

    filterSearch()
  }

  const filterSearch = () => {
    let offset = page * rowsPerPage
    if (offset >= totalRow) offset = 0
    dispatch(FETCH_ALL_CATEGORIES({ name: searchName.current, catalogIds: catalogSearchIds.current, limit: rowsPerPage, offset }))
  }

  const renderData = () => {
    if (reduxCategories.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={'10%'}>No.</TableCell>
                    <TableCell align="left" width={'40%'}>Nama</TableCell>
                    <TableCell align="left">Katalog</TableCell>
                    <TableCell align="center" width={'20%'}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxCategories.map((category, index) => (
                    <TableRow
                      key={category.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center" width={'10%'}>{index + 1 + (page * rowsPerPage)}</TableCell>
                      <TableCell align="left">{category.name}</TableCell>
                      <TableCell align="left">{category.catalog.name}</TableCell>
                      <TableCell align="center" width={'20%'}>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => openEditCategoryModal(category)}>
                            <Edit fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton onClick={() => deleteCategory(category)}>
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
        <Button variant="contained" className="global-btn" onClick={() => setOpenCreateModal(true)}>Buat Kategori Baru</Button>
      </div>
      <div className='table-content'>
        <div className='filter-group mb-50'>
          <div className='width-50'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Name</b></p>
              <TextField placeholder="Nama Kategori" variant="outlined" size='small' fullWidth value={searchName.current} onChange={e => handleSearchName(e.target.value)} />
            </div>
          </div>
          <div className='width-30'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Katalog</b></p>
              <Select
                className='text-align-left'
                renderValue={(selected: string[]) => selected.join(', ')}
                value={catalogSearchNames}
                variant="outlined"
                size='small'
                onChange={(e) => handleCatalogSeach(e.target.value as string[])}
                fullWidth
                multiple
              >
                {reduxCatalogs.map((c, i) => (
                  <MenuItem value={c.id}>
                    <Checkbox size='small' checked={catalogSearchIds.current.includes(c.id)} />
                    <ListItemText primary={c.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        {renderData()}
      </div>

      {/* create new category modal */}
      <Dialog open={openCreateModal} onClose={closeCreateModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Buat Kategori Baru</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <FormControl fullWidth className='mb-5 mt-5' variant="standard">
            <InputLabel className='mb-5 mt-5'>Katalog</InputLabel>
            <Select
              style={{ textAlign: "left" }}
              value={newCategory.catalog_id || reduxCatalogs[0]?.id}
              label="Katalog"
              variant="standard"
              disableUnderline
              onChange={(e) => setNewCategory({ ...newCategory, catalog_id: e.target.value })}
              fullWidth
            >
              {reduxCatalogs.map((c, i) => (
                <MenuItem value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>

          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={createCategory}
            color="primary"
            disabled={disableAddBtn}
          >
            Tambahkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* edit category modal */}
      <Dialog open={openEditModal} onClose={closeEditModal}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editCategory.name}
            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <FormControl fullWidth className='mb-5 mt-5' variant="standard">
            <InputLabel className='mb-5 mt-5'>Katalog</InputLabel>
            <Select
              style={{ textAlign: "left" }}
              value={editCategory.catalog_id}
              label="Katalog"
              variant="standard"
              disableUnderline
              onChange={(e) => setEditCategory({ ...editCategory, catalog_id: e.target.value })}
              fullWidth
            >
              {reduxCatalogs.map((c, i) => (
                <MenuItem value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>

          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={saveCategory}
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

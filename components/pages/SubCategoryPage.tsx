import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, InputLabel, FormControl, TablePagination, Checkbox, ListItemText } from '@mui/material'
import NoData from '../NoData'
import { Edit, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2'
import { Catalog } from '@/store/reducer/CatalogReducer'
import { CREATE_SUB_CATEGORY, DELETE_SUB_CATEGORY, FETCH_ALL_SUB_CATEGORIES, UPDATE_SUB_CATEGORY } from '@/store/actions/SubCategoryAction'
import { SubCategory as SubCategoryType } from '@/store/reducer/SubCategoryReducer'
import { Category } from '@/store/reducer/CategoryReducer'
import SwalModal from '@/helper/SwalModal'

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function SubCategory() {
  const reduxCatalogs = useSelector((state: RootStateType) => state.CatalogReducer.catalogs)
  const totalRow = useSelector((state: RootStateType) => state.SubCategoryReducer.totalRow)
  const reduxCategories = useSelector((state: RootStateType) => state.CategoryReducer.categories)
  const reduxSubCategories = useSelector((state: RootStateType) => state.SubCategoryReducer.sub_categories)
  const [newSubCategory, setNewSubCategory] = useState({
    name: '',
    category_id: ''
  })
  const [editSubCategory, setEditSubCategory] = useState<{ id: number; name: string; category_id: string }>({
    id: 0,
    name: '',
    category_id: ''
  })
  const [disableAddBtn, setDisableAddBtn] = useState(true)
  const [disableEditBtn, setDisableEditBtn] = useState(true)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const [categorySearchNames, setCategorySearchNames] = useState<string[]>(['Pilih Kategori'])
  const categorySearchIds = useRef<string[]>([])
  const [catalogSearchNames, setCatalogSearchNames] = useState<string[]>(['Pilih Katalog'])
  const catalogSearchIds = useRef<string[]>([])
  const searchName = useRef('')
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (newSubCategory.name) setDisableAddBtn(false)
    else setDisableAddBtn(true)
  }, [newSubCategory])

  useEffect(() => {
    setNewSubCategory({ ...newSubCategory, category_id: reduxCategories[0]?.id || '' })
  }, [reduxCategories])

  useEffect(() => {
    if (editSubCategory.name) setDisableEditBtn(false)
    else setDisableEditBtn(true)
  }, [editSubCategory])

  useEffect(() => {
    dispatch(FETCH_ALL_SUB_CATEGORIES({ limit: rowsPerPage, offset: page * rowsPerPage }))
  }, [])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page])

  const closeCreateModal = () => {
    setOpenCreateModal(false)
    setNewSubCategory({ name: '', category_id: reduxCategories[0].id })
    setDisableAddBtn(true)
  }

  const createSubCategory = (e: any) => {
    e.preventDefault()
    dispatch(CREATE_SUB_CATEGORY(newSubCategory))
    closeCreateModal()
  }

  const deleteSubCategory = async (subCategory: SubCategoryType) => {
    SwalModal({
      icon: 'question',
      text: `APA KAMU YAKIN INGIN MENGHAPUS ${subCategory.name}?`,
      action: () => dispatch(DELETE_SUB_CATEGORY(subCategory.id))
    })
  }

  const closeEditModal = () => {
    setOpenEditModal(false)
    setEditSubCategory({ id: 0, name: '', category_id: reduxCategories[0]?.id || '' })
    setDisableEditBtn(true)
  }

  const openEditSubCategoryModal = (subCategory: SubCategoryType) => {
    setEditSubCategory({ ...subCategory, category_id: subCategory.category.id })
    setOpenEditModal(true)
  }

  const saveSubCategory = (e: any) => {
    e.preventDefault()
    dispatch(UPDATE_SUB_CATEGORY(editSubCategory))
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

  const handleCategorySeach = (ids: string[]) => {
    const category = reduxCategories.find(c => c.id === ids[ids.length - 1]) as Category
    const idIndexOf = categorySearchIds.current.indexOf(category.id)
    const nameIndexOf = categorySearchNames.indexOf(category.name)
    let categoryNames: string[] = []
    let categoryIds: string[] = []

    if (idIndexOf === -1) categoryIds = [...categorySearchIds.current, category.id]
    else categoryIds = categorySearchIds.current.filter((_, i) => i !== idIndexOf)

    if (nameIndexOf === -1) categoryNames = [...categorySearchNames, category.name]
    else categoryNames = categorySearchNames.filter((_, i) => i !== nameIndexOf)

    if (categoryIds.length !== 0 && categoryNames.includes('Pilih Kategori')) {
      categoryNames.shift()
    }
    else if (categoryIds.length === 0) categoryNames.push('Pilih Kategori')

    setCategorySearchNames(categoryNames)
    categorySearchIds.current = categoryIds

    filterSearch()
  }

  const filterSearch = () => {
    let offset = page * rowsPerPage
    if (offset >= totalRow) offset = 0
    dispatch(FETCH_ALL_SUB_CATEGORIES({ name: searchName.current, catalogIds: catalogSearchIds.current, categoryIds: categorySearchIds.current, limit: rowsPerPage, offset }))
  }

  const renderData = () => {
    if (reduxSubCategories.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={'5%'}>No.</TableCell>
                    <TableCell align="left" width={'30%'}>Nama</TableCell>
                    <TableCell align="left" width={'25%'}>Kategori</TableCell>
                    <TableCell align="left" width={'25%'}>Katalog</TableCell>
                    <TableCell align="center" width={'15%'}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxSubCategories.map((subCategory, index) => (
                    <TableRow
                      key={subCategory.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center">{index + 1 + (page * rowsPerPage)}</TableCell>
                      <TableCell align="left">{subCategory.name}</TableCell>
                      <TableCell align="left">{subCategory.category.name}</TableCell>
                      <TableCell align="left">{subCategory.category.catalog.name}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => openEditSubCategoryModal(subCategory)}>
                            <Edit fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton onClick={() => deleteSubCategory(subCategory)}>
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
              rowsPerPageOptions={[1, 25, 50, 100]}
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

  const getCatalogName = (categoryId: string) => {
    return reduxCategories.find(c => c.id === categoryId)?.catalog.name
  }

  return (
    <div className="root-with-filter">
      <div className="register-container">
        <Button variant="contained" className="global-btn" onClick={() => setOpenCreateModal(true)}>Buat Sub Kategori Baru</Button>
      </div>
      <div className='table-content'>
        <div className='filter-group mb-50'>
          <div className='width-30'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Nama</b></p>
              <TextField placeholder="Nama Sub Kategori" variant="outlined" size='small' fullWidth value={searchName.current} onChange={e => handleSearchName(e.target.value)} />
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
          <div className='width-30'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Kategori</b></p>
              <Select
                className='text-align-left'
                renderValue={(selected: string[]) => selected.join(', ')}
                value={categorySearchNames}
                variant="outlined"
                size='small'
                onChange={(e) => handleCategorySeach(e.target.value as string[])}
                fullWidth
                multiple
              >
                {reduxCategories.map((c, i) => (
                  <MenuItem value={c.id}>
                    <Checkbox size='small' checked={categorySearchIds.current.includes(c.id)} />
                    <ListItemText primary={c.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        {renderData()}
      </div>

      {/* create new catalog modal */}
      <Dialog open={openCreateModal} onClose={closeCreateModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Buat Sub Kategori Baru</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={newSubCategory.name}
            onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Katalog"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={getCatalogName(newSubCategory.category_id)}
            fullWidth
            className='mb-5 mt-5'
            disabled
          />
          <FormControl fullWidth className='mb-5 mt-5' variant="standard">
            <InputLabel className='mb-5 mt-5'>Kategori</InputLabel>
            <Select
              style={{ textAlign: "left" }}
              value={newSubCategory.category_id || reduxCategories[0]?.id}
              label="Kategori"
              variant="standard"
              disableUnderline
              onChange={(e) => setNewSubCategory({ ...newSubCategory, category_id: e.target.value })}
              fullWidth
            >
              {reduxCategories.map((c, i) => (
                <MenuItem value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={createSubCategory}
            color="primary"
            disabled={disableAddBtn}
          >
            Tambahkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* edit sub categoru modal */}
      <Dialog open={openEditModal} onClose={closeEditModal}>
        <DialogTitle>Edit Sub Category</DialogTitle>
        <DialogContent style={{ width: '300px', margin: 'auto', textAlign: 'center' }}>
          <TextField
            margin="dense"
            label="Nama"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={editSubCategory.name}
            onChange={(e) => setEditSubCategory({ ...editSubCategory, name: e.target.value })}
            fullWidth
            className='mb-5 mt-5'
          />
          <TextField
            margin="dense"
            label="Katalog"
            type="text"
            InputProps={{ ...customTextInput }}
            variant="standard"
            value={getCatalogName(editSubCategory.category_id)}
            fullWidth
            className='mb-5 mt-5'
            disabled
          />
          <FormControl fullWidth className='mb-5 mt-5' variant="standard">
            <InputLabel className='mb-5 mt-5'>Kategori</InputLabel>
            <Select
              style={{ textAlign: "left" }}
              value={editSubCategory.category_id}
              label="Kategori"
              variant="standard"
              disableUnderline
              onChange={(e) => setEditSubCategory({ ...editSubCategory, category_id: e.target.value })}
              fullWidth
            >
              {reduxCategories.map((c, i) => (
                <MenuItem value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>

          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={saveSubCategory}
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

import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, InputLabel, FormControl, TablePagination, Checkbox, ListItemText, Collapse, Box, Typography } from '@mui/material'
import { tooltipClasses } from '@mui/material/Tooltip'
import NoData from '../NoData'
import { KeyboardArrowDown, KeyboardArrowUp, InfoOutlined, ImportExport, ArrowRightAlt } from '@mui/icons-material';
import { Supplier as SupplierType } from '@/store/reducer/SupplierReducer'
import { SET_ROUTE } from '@/store/actions/GlobalContextAction'
import { FETCH_ALL_SUPPLIES, UPDATE_SUPPLY } from '@/store/actions/SupplyAction'
import { Item as ItemType } from '@/store/reducer/ItemReducer'
import SwalModal from '@/helper/SwalModal'
import { Supply as SupplyType } from '@/store/reducer/SupplyReducer'
import { FETCH_ALL_ITEMS, UPDATE_ITEM } from '@/store/actions/ItemActions'
import { SubCategory } from '@/store/reducer/SubCategoryReducer'

export default function Item() {
  const reduxItems = useSelector((state: RootStateType) => state.ItemReducer.items)
  const reduxSuppliers = useSelector((state: RootStateType) => state.SupplierReducer.suppliers)
  const reduxSubCategories = useSelector((state: RootStateType) => state.SubCategoryReducer.sub_categories)
  const totalRow = useSelector((state: RootStateType) => state.SupplyReducer.totalRow)
  const [expandRow, setExpandRow] = useState(-1)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const keywords = useRef('')
  const [issuedDateOrderBy, setIssuedDateOrderBy] = useState<'ASC' | 'DESC' | ''>('')
  const [hover, setHover] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const [itemDescription, setItemDescription] = useState<Record<number, string>>({})

  const [supplierSearchNames, setSupplierSearchNames] = useState<string[]>(['Pilih Supplier'])
  const supplierSearchIds = useRef<string[]>([])

  const [subCategorySearchNames, setSubCategorySearchNames] = useState<string[]>(['Pilih Sub Kategori'])
  const subCategorySearchIds = useRef<number[]>([])

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(FETCH_ALL_ITEMS({ limit: rowsPerPage, offset: page * rowsPerPage }))
  }, [])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page])

  useEffect(() => {
    const val: Record<number, string> = {}
    reduxItems.forEach(v => val[v.id] = v.description || '-')
    setItemDescription(val)
  }, [reduxItems])

  useEffect(() => {
    if (issuedDateOrderBy) filterSearch([['supply.issued_date', issuedDateOrderBy]])
    else filterSearch()
  }, [issuedDateOrderBy])

  const handleSupplierSeach = (ids: string[]) => {
    const supplier = reduxSuppliers.find(s => s.id === ids[ids.length - 1]) as SupplierType
    const idIndexOf = supplierSearchIds.current.indexOf(supplier.id)
    const nameIndexOf = supplierSearchNames.indexOf(supplier.name)
    let supplierNames: string[] = []
    let supplierIds: string[] = []

    if (idIndexOf === -1) supplierIds = [...supplierSearchIds.current, supplier.id]
    else supplierIds = supplierSearchIds.current.filter((_, i) => i !== idIndexOf)

    if (nameIndexOf === -1) supplierNames = [...supplierSearchNames, supplier.name]
    else supplierNames = supplierSearchNames.filter((_, i) => i !== nameIndexOf)

    if (supplierIds.length !== 0 && supplierNames.includes('Pilih Supplier')) {
      supplierNames.shift()
    }
    else if (supplierIds.length === 0) supplierNames.push('Pilih Supplier')

    setSupplierSearchNames(supplierNames)
    supplierSearchIds.current = supplierIds

    filterSearch()
  }

  const handleSubCategorySeach = (ids: string[]) => {
    const subCategory = reduxSubCategories.find(s => +s.id === +ids[ids.length - 1]) as SubCategory
    const idIndexOf = subCategorySearchIds.current.indexOf(subCategory.id)
    const nameIndexOf = subCategorySearchNames.indexOf(subCategory.name)
    let subCategoryNames: string[] = []
    let subCategoryIds: number[] = []

    if (idIndexOf === -1) subCategoryIds = [...subCategorySearchIds.current, subCategory.id]
    else subCategoryIds = subCategorySearchIds.current.filter((_, i) => i !== idIndexOf)

    if (nameIndexOf === -1) subCategoryNames = [...subCategorySearchNames, subCategory.name]
    else subCategoryNames = subCategorySearchNames.filter((_, i) => i !== nameIndexOf)

    if (subCategoryIds.length !== 0 && subCategoryNames.includes('Pilih Sub Kategori')) {
      subCategoryNames.shift()
    }
    else if (subCategoryIds.length === 0) subCategoryNames.push('Pilih Sub Kategori')

    setSubCategorySearchNames(subCategoryNames)
    subCategorySearchIds.current = subCategoryIds

    filterSearch()
  }

  const handleSearchName = (value: string) => {
    keywords.current = value
    clearTimeout(debounceTimer)
    const timeout = setTimeout(() => {
      filterSearch()
    }, 1000)
    setDebounceTimer(timeout)
  }

  const filterSearch = (orderBy?: [string, "ASC" | "DESC"][]) => {
    let offset = page * rowsPerPage
    if (offset >= totalRow) offset = 0
    dispatch(FETCH_ALL_ITEMS({ keywords: keywords.current, limit: rowsPerPage, offset: page * rowsPerPage, supplierIds: supplierSearchIds.current, subCategoryIds: subCategorySearchIds.current, orderBy }))
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

  const moveToCreatePage = () => dispatch(SET_ROUTE('create-supply'))

  const parseDate = (d: Date) => {
    const parseNumber = (n: number) => {
      if (n < 10) return `0${n}`
      return `${n}`
    }
    const date = new Date(d)
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    return `${parseNumber(day)}/${parseNumber(month + 1)}/${year}`
  }

  const parseCurrency = (n: number) => `Rp. ${n.toLocaleString('id')}`

  const handleSortIssuedDate = () => {
    switch (issuedDateOrderBy) {
      case "":
        setIssuedDateOrderBy("ASC")
        break;
      case "ASC":
        setIssuedDateOrderBy("DESC")
        break;
      case "DESC":
        setIssuedDateOrderBy("")
        break;
    }
  }

  const renderSortIssuedDate = () => {
    if (!issuedDateOrderBy) return <ImportExport className="btn-sort" onClick={handleSortIssuedDate} />
    return <ArrowRightAlt className={`btn-sort ${issuedDateOrderBy === 'ASC' ? 'up' : 'down'}`} onClick={handleSortIssuedDate} />
  }

  const handleDescriptionChange = (id: number, value: string) => setItemDescription({ ...itemDescription, [id]: value })

  const handleDescriptionOnBlur = (id: number) => {
    const val = itemDescription[id]
    if (!val) setItemDescription({...itemDescription, [id]: '-'})

    dispatch(UPDATE_ITEM({id, description: itemDescription[id]}))
  }

  const renderData = () => {
    if (reduxItems.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width='5%'>No.</TableCell>
                    <TableCell align="left" width='20%'>ID</TableCell>
                    <TableCell align="left" width='25%'>Sub Kategori</TableCell>
                    <TableCell align="center" width='25%'>Rak</TableCell>
                    <TableCell align="center" width='25%' colSpan={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Tanggal Masuk
                        {renderSortIssuedDate()}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxItems.map((item, index) => (
                    <>
                      <TableRow
                        key={item.id}
                        sx={{ '& > *': { borderBottom: 'unset !important' } }}
                        onMouseOver={() => setHover(index + 1)}
                        onMouseOut={() => setHover(0)}
                        onClick={() => { handleExpandRow(index) }}
                        className={hover === index + 1 ? "table-row-hover" : ""}
                      >
                        <TableCell align="center" width='10%'>{index + 1 + (page * rowsPerPage)}</TableCell>
                        <TableCell align="left">{item.unique_id}</TableCell>
                        <TableCell align="left">{item.sub_category.name}</TableCell>
                        <TableCell align="center">{item.rack.name}</TableCell>
                        <TableCell align="center">{parseDate(item.supply.issued_date)}</TableCell>
                        <TableCell align="center">
                          {renderCollapsibleArrow(index)}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        className={hover === index + 1 ? "table-row-hover" : ""}
                        onMouseOver={() => setHover(index + 1)}
                        onMouseOut={() => setHover(0)}
                      >
                        <TableCell className='p-0' />
                        <TableCell align="left" colSpan={4} className='p-0'>
                          <Collapse in={expandRow === index} timeout="auto" unmountOnExit>
                            <Box className='ml-40 mb-15'>
                              <Box className='d-flex flex-space-between' width='80%'>
                                <Box className='width-20'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Supplier</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-80 ml-10' textAlign="justify">
                                  <Typography variant='caption'>{item.supply.supplier.name}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between' width='80%'>
                                <Box className='width-20'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Stok</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-80 ml-10' textAlign="justify">
                                  <Typography variant='caption'>{item.stock}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between' width='80%'>
                                <Box className='width-20'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Harga Beli</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-80 ml-10' textAlign="justify">
                                  <Typography variant='caption'>{parseCurrency(item.buying_price)}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between' width='80%'>
                                <Box className='width-20'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Harga Jual</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-80 ml-10' textAlign="justify">
                                  <Typography variant='caption'>{parseCurrency(item.selling_price)}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between' width='80%'>
                                <Box className='width-20'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography sx={{ marginTop: '2.5px' }} variant='caption'>Deskripsi</Typography>
                                    <Typography sx={{ marginTop: '2.5px' }} variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-80 ml-10' textAlign="justify">
                                  <TextField
                                    type="text"
                                    InputProps={{ disableUnderline: true }}
                                    variant="standard"
                                    value={itemDescription[item.id]}
                                    onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                                    size='small'
                                    sx={{ marginTop: '0px !important' }}
                                    inputProps={{ style: { fontSize: '12px', textAlign: 'justify' } }}
                                    // onBlur={e => {
                                    //   console.log("out", e.target.value);
                                    // }}
                                    onBlur={e => handleDescriptionOnBlur(item.id)}
                                    fullWidth
                                    className='mb-5 mt-5'
                                    multiline
                                  />

                                  {/* <Typography variant='caption'>{ item.description || '-' }</Typography> */}
                                </Box>
                              </Box>
                              {/* <Box className='ml-40 mb-15'>
                              <Box className='d-flex flex-space-between' width='80%'>
                                <Box className='width-20'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Tanggal Masuk</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-80 ml-10' textAlign="justify">
                                  <Typography variant='caption'>{parseDate(s.issued_date)}</Typography>
                                </Box>
                              </Box> */}
                              {/* <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'><span style={{ fontWeight: "bold" }}>Barang</span></Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-column flex-space-between ml-15'>
                                {s.json_data.map((i: ItemType) => renderItem(i))}
                              </Box>
                              <Box className='d-flex flex-end ml-15 mb-5 mt-5' width='60%'>
                                <Box sx={{ backgroundColor: 'black', height: '1px' }} width='65%' />
                              </Box>
                              <Box className='d-flex flex-end mb-5 mt-5 pr-50' width='60%'>
                                <Typography variant='caption'><span style={{ fontWeight: "bold" }}>{parseCurrency(s.total_price)}</span></Typography>
                              </Box> */}

                              {/* {renderSupplierDetail(s)} */}

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
        <Button variant="contained" className="global-btn" onClick={moveToCreatePage}>Buat Supply Baru</Button>
      </div>
      <div className='table-content'>
        <div className='filter-group mb-50'>
          <div className='width-30'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Invoice</b></p>
              <TextField placeholder="Masukkan Invoice" variant="outlined" size='small' fullWidth value={keywords.current} onChange={e => handleSearchName(e.target.value)} />
            </div>
          </div>
          <div className='width-30'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Supplier</b></p>
              <Select
                className='text-align-left'
                renderValue={(selected: string[]) => selected.join(', ')}
                value={supplierSearchNames}
                variant="outlined"
                size='small'
                onChange={(e) => handleSupplierSeach(e.target.value as string[])}
                fullWidth
                multiple
              >
                {reduxSuppliers.map((s, i) => (
                  <MenuItem value={s.id}>
                    <Checkbox size='small' checked={supplierSearchIds.current.includes(s.id)} />
                    <ListItemText primary={s.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className='width-30'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Sub Kategori</b></p>
              <Select
                className='text-align-left'
                renderValue={(selected: string[]) => selected.join(', ')}
                value={subCategorySearchNames}
                variant="outlined"
                size='small'
                onChange={(e) => handleSubCategorySeach(e.target.value as string[])}
                fullWidth
                multiple
              >
                {reduxSubCategories.map((s, i) => (
                  <MenuItem value={s.id}>
                    <Checkbox size='small' checked={subCategorySearchIds.current.includes(s.id)} />
                    <ListItemText primary={s.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {renderData()}

      </div>
    </div>
  )
}

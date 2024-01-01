import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { Button, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, TablePagination, Checkbox, ListItemText, Collapse, Box, Typography } from '@mui/material'
import { tooltipClasses } from '@mui/material/Tooltip'
import NoData from '../NoData'
import { KeyboardArrowDown, KeyboardArrowUp, InfoOutlined, ImportExport, ArrowRightAlt } from '@mui/icons-material';
import { Supplier as SupplierType } from '@/store/reducer/SupplierReducer'
import { SET_ROUTE } from '@/store/actions/GlobalContextAction'
import { FETCH_ALL_SUPPLIES, UPDATE_SUPPLY } from '@/store/actions/SupplyAction'
import { Item } from '@/store/reducer/ItemReducer'
import SwalModal from '@/helper/SwalModal'
import { Supply as SupplyType } from '@/store/reducer/SupplyReducer'
import parseNumber from '@/helper/parseNumber'

export default function Supply() {
  const reduxSupplies = useSelector((state: RootStateType) => state.SupplyReducer.supplies)
  const reduxSuppliers = useSelector((state: RootStateType) => state.SupplierReducer.suppliers)
  const totalRow = useSelector((state: RootStateType) => state.SupplyReducer.totalRow)
  const [expandRow, setExpandRow] = useState(-1)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const keywords = useRef('')
  const [dueDateOrderBy, setDueDateOrderBy] = useState<'ASC' | 'DESC' | ''>('')
  const [hover, setHover] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const [transactionDescription, setTransactionDescription] = useState<Record<string, string>>({})
  const [supplierSearchNames, setSupplierSearchNames] = useState<string[]>(['Pilih Supplier'])
  const supplierSearchIds = useRef<string[]>([])
  const [paidSearchNames, setPaidSearchNames] = useState<string[]>(['Tidak Ada Yang Dipilih'])
  const paidSearchValues = useRef<boolean[]>([])

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(FETCH_ALL_SUPPLIES({ limit: rowsPerPage, offset: page * rowsPerPage }))
  }, [])

  useEffect(() => {
    const val: Record<string, string> = {}
    reduxSupplies.forEach(v => val[v.id] = v.notes || '-')
    setTransactionDescription(val)
  }, [reduxSupplies])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page])

  useEffect(() => {
    if (dueDateOrderBy) filterSearch([['due_date', dueDateOrderBy]])
    else filterSearch()
  }, [dueDateOrderBy])

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

  const handlePaidSeach = (ids: string[]) => {
    const mapValues = {
      'true': 'LUNAS',
      'false': 'BELUM LUNAS'
    }
    const value = ids[ids.length - 1] === "true"
    const strVal = String(value) as keyof typeof mapValues
    const idIndexOf = paidSearchValues.current.indexOf(value)
    const nameIndexOf = paidSearchNames.indexOf(mapValues[strVal])
    let paidNames: string[] = []
    let paidValues: boolean[] = []

    if (idIndexOf === -1) paidValues = [...paidSearchValues.current, value]
    else paidValues = paidSearchValues.current.filter((_, i) => i !== idIndexOf)

    if (nameIndexOf === -1) paidNames = [...paidSearchNames, mapValues[strVal]]
    else paidNames = paidSearchNames.filter((_, i) => i !== nameIndexOf)

    if (paidValues.length !== 0 && paidNames.includes('Tidak Ada Yang Dipilih')) {
      paidNames.shift()
    }
    else if (paidValues.length === 0) paidNames.push('Tidak Ada Yang Dipilih')

    setPaidSearchNames(paidNames)
    paidSearchValues.current = paidValues

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

    dispatch(FETCH_ALL_SUPPLIES({ keywords: keywords.current, limit: rowsPerPage, offset: page * rowsPerPage, supplierIds: supplierSearchIds.current, paid: paidSearchValues.current, orderBy }))
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
    const date = new Date(d)
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    return `${parseNumber(day)}/${parseNumber(month + 1)}/${year}`
  }

  const renderItem = (item: Item, liveItem: Item) => {
    const priceCode = '0000'
    const el = [<Typography variant='caption'>{item.unique_id}{priceCode}</Typography>]
    let tooltipText = item.name
    if (liveItem.description) tooltipText += ` (${liveItem.description})`
    el.push((
      <Tooltip title={tooltipText} arrow sx={{
        [`& .${tooltipClasses.tooltip}`]: {
          maxWidth: 'none',
        }
      }}>
        <InfoOutlined style={{ fontSize: '14px', marginLeft: '5px' }} />
      </Tooltip>
    ))

    return (
      <Box className='d-flex mt-2 align-items-center justify-content-between' width='100%'>
        <Box width={"25%"} className="d-flex align-items-center">{el}</Box>
        <Box width={"25%"} className='d-flex flex-space-between'>
          <Typography variant='caption'>{parseCurrency(item.buying_price)}</Typography>
          <Typography variant='caption'>x</Typography>
        </Box>
        <Box width={"25%"} className='flex-center'>
          <Typography variant='caption'>{item.stock} {liveItem.unit}</Typography>
        </Box>
        <Box width={"25%"} className='d-flex flex-between pr-10'>
          <Typography variant='caption' className='mr-10'>=</Typography>
          <Typography variant='caption'>{parseCurrency(item.buying_price * item.stock)}</Typography>
        </Box>
      </Box>
    )
  }

  const paySupply = (supply: SupplyType) => {
    SwalModal({
      icon: "question",
      html: `Ubah status pembayaran invoice ${supply.invoice_number} menjadi lunas?<br/>Status pembayaran tidak dapat diubah lagi.`,
      action() {
        dispatch(UPDATE_SUPPLY({ id: supply.id, is_paid: true }))
      }
    })
  }

  const renderSupplierDetail = (s: SupplyType) => {
    if (s.is_paid) return (<></>)
    return (<>
      <Box className='d-flex flex-space-between' width="100%">
        <Box className='width-20'>
          <Box className='d-flex flex-space-between'>
            <Typography variant='caption'>No. Rekening</Typography>
            <Typography variant='caption'>:</Typography>
          </Box>
        </Box>
        <Box className='width-80 ml-10' textAlign='justify'>
          <Typography variant='caption'>{s.supplier.account_number}</Typography>
        </Box>
      </Box>
      <Box className='d-flex flex-space-between' width='100%'>
        <Box className='width-20'>
          <Box className='d-flex flex-space-between'>
            <Typography variant='caption'>Bank</Typography>
            <Typography variant='caption'>:</Typography>
          </Box>
        </Box>
        <Box className='width-80 ml-10' textAlign='justify'>
          <Typography variant='caption'>{s.supplier.bank_name}</Typography>
        </Box>
      </Box>
      <Box className='d-flex flex-space-between' width='100%'>
        <Box className='width-20'>
          <Box className='d-flex flex-space-between'>
            <Typography variant='caption'>PIC</Typography>
            <Typography variant='caption'>:</Typography>
          </Box>
        </Box>
        <Box className='width-80 ml-10' textAlign='justify'>
          <Typography variant='caption'>{s.supplier.contact_info} ({s.supplier.contact_person})</Typography>
        </Box>
      </Box>
      <Box className='d-flex flex-space-between' width='100%'>
        <Box className='width-20'>
          <Box className='d-flex flex-space-between'>
            <Typography variant='caption'>Catatan Supplier</Typography>
            <Typography variant='caption'>:</Typography>
          </Box>
        </Box>
        <Box className='width-80 ml-10' textAlign='justify'>
          <Typography variant='caption'>{s.supplier.notes || '-'}</Typography>
        </Box>
      </Box>
      <Box className="d-flex flex-row-reverse">
        <Button variant="contained" className="global-btn" sx={{ height: '14px' }} onClick={() => paySupply(s)}>
          <Typography sx={{ fontSize: '8px !important' }}>Bayar</Typography>
        </Button>
      </Box>
    </>)
  }

  const parseCurrency = (n: number) => `Rp. ${n.toLocaleString('id')}`

  const handleSortDueDate = () => {
    switch (dueDateOrderBy) {
      case "":
        setDueDateOrderBy("ASC")
        break;
      case "ASC":
        setDueDateOrderBy("DESC")
        break;
      case "DESC":
        setDueDateOrderBy("")
        break;
    }
  }

  const renderSortDueDate = () => {
    if (!dueDateOrderBy) return <ImportExport className="btn-sort" onClick={handleSortDueDate} />
    return <ArrowRightAlt className={`btn-sort ${dueDateOrderBy === 'ASC' ? 'up' : 'down'}`} onClick={handleSortDueDate} />
  }

  const handleDescriptionChange = (id: string, value: string) => setTransactionDescription({ ...transactionDescription, [id]: value })

  const handleDescriptionOnBlur = (id: string) => {
    const val = transactionDescription[id]
    if (!val) setTransactionDescription({ ...transactionDescription, [id]: '-' })

    dispatch(UPDATE_SUPPLY({ id, notes: transactionDescription[id] }))
  }

  const renderData = () => {
    if (reduxSupplies.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width='5%'>No.</TableCell>
                    <TableCell align="left" width='20%'>Invoice</TableCell>
                    <TableCell align="left" width='25%'>Supplier</TableCell>
                    <TableCell align="center" width='25%'>Status</TableCell>
                    <TableCell align="center" width='20%'>
                      <Box>
                        Jatuh Tempo
                        {renderSortDueDate()}
                      </Box>
                    </TableCell>
                    <TableCell align="center" width='5%'></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxSupplies.map((s, index) => (
                    <>
                      <TableRow
                        key={s.id}
                        sx={{ '& > *': { borderBottom: 'unset !important' } }}
                        onMouseOver={() => setHover(index + 1)}
                        onMouseOut={() => setHover(0)}
                        onClick={() => { handleExpandRow(index) }}
                        className={hover === index + 1 ? "table-row-hover" : ""}
                      >
                        <TableCell align="center" width='10%'>{index + 1 + (page * rowsPerPage)}</TableCell>
                        <TableCell align="left">{s.invoice_number}</TableCell>
                        <TableCell align="left">{s.supplier.name}</TableCell>
                        <TableCell align="center">{s.is_paid ? 'LUNAS' : 'BELUM LUNAS'}</TableCell>
                        <TableCell align="center">{parseDate(s.due_date)}</TableCell>
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
                              <Box className='d-flex flex-space-between' width='100%'>
                                <Box className='width-20'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Tanggal Masuk</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-80 ml-10' textAlign="justify">
                                  <Typography variant='caption'>{parseDate(s.issued_date)}</Typography>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-space-between'>
                                <Box className='width-25'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'><span style={{ fontWeight: "bold" }}>Barang</span></Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Box className='d-flex flex-column flex-space-between ml-15'>
                                {s.json_data.map((item: Item, index: number) => renderItem(item, s.items[index] || item))}
                              </Box>
                              <Box className='d-flex flex-end ml-15 mb-5 mt-5'>
                                <Box sx={{ backgroundColor: 'black', height: '1px' }} width='75%' />
                              </Box>
                              <Box className='d-flex flex-end mb-5 mt-5 pr-10'>
                                <Typography variant='caption'><span style={{ fontWeight: "bold" }}>{parseCurrency(s.total_price)}</span></Typography>
                              </Box>
                              <Box className='d-flex flex-space-between' width='100%'>
                                <Box className='width-20'>
                                  <Box className='d-flex flex-space-between'>
                                    <Typography variant='caption'>Catatan Transaksi</Typography>
                                    <Typography variant='caption'>:</Typography>
                                  </Box>
                                </Box>
                                <Box className='width-80 ml-10' textAlign='justify'>
                                  <TextField
                                      type="text"
                                      InputProps={{ disableUnderline: true }}
                                      variant="standard"
                                      value={transactionDescription[s.id]}
                                      onChange={(e) => handleDescriptionChange(s.id, e.target.value)}
                                      size='small'
                                      sx={{ marginTop: '0px !important' }}
                                      inputProps={{ style: { fontSize: '12px', textAlign: 'justify' } }}
                                      onBlur={e => handleDescriptionOnBlur(s.id)}
                                      fullWidth
                                      className='mb-5 mt-5'
                                      multiline
                                    />
                                </Box>
                              </Box>
                              {renderSupplierDetail(s)}
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
              <p className='mb-10'><b>Status</b></p>
              <Select
                className='text-align-left'
                renderValue={(selected: string[]) => selected.join(', ')}
                value={paidSearchNames}
                variant="outlined"
                size='small'
                onChange={(e) => handlePaidSeach(e.target.value as string[])}
                fullWidth
                multiple
              >
                <MenuItem value={'true'}>
                  <Checkbox size='small' checked={paidSearchValues.current.includes(true)} />
                  <ListItemText primary={'LUNAS'} />
                </MenuItem>
                <MenuItem value={'false'}>
                  <Checkbox size='small' checked={paidSearchValues.current.includes(false)} />
                  <ListItemText primary={'BELUM LUNAS'} />
                </MenuItem>
              </Select>
            </div>
          </div>
        </div>

        {renderData()}

      </div>
    </div>
  )
}

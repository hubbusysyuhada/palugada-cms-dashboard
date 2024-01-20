import { useEffect, useRef, useState } from 'react'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, TablePagination, Checkbox, ListItemText, Collapse, Box, Typography, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material'
import NoData from '../NoData'
import { KeyboardArrowDown, KeyboardArrowUp, ArrowRightAlt, ProductionQuantityLimits, AddShoppingCart, BarChart, Settings, Print } from '@mui/icons-material';
import { SET_ROUTE } from '@/store/actions/GlobalContextAction'
import { FETCH_ALL_TRANSACTIONS } from '@/store/actions/TransactionAction'
import { Transaction as TransactionType, TypeOfTransactionType } from '@/store/reducer/TransactionReducer'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import parseNumber from '@/helper/parseNumber'
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import generatePdfMetadata from '@/helper/generatePdfMetadata'
import parseCurrency from '@/helper/parseCurrency'

export default function Transaction(props: { base64Logo: string }) {
  const reduxTransactions = useSelector((state: RootStateType) => state.TransactionReducer.transactions)
  const totalRow = useSelector((state: RootStateType) => state.TransactionReducer.totalRow)
  const [expandRow, setExpandRow] = useState(-1)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const keywords = useRef('')
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null)
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null)
  const [createdAtOrderBy, setCreatedAtOrderBy] = useState<'ASC' | 'DESC'>('DESC')
  const [hover, setHover] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(0)
  const [transactionTypeSearchValue, setTransactionTypeSearchValue] = useState<string[]>(['Tidak Ada Yang Dipilih'])
  const typeSearchValue = useRef<string[]>([])

  const dispatch = useAppDispatch()

  useEffect(() => {
    filterSearch([['created_at', createdAtOrderBy]])
  }, [])

  useEffect(() => {
    filterSearch()
  }, [rowsPerPage, page, startDate, endDate])

  useEffect(() => {
    if (createdAtOrderBy) filterSearch([['created_at', createdAtOrderBy]])
    else filterSearch()
  }, [createdAtOrderBy])

  const handleTransactionTypeSeach = (values: string[]) => {
    const mapValues = {
      'OUT': 'KELUAR',
      'IN': 'MASUK'
    }
    const value = values[values.length - 1] as keyof typeof mapValues
    const indexOf = typeSearchValue.current.indexOf(value)
    const nameIndexOf = transactionTypeSearchValue.indexOf(mapValues[value])
    let paidNames: string[] = []
    let typeValues: string[] = []

    if (indexOf === -1) typeValues = [...typeSearchValue.current, value]
    else typeValues = typeSearchValue.current.filter((_, i) => i !== indexOf)

    if (nameIndexOf === -1) paidNames = [...transactionTypeSearchValue, mapValues[value]]
    else paidNames = transactionTypeSearchValue.filter((_, i) => i !== nameIndexOf)

    if (typeValues.length !== 0 && paidNames.includes('Tidak Ada Yang Dipilih')) {
      paidNames.shift()
    }
    else if (typeValues.length === 0) paidNames.push('Tidak Ada Yang Dipilih')

    setTransactionTypeSearchValue(paidNames)
    typeSearchValue.current = typeValues

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
    let parsedStartDate, parsedEndDate = ''
    const dayJsToString = (d: dayjs.Dayjs) => {
      const date = parseNumber(d.get('D'))
      const month = parseNumber(d.get('M') + 1)
      const year = d.get('years')
      return `${month}/${date}/${year}`
    }
    if (startDate) parsedStartDate = dayJsToString(startDate)
    if (endDate) parsedEndDate = dayJsToString(endDate) + ' 23:59:59'

    dispatch(FETCH_ALL_TRANSACTIONS({ keywords: keywords.current, limit: rowsPerPage, offset: page * rowsPerPage, orderBy, startDate: parsedStartDate, endDate: parsedEndDate, type: typeSearchValue.current as TypeOfTransactionType[] }))
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

  const moveToPage = (type: string) => dispatch(SET_ROUTE(type))

  const formatDate = (d: Date) => {
    const date = new Date(d)
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    return `${parseNumber(day)}/${parseNumber(month + 1)}/${year}`
  }

  const handleSortCreatedAt = () => {
    switch (createdAtOrderBy) {
      case "ASC":
        setCreatedAtOrderBy("DESC")
        break;
      case "DESC":
        setCreatedAtOrderBy("ASC")
        break;
    }
  }

  const renderSortCreatedAt = () => {
    return <ArrowRightAlt className={`btn-sort ${createdAtOrderBy === 'ASC' ? 'up' : 'down'}`} onClick={handleSortCreatedAt} />
  }

  const renderTransactionType = (type: TypeOfTransactionType) => {
    return (
      <div className='flex-center'>
        <div className={`bullet mr-5 ${type === 'OUT' ? 'red' : 'green'}`}></div>
        <Typography variant='caption'>{type === 'OUT' ? 'KELUAR' : 'MASUK'}</Typography>
      </div>
    )
  }

  const printPdf = async (t: TransactionType) => {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const metadata = await generatePdfMetadata(t, props.base64Logo)
    pdfMake.createPdf(metadata).open();
  }

  const renderTransactionDetail = (t: TransactionType) => {
    if (t.type === 'IN') return (
      <Box className='ml-40 mb-15'>
        <Box className='d-flex flex-space-between' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'>Nama Pelanggan</Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign="justify">
            <Typography variant='caption'>{t.customer_name}</Typography>
          </Box>
        </Box>
        <Box className='d-flex flex-space-between' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'>Nomor HP</Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign="justify">
            <Typography variant='caption'>{t.customer_phone}</Typography>
          </Box>
        </Box>
        <Box className='d-flex flex-space-between' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'>Kendaraan</Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign="justify">
            <Typography variant='caption'>{t.vehicle_type}</Typography>
          </Box>
        </Box>
        <Box className='d-flex flex-space-between' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'>Nomor Kendaraan</Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign="justify">
            <Typography variant='caption'>{t.plate_number}</Typography>
          </Box>
        </Box>
        <Box className='d-flex flex-space-between mt-10'>
          <Box className='width-25'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'><span style={{ fontWeight: "bold" }}>Rincian</span></Typography>
            </Box>
          </Box>
        </Box>

        <Box className='d-flex flex-space-between ml-15 mt-5'>
          <Box className='width-25'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'><span style={{ fontWeight: "bold" }}>Mekanik</span></Typography>
            </Box>
          </Box>
        </Box>
        <Box className='d-flex flex-column flex-space-between ml-30 mb-10'>
          {t.mechanics.map((mechanic, index) => (
            <Box className='d-flex mt-2 align-items-center justify-content-between' width='100%'>
              <Box className='d-flex flex-between'>
                <Typography variant='caption' className='mr-10'>{index + 1}.</Typography>
                <Typography variant='caption'>{mechanic.name}</Typography>
              </Box>
            </Box>
          ))}
        </Box>


        <Box className='d-flex flex-space-between ml-15 mt-5'>
          <Box className='width-25'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'><span style={{ fontWeight: "bold" }}>Jasa</span></Typography>
            </Box>
          </Box>
        </Box>
        <Box className='d-flex flex-column flex-space-between ml-30 mb-10'>
          {t.additional_services.map((service, index) => (
            <Box className='d-flex mt-2 align-items-center justify-content-between' width='100%'>
              <Box width={"25%"} className="d-flex">
                <Typography variant='caption' className='mr-10'>{index + 1}.</Typography>
                <Typography variant='caption'>{service.name}</Typography>
              </Box>
              <Box className='d-flex flex-between pr-10'>
                <Typography variant='caption' className='mr-10'>=</Typography>
                <Typography variant='caption'>{parseCurrency(service.price)}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box className='d-flex flex-space-between ml-15 mt-5'>
          <Box className='width-25'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'><span style={{ fontWeight: "bold" }}>Barang</span></Typography>
            </Box>
          </Box>
        </Box>
        <Box className='d-flex flex-column flex-space-between ml-30 mb-10'>
          {t.transaction_items.map((ti, index) => (
            <Box className='d-flex mt-2 justify-content-between' width='100%'>
              <Box width={"50%"} className="d-flex">
                <Typography variant='caption' className='mr-10'>{index + 1}.</Typography>
                <Typography variant='caption'>{ti.item.unique_id} - {ti.item.name}</Typography>
              </Box>
              <Box className="d-flex">
                <Typography variant='caption' className='mr-10'>{ti.amount} {ti.item.unit}</Typography>
                <Typography variant='caption' className='mr-10'>x</Typography>
                <Typography variant='caption' className='mr-10'>{parseCurrency(ti.item.selling_price)}</Typography>
                <Typography variant='caption' className='mr-10'>=</Typography>
                <Typography variant='caption'>{parseCurrency(ti.item.selling_price * ti.amount)}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box className='d-flex flex-space-between' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'><span style={{ fontWeight: "bold" }}>Potongan</span></Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign="justify">
            <Typography variant='caption'><span style={{ fontWeight: "bold" }}>{parseCurrency(t.discount)}</span></Typography>
          </Box>
        </Box>

        <Box className='d-flex flex-space-between mt-20' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'>Catatan Transaksi</Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign='justify'>
            <Typography variant='caption'>{t.notes || '-'}</Typography>
          </Box>
        </Box>


        <Box className="d-flex flex-row-reverse">
          <Tooltip title="Cetak Kwitansi">
            <IconButton onClick={() => printPdf(t)}>
              <Print sx={{ color: '#6A32CB' }} fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    )

    else return (
      <Box className='ml-40 mb-15'>
        <Box className='d-flex flex-space-between' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'>Penanggung Jawab</Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign="justify">
            <Typography variant='caption'>{t.customer_name}</Typography>
          </Box>
        </Box>
        <Box className='d-flex flex-space-between' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'>Nomor HP</Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign="justify">
            <Typography variant='caption'>{t.customer_phone}</Typography>
          </Box>
        </Box>
        <Box className='d-flex flex-space-between mt-10'>
          <Box className='width-25'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'><span style={{ fontWeight: "bold" }}>Rincian</span></Typography>
            </Box>
          </Box>
        </Box>
        <Box className='d-flex flex-column flex-space-between ml-15 mb-10'>
          {t.additional_services.map((service, index) => (
            <Box className='d-flex mt-2 align-items-center justify-content-between' width='100%'>
              <Box width={"25%"} className="d-flex align-items-center"><Typography variant='caption'>{service.name}</Typography></Box>
              <Box className='d-flex flex-between pr-10'>
                <Typography variant='caption' className='mr-10'>=</Typography>
                <Typography variant='caption'>{parseCurrency(service.price)}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box className='d-flex flex-space-between' width='100%'>
          <Box className='width-20'>
            <Box className='d-flex flex-space-between'>
              <Typography variant='caption'>Catatan Transaksi</Typography>
              <Typography variant='caption'>:</Typography>
            </Box>
          </Box>
          <Box className='width-80 ml-10' textAlign='justify'>
            <Typography variant='caption'>{t.notes || '-'}</Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  const renderData = () => {
    if (reduxTransactions.length) {
      return (
        <div className="table-container">
          <Paper>
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width='5%'>No.</TableCell>
                    <TableCell align="left" width='20%'>Nomor Kwitansi</TableCell>
                    <TableCell align="center" width='25%'>Status</TableCell>
                    <TableCell align="left" width='25%'>Total</TableCell>
                    <TableCell align="center" width='20%'>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Tanggal
                        {renderSortCreatedAt()}
                      </Box>
                    </TableCell>
                    <TableCell align="center" width='5%'></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduxTransactions.map((transaction, index) => (
                    <>
                      <TableRow
                        key={transaction.id}
                        sx={{ '& > *': { borderBottom: 'unset !important' } }}
                        onMouseOver={() => setHover(index + 1)}
                        onMouseOut={() => setHover(0)}
                        onClick={() => { handleExpandRow(index) }}
                        className={hover === index + 1 ? "table-row-hover" : ""}
                      >
                        <TableCell align="center">{index + 1 + (page * rowsPerPage)}</TableCell>
                        <TableCell align="left">{transaction.invoice}</TableCell>
                        <TableCell align="center">{renderTransactionType(transaction.type)}</TableCell>
                        <TableCell align="left">{parseCurrency(transaction.total_price)}</TableCell>
                        <TableCell align="left">{formatDate(transaction.created_at)}</TableCell>
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
                            {renderTransactionDetail(transaction)}
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
        <SpeedDial ariaLabel='speed dial for transaction action' direction='down' icon={<SpeedDialIcon icon={<Settings />} />} FabProps={{ sx: { bgcolor: "#6A32CB", '&:hover': { bgcolor: "#6A32CB" } } }}>
          <SpeedDialAction key="add" icon={<AddShoppingCart onClick={() => moveToPage('create-transaction-in')} />} tooltipTitle="Tambah Transaksi Masuk" />
          <SpeedDialAction key="add" icon={<ProductionQuantityLimits onClick={() => moveToPage('create-transaction-out')} />} tooltipTitle="Tambah Transaksi Keluar" />
          <SpeedDialAction key="add" icon={<BarChart onClick={() => moveToPage('insight')} />} tooltipTitle="Statistik" />
        </SpeedDial>
      </div>
      <div className='table-content width-80'>
        <div className='filter-group mb-50'>
          <div className='width-25'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Kata Kunci</b></p>
              <TextField placeholder="Masukkan Kata Kunci" variant="outlined" size='small' fullWidth value={keywords.current} onChange={e => handleSearchName(e.target.value)} />
            </div>
          </div>
          <div className='width-25'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Tanggal Awal</b></p>
              <DatePicker
                format="DD/MM/YYYY"
                className="datepicker-search-form"
                value={null}
                maxDate={endDate}
                onChange={value => setStartDate(value)}
                slotProps={{ field: { clearable: true } }}
              />
            </div>
          </div>
          <div className='width-25'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Tanggal Akhir</b></p>
              <DatePicker
                format="DD/MM/YYYY"
                className="datepicker-search-form"
                value={null}
                minDate={startDate}
                onChange={value => setEndDate(value)}
                slotProps={{ field: { clearable: true } }}
              />
            </div>
          </div>
          <div className='width-20'>
            <div className='text-align-left'>
              <p className='mb-10'><b>Status</b></p>
              <Select
                className='text-align-left'
                renderValue={(selected: string[]) => selected.join(', ')}
                value={transactionTypeSearchValue}
                variant="outlined"
                size='small'
                onChange={(e) => handleTransactionTypeSeach(e.target.value as string[])}
                fullWidth
                multiple
              >
                <MenuItem value={'OUT'}>
                  <Checkbox size='small' checked={typeSearchValue.current.includes('OUT')} />
                  <ListItemText primary={'KELUAR'} />
                </MenuItem>
                <MenuItem value={'IN'}>
                  <Checkbox size='small' checked={typeSearchValue.current.includes('IN')} />
                  <ListItemText primary={'MASUK'} />
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

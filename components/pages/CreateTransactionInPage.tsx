import { RootStateType, useAppDispatch } from "@/store"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography } from "@mui/material"
import { ArrowBackIosRounded, Delete, Close, ExpandMore } from '@mui/icons-material';
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import useStyle from 'styles/CreateTransaction.module.scss'
import { SET_ROUTE } from "@/store/actions/GlobalContextAction";
import SwalModal from "@/helper/SwalModal";
import { NumericFormat } from "react-number-format";
import { Item, ItemUnitType } from "@/store/reducer/ItemReducer";
import { CREATE_TRANSACTION } from "@/store/actions/TransactionAction";
import { ServiceType } from "@/store/reducer/TransactionReducer";

const style = (key: string | string[]) => {
  if (Array.isArray(key)) return key.map(v => (useStyle[v] || v)).join(' ')
  return useStyle[key] || key
}

const parseCurrency = (n: number, prefix = 'Rp. ') => {
  const str = String(n)
  let res: string[] = []
  let counter = 0
  for (let i = str.length - 1; i > 0 - 1; i--) {
    res.unshift(str[i])
    counter++
    if (counter === 3 && i) {
      res.unshift('.')
      counter = 0
    }
  }

  return `${prefix}${res.join('')}`
}

export type TransactionPayloadType = {
  vehicle_type: string;
  plate_number: string;
  customer_name: string;
  customer_phone: string;
  notes: string;
}

export type ItemPayloadType = {
  id: number;
  amount: number;
  price: number;
  name: string;
  stock: number;
  unit: ItemUnitType
}

export default function CreateTransactionIn() {
  const dispatch = useAppDispatch()
  const reduxItems = useSelector((state: RootStateType) => state.ItemReducer.items)
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const reduxEmployees = useSelector((state: RootStateType) => state.EmployeeReducer.employees)
  const [mechanicIds, setMechanicIds] = useState<string[]>([])
  const [payload, setPayload] = useState<TransactionPayloadType>({
    vehicle_type: '',
    plate_number: '',
    customer_name: '',
    customer_phone: '',
    notes: '',
  })
  const [items, setItems] = useState<ItemPayloadType[]>([])
  const [services, setServices] = useState<ServiceType[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)
  const [totalFilteredRow, setTotalFilteredRow] = useState(0)
  const keywords = useRef('')

  useEffect(() => {
    filterItems()
  }, [page, rowsPerPage, reduxItems])

  useEffect(() => {
    const payload = !isPayloadValidated()
    const services = !isServicesValidated()

    setIsSaveDisabled(payload || services)
  }, [payload, services])

  useEffect(() => {
    let total = 0
    services.forEach(({ price }) => total += price)
    items.forEach(i => total += i.price * i.amount)
    setTotalPrice(total)
  }, [services, items])

  const backToSupplies = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    SwalModal({
      icon: 'question',
      title: "Ingin meninggalkan halaman buat transaksi baru?",
      text: `Semua perubahan tidak akan tersimpan`,
      action: () => dispatch(SET_ROUTE('transactions'))
    })
  }

  const handleSave = () => {
    const data = {
      ...payload,
      services,
      mechanicIds,
      items: items.map(({id, amount}) => ({ id, amount })),
    }
    SwalModal({
      action: () => dispatch(CREATE_TRANSACTION(data, "IN")),
      title: "Buat Transaksi?",
      text: "Data yang sudah tersimpan tidak dapat diubah.",
      icon: "question"
    })

  }

  const isPayloadValidated = () => {
    const { vehicle_type, plate_number, customer_name, customer_phone } = payload
    if (!vehicle_type || !plate_number || !customer_name || !customer_phone) return false
    return true
  }

  const isServicesValidated = () => {
    for (const service of services) {
      if (!service.name) return false
    }
    return true
  }

  const handleAddMechanic = () => {
    const notSelectedEmployees = reduxEmployees.filter(e => !mechanicIds.includes(e.id))
    setMechanicIds([...mechanicIds, notSelectedEmployees[0].id])
  }

  const handleAddService = () => {
    setServices([...services, { name: '', price: 0 }])
  }

  const handleAddItem = (item: Item) => {
    setItems([...items, {
      amount: 1,
      price: item.selling_price,
      id: item.id,
      stock: item.stock,
      name: item.name,
      unit: item.unit
    }])
  }

  const handleDeleteMechanic = (index: number) => {
    setMechanicIds(mechanicIds.filter((_, i) => i !== index))
  }

  const handleDeleteService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleChangeMechanic = (index: number, value: string) => {
    const val: string[] = JSON.parse(JSON.stringify(mechanicIds))
    val[index] = value
    setMechanicIds(val)
  }

  const handleChangeService = (index: number, value: string | number, key: 'name' | 'price') => {
    const val: ServiceType[] = JSON.parse(JSON.stringify(services))
    if (key === 'price') {
      if (!value) value = 0
      else if (value) {
        const splitted = String(value).split('Rp. ')
        const parsedValue = +splitted[splitted.length - 1].split('.').join('')
        if (isNaN(parsedValue)) return
        value = parsedValue
      }
    }
    val[index] = { ...val[index], [key]: value }
    setServices(val)
  }

  const handleSearchName = (value: string) => {
    keywords.current = value
    clearTimeout(debounceTimer)
    const timeout = setTimeout(() => {
      filterItems()
    }, 1000)
    setDebounceTimer(timeout)
  }

  const handleItemAmountChange = (index: number, value: number) => {
    const cpy: ItemPayloadType[] = JSON.parse(JSON.stringify(items))
    const item = cpy[index]
    if (value >= item.stock) value = item.stock
    item.amount = value
    setItems(cpy)
  }

  const filterItems = () => {
    const filtered = reduxItems.filter(i => {
      const name = i.name.toLowerCase()
      const keyword = keywords.current.toLowerCase()
      return name.includes(keyword) || i.unique_id.includes(keyword)
    })
    setTotalFilteredRow(filtered.length)
    const offset = page * rowsPerPage
    setFilteredItems(filtered.filter((_, i) => i >= offset && i < offset + rowsPerPage))
  }

  const renderItemTable = () => {
    return (
      <div className={style(["item-table-container"])}>
        <TextField placeholder="Masukkan Kata Kunci" variant="outlined" size='small' className="width-40 mt-10 mb-10" value={keywords.current} onChange={e => handleSearchName(e.target.value)} />
        <Paper className={style(['table-parent'])}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 750 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left" width='20%'>ID</TableCell>
                  <TableCell align="left" width='40%'>Nama</TableCell>
                  <TableCell align="left" width='20%'>Harga</TableCell>
                  <TableCell align="left" width='15%'>Stok</TableCell>
                  <TableCell align="center" width='5%'></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item, index) => (
                  <>
                    <TableRow
                      key={item.id}
                      sx={{ '& > *': { borderBottom: 'unset !important' } }}
                    >
                      <TableCell align="left">{item.unique_id}0000</TableCell>
                      <TableCell align="left">{item.name}</TableCell>
                      <TableCell align="left">{`Rp. ${item.selling_price.toLocaleString('id')}`}</TableCell>
                      <TableCell align="left">{item.stock} {item.unit}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          className={style(['global-btn', 'add-item-btn'])}
                          onClick={() => handleAddItem(item)}
                          disabled={items.map(i => i.id).includes(item.id)}
                        >
                          <Typography>Tambahkan</Typography>
                        </Button>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            className='table-pagination'
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalFilteredRow}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => { setPage(newPage) }}
            onRowsPerPageChange={(e) => { setRowsPerPage(+(e.target.value)) }}
          />
        </Paper>
      </div>
    )
  }

  return (
    <div className={style('create-transaction-container')}>

      <div className={style('title-container')}>
        <div className={style('back-btn')} onClick={backToSupplies}>
          <ArrowBackIosRounded />
          <p>BACK</p>
        </div>
        <div />
      </div>

      <h2>Buat Transaksi Masuk Baru</h2>

      <div className={style('content')}>

        <div className={style('form')}>
          <div className={style('form-group')}>
            <h4>Nama</h4>
            <div className={style('user-input')}>
              <TextField
                className="text-align-left"
                value={payload.customer_name}
                onChange={e => setPayload({ ...payload, customer_name: e.target.value })}
                placeholder='Nama Pemilik Kendaraan'
                variant="standard"
                fullWidth
              />
            </div>
          </div>
          <div className={style('form-group')}>
            <h4>Nomor HP</h4>
            <div className={style('user-input')}>
              <TextField
                className="text-align-left"
                value={payload.customer_phone}
                onChange={e => setPayload({ ...payload, customer_phone: e.target.value })}
                placeholder='Nomor HP'
                variant="standard"
                fullWidth
              />
            </div>
          </div>
          <div className={style('form-group')}>
            <h4>Kendaraan</h4>
            <div className={style('user-input')}>
              <TextField
                className="text-align-left"
                value={payload.vehicle_type}
                onChange={e => setPayload({ ...payload, vehicle_type: e.target.value })}
                placeholder='Jenis Kendaraan'
                variant="standard"
                fullWidth
              />
            </div>
          </div>
          <div className={style('form-group')}>
            <h4>Nomor Kendaraan</h4>
            <div className={style('user-input')}>
              <TextField
                className="text-align-left"
                value={payload.plate_number}
                onChange={e => setPayload({ ...payload, plate_number: e.target.value })}
                placeholder='Nomor Polisi/Registrasi Kendaraan'
                variant="standard"
                fullWidth
              />
            </div>
          </div>
          <div className={style(['form-group', 'multiline'])}>
            <h4>Catatan</h4>
            <div className={style('user-input')}>
              <TextField
                className="text-align-left"
                value={payload.notes}
                onChange={e => setPayload({ ...payload, notes: e.target.value })}
                placeholder='Catatan Transaksi'
                variant="standard"
                fullWidth
                multiline
                maxRows={4}
              />
            </div>
          </div>
          <div className={style('form-group')}>
            <h4>Total</h4>
            <div className={style('user-input')}>
              <NumericFormat
                className={style(["react-number-input", "total-price"])}
                value={totalPrice}
                prefix="Rp. "
                thousandSeparator="."
                decimalSeparator=","
                disabled
              />
            </div>
          </div>
        </div>

        <div className={style(['form-mechanic', 'mt-10'])}>
          <Accordion elevation={0} className={style(['accordion'])}>
            <AccordionSummary className={style(['accordion-content'])} expandIcon={<ExpandMore />}>
              <h4>Mekanik</h4>
            </AccordionSummary>
            <AccordionDetails className={style(['accordion-content'])}>
              <div className={style(['mechanics'])}>
                {mechanicIds.map((v, i) => (
                  <div>
                    <h4>{i + 1}.</h4>
                    <Select
                      value={v}
                      label="mechanic"
                      variant="standard"
                      disableUnderline
                      onChange={e => handleChangeMechanic(i, e.target.value)}
                      fullWidth
                    >
                      {reduxEmployees.filter(e => !mechanicIds.includes(e.id) || e.id === v).map((e) => (
                        <MenuItem value={e.id} selected={v === e.id}>{e.name}</MenuItem>
                      ))}
                    </Select>
                    <Tooltip title="Hapus">
                      <IconButton onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMechanic(i)
                      }}>
                        <Delete fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))}
              </div>

              <div className={style(['add-btn-container'])}>
                <Button
                  variant="contained"
                  className={style(['global-btn', 'add-btn'])}
                  onClick={handleAddMechanic}
                  disabled={mechanicIds.length === reduxEmployees.length}
                >
                  <Typography>Tambah Mekanik</Typography>
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        <div className={style(['form-service', 'mt-10'])}>
          <Accordion elevation={0} className={style(['accordion'])}>
            <AccordionSummary className={style(['accordion-content'])} expandIcon={<ExpandMore />}>
              <h4>Jasa</h4>
            </AccordionSummary>
            <AccordionDetails className={style(['accordion-content'])}>
              <div className={style(['services'])}>
                {services.map((v, i) => (
                  <div>
                    <Typography>{i + 1}.</Typography>
                    <TextField
                      type="text"
                      InputProps={{ disableUnderline: true }}
                      placeholder="Nama Jasa"
                      variant="standard"
                      value={v.name}
                      onChange={(e) => handleChangeService(i, e.target.value, 'name')}
                      fullWidth
                    />
                    <TextField
                      type="text"
                      InputProps={{ disableUnderline: true }}
                      className={style(["react-number-input", "price"])}
                      variant="standard"
                      value={parseCurrency(services[i].price)}
                      onChange={(e) => handleChangeService(i, e.target.value, 'price')}
                      fullWidth
                    />
                    <Tooltip title="Hapus">
                      <IconButton onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteService(i)
                      }}>
                        <Delete fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))}
              </div>

              <div className={style(['add-btn-container'])}>
                <Button
                  variant="contained"
                  className={style(['global-btn', 'add-btn'])}
                  onClick={handleAddService}
                >
                  <Typography>Tambah Jasa</Typography>
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        <div className={style(['form-item', 'mt-10'])}>
          <Accordion elevation={0} className={style(['accordion'])}>
            <AccordionSummary className={style(['accordion-content'])} expandIcon={<ExpandMore />}>
              <h4>Barang</h4>
            </AccordionSummary>
            <AccordionDetails className={style(['accordion-content'])}>
              <div className={style(['items'])}>
                {items.map((item, i) => (
                  <div className="width-100 flex-between">
                    <div className="width-5">
                      <Typography className={style(["item-detail"])}>{i + 1}.</Typography>
                    </div>
                    <div className="width-40">
                      <Typography className={style(["item-detail"])}>{item.name}</Typography>
                    </div>
                    <div className="width-20 flex-start">
                      <NumericFormat
                        onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                        className={style(["react-number-input", "bg-default"])}
                        min={1}
                        max={item.stock}
                        size={20}
                        value={item.amount}
                        thousandSeparator="."
                        decimalSeparator=","
                        onValueChange={v => handleItemAmountChange(i, +v.value)}
                      />
                      <Typography className={style(["item-detail", "ml-10"])}>{item.unit}</Typography>
                    </div>
                    <div className="width-25 flex-end">
                      <Typography className={style(["item-detail", "total-price"])}>{parseCurrency(item.amount * item.price)}</Typography>
                    </div>
                    <div className="width-10">
                      <Tooltip title="Hapus">
                        <IconButton onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteItem(i)
                        }}>
                          <Delete fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
              {renderItemTable()}
            </AccordionDetails>
          </Accordion>
        </div>

      </div>

      <div className={style('submit-btn-container')}>
        <Button
          variant="contained"
          className={style(['global-btn', 'save-btn'])}
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          Simpan
        </Button>
      </div>
    </div>
  )
}

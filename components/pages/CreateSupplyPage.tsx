import { RootStateType, useAppDispatch } from "@/store"
import { Button, Checkbox, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip } from "@mui/material"
import { NumericFormat } from 'react-number-format';
import { ArrowBackIosRounded, Delete, Close } from '@mui/icons-material';
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import useStyle from 'styles/CreateSupply.module.scss'
import { SET_ROUTE } from "@/store/actions/GlobalContextAction";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'
import { CREATE_SUPPLY } from "@/store/actions/SupplyAction";
import SwalModal from "@/helper/SwalModal";
import parseDate from "@/helper/parseDate";
import { ItemUnitType } from "@/store/reducer/ItemReducer";
import parseNumber from "@/helper/parseNumber";

const style = (key: string | string[]) => {
  if (Array.isArray(key)) return key.map(v => (useStyle[v] || v)).join(' ')
  return useStyle[key] || key
}

export type SupplyPayloadType = {
  supplier_id: string;
  invoice_number: string;
  due_date: dayjs.Dayjs;
  issued_date: dayjs.Dayjs;
  is_paid: boolean;
  notes: string;
}

export type SupplyItemPayloadType = {
  unique_id: string;
  description: string;
  name: string;
  rack_id: string;
  sub_category_id: number;
  selling_price: number;
  buying_price: number;
  stock: number;
  unit: ItemUnitType
}

export default function CreateSupply() {
  const dispatch = useAppDispatch()
  const reduxSuppliers = useSelector((state: RootStateType) => state.SupplierReducer.suppliers)
  const reduxRacks = useSelector((state: RootStateType) => state.RackReducer.racks)
  const reduxSubCategories = useSelector((state: RootStateType) => state.SubCategoryReducer.sub_categories)
  const [payload, setPayload] = useState<SupplyPayloadType>({
    supplier_id: '',
    invoice_number: '',
    due_date: parseDate(dayjs().add(7, 'days')),
    issued_date: parseDate(dayjs()),
    is_paid: false,
    notes: ''
  })
  const [items, setItems] = useState<SupplyItemPayloadType[]>([])

  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [isPayloadValidated, setIsPayloadValidated] = useState(false)
  const [isItemsValidated, setIsItemsValidated] = useState(false)

  useEffect(() => {
    setPayload({ ...payload, supplier_id: reduxSuppliers[0]?.id || "" })
  }, [reduxSuppliers])

  useEffect(() => {
    const { invoice_number, supplier_id } = payload
    const isValidated = invoice_number && supplier_id
    setIsPayloadValidated(!!isValidated)
  }, [payload])

  useEffect(() => {
    setIsSaveDisabled(!isPayloadValidated || !isItemsValidated || items.length === 0)
  }, [isPayloadValidated, isItemsValidated, items.length])

  const validateItems = async (args: SupplyItemPayloadType[]) => {
    const copy: SupplyItemPayloadType[] = JSON.parse(JSON.stringify(args))
    let isValidated = true
    const month = payload.issued_date.get('months') + 1
    const years = String(payload.issued_date.get('years'))
    const issued_date = `${parseNumber(month)}${years[2]}${years[3]}`

    const subCategoryIndex: Record<string, number> = {}

    const generatePriceCode = (sellingPrice: number) => {
      const splitted = String(sellingPrice).split('')
      const reverse = JSON.parse(JSON.stringify(splitted)).reverse()
      let counter = 0
    
      for (let i = 0; i < reverse.length; i++) {
        const current = reverse[i]
        const next = reverse[i + 1]
        if (current === '0' && next === '0') counter++
      }
      const res = [splitted[2] || '0', splitted[1] || '0', splitted[0] || '0']
      return `${counter}0${res.join('')}`
    }

    copy.forEach(p => {
      if (p.sub_category_id) {
        const subid = parseNumber(p.sub_category_id, 3)
        if (!subCategoryIndex[subid]) subCategoryIndex[subid] = 1
        const rowId = parseNumber(subCategoryIndex[subid])
        subCategoryIndex[subid]++
        const priceCode = generatePriceCode(p.selling_price)
        p.unique_id = `${subid}${rowId}${issued_date}${priceCode}`
      }
      else p.unique_id = ""

      if (!p.unique_id || !p.name ) isValidated = false
    })
    setItems(copy)
    setIsItemsValidated(isValidated)
  }

  useEffect(() => {
    validateItems(items)
  }, [items.length, payload.issued_date])

  const backToSupplies = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    SwalModal({
      icon: 'question',
      title: "Ingin meninggalkan halaman buat supply baru?",
      text: `Semua perubahan tidak akan tersimpan`,
      action: () => dispatch(SET_ROUTE('supplies'))
    })
  }

  const handleSave = () => {
    const { issued_date, due_date } = payload
    const data = {
      ...payload,
      issued_date: `${issued_date.get('years')}-${issued_date.get('months') + 1}-${issued_date.get('dates')} 00:00:00`,
      due_date: `${due_date.get('years')}-${due_date.get('months') + 1}-${due_date.get('dates')} 23:59:59`,
      items
    }
    console.log(items);
    
    SwalModal({
      action: () => dispatch(CREATE_SUPPLY(data)),
      title: "Buat Supply Baru?",
      text: "Data yang sudah tersimpan tidak dapat diubah.",
      icon: "question"
    })

  }

  const handleAddItem = () => {
    setItems([...items, {
      unique_id: "",
      description: "",
      rack_id: reduxRacks[0]?.id,
      sub_category_id: reduxSubCategories[0]?.id || 0,
      selling_price: 0,
      buying_price: 0,
      stock: 1,
      unit: ItemUnitType.GALOON,
      name: ''
    }])
  }

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleChangeSubCategoryChange = (value: number, index: number) => {
    const data: SupplyItemPayloadType[] = JSON.parse(JSON.stringify(items))
    data[index].sub_category_id = value
    validateItems(data)
  }

  const handleRackChange = (value: string, index: number) => {
    const data: SupplyItemPayloadType[] = JSON.parse(JSON.stringify(items))
    data[index].rack_id = value
    setItems(data)
  }

  const handleUnitChange = (value: ItemUnitType, index: number) => {
    const data: SupplyItemPayloadType[] = JSON.parse(JSON.stringify(items))
    data[index].unit = value
    setItems(data)
  }

  const handleNumberChange = (key: 'buying_price' | 'selling_price' | 'stock', value: number, index: number) => {
    const data: SupplyItemPayloadType[] = JSON.parse(JSON.stringify(items))
    data[index][key] = +value
    if (key === 'selling_price') validateItems(data)
    else setItems(data)
  }

  const handleDescChange = (value: string, index: number) => {
    if (value.length > 500) return
    const data: SupplyItemPayloadType[] = JSON.parse(JSON.stringify(items))
    data[index].description = value
    setItems(data)
  }

  const handleNameChange = (value: string, index: number) => {
    if (value.length > 255) return
    const data: SupplyItemPayloadType[] = JSON.parse(JSON.stringify(items))
    data[index].name = value
    validateItems(data)
  }

  return (
    <div className={style('create-supply-container')}>

      <div className={style('title-container')}>
        <div className={style('back-btn')} onClick={backToSupplies}>
          <ArrowBackIosRounded />
          <p>BACK</p>
        </div>
        <div />
      </div>

      <h2>Buat Supply Baru</h2>

      <div className={style('content')}>

        <div className={style('form')}>
          <div className={style('form-group')}>
            <h4>Invoice</h4>
            <div className={style('user-input')}>
              <TextField
                className="text-align-left"
                value={payload.invoice_number}
                onChange={e => setPayload({ ...payload, invoice_number: e.target.value })}
                placeholder='Nomor Invoice'
                variant="standard"
                fullWidth
              />
            </div>
          </div>
          <div className={style('form-group')}>
            <h4>Supplier</h4>
            <div className={style('user-input')}>
              <Select
                className='text-align-left'
                value={payload.supplier_id}
                variant="standard"
                size='small'
                onChange={(e) => setPayload({ ...payload, supplier_id: e.target.value })}
                fullWidth
                placeholder=""
              >
                {reduxSuppliers.map((c, i) => (
                  <MenuItem value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className={style('form-group')}>
            <h4>Tanggal Masuk</h4>
            <div className={style('user-input')}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { variant: 'standard' } }}
                value={payload.issued_date}
                onChange={value => setPayload({ ...payload, issued_date: value as dayjs.Dayjs })}
                maxDate={payload.due_date}
              />
            </div>
          </div>
          <div className={style('form-group')}>
            <h4>Jatuh Tempo</h4>
            <div className={style('user-input')}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { variant: 'standard' } }}
                value={payload.due_date}
                onChange={value => setPayload({ ...payload, due_date: value as dayjs.Dayjs })}
                minDate={payload.issued_date}
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
            <h4>Lunas</h4>
            <div className={style('user-input')}>
              <Checkbox
                onChange={() => setPayload({ ...payload, is_paid: !payload.is_paid })}
                checked={payload.is_paid}
              />
            </div>
          </div>
        </div>

        <div className={style(['form-barang', 'mt-25'])}>
          <h4>Barang</h4>
          <div className={style('barang-table-container')}>
            <div className={style(["table-container", "width-100", "mt-10"])} >
              <Paper>
                <TableContainer>
                  <Table stickyHeader aria-label="sticky table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" width={"5%"}>No.</TableCell>
                        <TableCell align="left" width={"15%"}>Nama</TableCell>
                        <TableCell align="left" width={"15%"}>Deskripsi</TableCell>
                        <TableCell align="center" width={"10%"}>Rak</TableCell>
                        <TableCell align="center" width={"20%"}>Sub Kategori</TableCell>
                        <TableCell align="center" width={"10%"}>Harga Beli</TableCell>
                        <TableCell align="center" width={"10%"}>Harga Jual</TableCell>
                        <TableCell align="center" width={"5%"}>Stok</TableCell>
                        <TableCell align="center" width={"5%"}>Satuan</TableCell>
                        <TableCell align="center" width={"5%"}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((v, i) => (
                        <TableRow>
                          <TableCell align="center">{i + 1}</TableCell>
                          <TableCell align="left">
                            <TextField
                              type="text"
                              InputProps={{ disableUnderline: true }}
                              variant="standard"
                              value={v.name}
                              onChange={(e) => { handleNameChange(e.target.value, i) }}
                              fullWidth
                              className='mb-5 mt-5'
                              multiline
                              rows={v.name.length > 18 ? 2 : 1}
                            />
                          </TableCell>
                          <TableCell align="left">
                            <TextField
                              type="text"
                              InputProps={{ disableUnderline: true }}
                              variant="standard"
                              value={v.description}
                              onChange={(e) => { handleDescChange(e.target.value, i) }}
                              fullWidth
                              className='mb-5 mt-5'
                              multiline
                              rows={v.description.length > 18 ? 2 : 1}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Select
                              value={v.rack_id}
                              label="rack_id"
                              variant="standard"
                              disableUnderline
                              onChange={e => handleRackChange(e.target.value, i)}
                              fullWidth
                            >
                              {reduxRacks.map(r => (
                                <MenuItem value={r.id} selected={v.rack_id === r.id}>{r.storage_number}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell align="center">
                            <Select
                              value={v.sub_category_id}
                              label="sub_category_id"
                              variant="standard"
                              disableUnderline
                              onChange={e => handleChangeSubCategoryChange(+e.target.value, i)}
                              fullWidth
                            >
                              {reduxSubCategories.map(r => (
                                <MenuItem value={r.id} selected={v.sub_category_id == r.id}>{r.name}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell align="center">
                            <NumericFormat
                              onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                              className={style("react-number-input")}
                              min={0}
                              size={20}
                              value={v.buying_price}
                              thousandSeparator="."
                              decimalSeparator=","
                              onValueChange={v => handleNumberChange("buying_price", +v.value, i)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <NumericFormat
                              onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                              className={style("react-number-input")}
                              min={0}
                              size={20}
                              value={v.selling_price}
                              thousandSeparator="."
                              decimalSeparator=","
                              onValueChange={v => handleNumberChange("selling_price", +v.value, i)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <NumericFormat
                              onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                              className={style("react-number-input")}
                              min={1}
                              size={20}
                              value={v.stock}
                              thousandSeparator="."
                              decimalSeparator=","
                              onValueChange={v => handleNumberChange("stock", +v.value, i)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Select
                              value={v.unit}
                              label="unit"
                              variant="standard"
                              disableUnderline
                              onChange={e => handleUnitChange(e.target.value as ItemUnitType, i)}
                              fullWidth
                            >
                              {Object.values(ItemUnitType).map(unit => (
                                <MenuItem value={unit} selected={unit === v.unit}>{unit}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell align="left">
                            <Tooltip title="Hapus">
                              <IconButton onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteItem(i)
                              }}>
                                <Delete fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              <Button
                variant="contained"
                className={style(['global-btn', 'mt-10', 'mb-10'])}
                onClick={handleAddItem}
              >
                Tambah Barang Baru
              </Button>
            </div>
          </div>
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

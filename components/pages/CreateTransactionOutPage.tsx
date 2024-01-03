import { RootStateType, useAppDispatch } from "@/store"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography } from "@mui/material"
import { ArrowBackIosRounded, Delete, Close, ExpandMore } from '@mui/icons-material';
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import useStyle from 'styles/CreateTransaction.module.scss'
import { SET_ROUTE } from "@/store/actions/GlobalContextAction";
import SwalModal from "@/helper/SwalModal";
import { NumericFormat } from "react-number-format";
import { Item } from "@/store/reducer/ItemReducer";
import { CREATE_TRANSACTION } from "@/store/actions/TransactionAction";
import { ServiceType } from "@/store/reducer/TransactionReducer";
import { ItemPayloadType, TransactionPayloadType } from "./CreateTransactionInPage";

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

export default function CreateTransactionOut() {
  const dispatch = useAppDispatch()
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
      mechanicIds: [],
      items: items.map(({ id, amount }) => ({ id, amount })),
    }
    SwalModal({
      action: () => dispatch(CREATE_TRANSACTION(data, "OUT")),
      title: "Buat Transaksi?",
      text: "Data yang sudah tersimpan tidak dapat diubah.",
      icon: "question"
    })

  }

  const isPayloadValidated = () => {
    const { customer_name, customer_phone } = payload
    if (!customer_name || !customer_phone) return false
    return true
  }

  const isServicesValidated = () => {
    for (const service of services) {
      if (!service.name) return false
    }
    return true
  }

  const handleAddService = () => {
    setServices([...services, { name: '', price: 0 }])
  }

  const handleDeleteService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
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

  return (
    <div className={style('create-transaction-container')}>

      <div className={style('title-container')}>
        <div className={style('back-btn')} onClick={backToSupplies}>
          <ArrowBackIosRounded />
          <p>BACK</p>
        </div>
        <h2>Buat Transaksi Keluar Baru</h2>
        <div />
      </div>


      <div className={style('content')}>

        <div className={style('form')}>
          <div className={style('form-group')}>
            <h4>Penanggung Jawab</h4>
            <div className={style('user-input')}>
              <TextField
                className="text-align-left"
                value={payload.customer_name}
                onChange={e => setPayload({ ...payload, customer_name: e.target.value })}
                placeholder='Nama Penanggung Jawab'
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
          <div className={style(['form-group', 'multiline'])}>
            <h4>Catatan</h4>
            <div className={style('user-input')}>
              <TextField
                className="text-align-left"
                value={payload.notes}
                onChange={e => { if (e.target.value.length <= 255) setPayload({ ...payload, notes: e.target.value }) }}
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

        <div className={style(['form-service', 'mt-10'])}>
          <Accordion elevation={0} className={style(['accordion'])}>
            <AccordionSummary className={style(['accordion-content'])} expandIcon={<ExpandMore />}>
              <h4>Rincian</h4>
            </AccordionSummary>
            <AccordionDetails className={style(['accordion-content'])}>
              <div className={style(['services'])}>
                {services.map((v, i) => (
                  <div>
                    <Typography>{i + 1}.</Typography>
                    <TextField
                      type="text"
                      InputProps={{ disableUnderline: true }}
                      placeholder="Nama Barang / Jasa"
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
                  <Typography>Tambah Barang / Jasa</Typography>
                </Button>
              </div>
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

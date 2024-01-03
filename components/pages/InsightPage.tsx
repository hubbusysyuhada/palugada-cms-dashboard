import { RootStateType, useAppDispatch } from "@/store"
import { Button, MenuItem, Paper, Select, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs } from "@mui/material"
import { ArrowBackIosRounded } from '@mui/icons-material';
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import useStyle from 'styles/Insight.module.scss'
import { SET_ROUTE } from "@/store/actions/GlobalContextAction";
import { FETCH_INSIGHT } from "@/store/actions/TransactionAction";
import { InsightSeriesType } from "@/store/reducer/TransactionReducer";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import NoData from "../NoData";
import parseNumber from "@/helper/parseNumber";
import parseCurrency from "@/helper/parseCurrency";
import { Chart as ChartJs, CategoryScale, LinearScale, PointElement, LineElement, Legend, Title, Tooltip } from 'chart.js'
import { Line } from 'react-chartjs-2'

const style = (key: string | string[]) => {
  if (Array.isArray(key)) return key.map(v => (useStyle[v] || v)).join(' ')
  return useStyle[key] || key
}

ChartJs.register(CategoryScale, LinearScale, PointElement, LineElement, Legend, Title, Tooltip)

export default function Insight() {
  const dispatch = useAppDispatch()
  const reduxInsight = useSelector((state: RootStateType) => state.TransactionReducer.insight)
  const [totalRowInsight, setTotalRowInsight] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [series, setSeries] = useState<InsightSeriesType>('once')
  const [startDate, setStartDate] = useState<dayjs.Dayjs>()
  const [endDate, setEndDate] = useState<dayjs.Dayjs>()

  useEffect(() => {
    setIsSaveDisabled(!startDate || !endDate)
  }, [startDate, endDate])

  useEffect(() => {
    setTotalRowInsight(Object.keys(reduxInsight).length)
  }, [reduxInsight])

  const backToTransactions = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    dispatch(SET_ROUTE('transactions'))
  }

  const calculateInsight = () => {
    setIsInitialized(true)
    const dayJsToString = (d: dayjs.Dayjs) => {
      const date = parseNumber(d.get('D'))
      const month = parseNumber(d.get('M') + 1)
      const year = d.get('years')
      return `${month}/${date}/${year}`
    }
    dispatch(FETCH_INSIGHT(dayJsToString(startDate as dayjs.Dayjs), dayJsToString(endDate as dayjs.Dayjs), series))
  }

  const renderTable = () => {
    if (tabValue === 0) return (
      <div className={style(['content'])}>
        <Paper>
          <TableContainer sx={{ maxHeight: "60vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center" width='5%'>No.</TableCell>
                  <TableCell align="left" width='40%'>Periode</TableCell>
                  <TableCell align="right" width='15%'>Pemasukan</TableCell>
                  <TableCell align="right" width='15%'>Pengeluaran</TableCell>
                  <TableCell align="right" width='25%'>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(reduxInsight).map((v, i) => (
                  <TableRow
                    key={i}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="center">{i + 1}</TableCell>
                    <TableCell align="left">{v.label}</TableCell>
                    <TableCell align="right">{parseCurrency(v.sumIn)}</TableCell>
                    <TableCell align="right">{parseCurrency(v.sumOut)}</TableCell>
                    <TableCell align="right" className={style([v.sumIn > v.sumOut ? 'font-green' : 'font-red', 'foobar'])}>{parseCurrency(Math.abs(v.sumIn - v.sumOut))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    )
  }

  const generateChartOptions = () => {
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Grafik Transaksi',
        },
      },
    };

    return options
  }

  const generateChartDataset = () => {
    const values = Object.values(reduxInsight)

    const data = {
      labels: values.map(v => v.label),
      datasets: [
        {
          label: 'Pemasukan',
          data: values.map(v => v.sumIn),
          fill: false,
          borderColor: 'green',
          tension: 0.3
        },
        {
          label: 'Pengeluaran',
          data: values.map(v => v.sumOut),
          fill: false,
          borderColor: 'red',
          tension: 0.3
        },
        {
          label: 'Total',
          data: values.map(v => v.sumIn - v.sumOut),
          fill: false,
          borderColor: 'blue',
          tension: 0.3
        },
      ]
    }
    return data
  }

  const renderChart = () => {
    if (totalRowInsight > 31) return (
      <div className={style(['content'])}>
        <h4 className="mt-25">RANGE DATA TERLALU BESAR UNTUK DITAMPILKAN OLEH GRAFIK</h4>
      </div>
    )
    if (tabValue === 1) return (
      <div className={style(['content'])}>
        <Line data={generateChartDataset()} options={generateChartOptions()}/>
      </div>
    )
  }

  const renderData = () => {
    if (!isInitialized || !totalRowInsight) return <NoData />
    return (
      <div className={style(['content-container'])}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} TabIndicatorProps={{ style: { backgroundColor: '#6A32CB' } }}>
          <Tab label="Table" className={style(tabValue === 0 ? 'selected' : '')} />
          <Tab label="Grafik" className={style(tabValue === 1 ? 'selected' : '')} />
        </Tabs>
        {renderTable()}
        {renderChart()}
      </div>
    )
  }


  return (
    <div className={style('insight-container')}>

      <div className={style('title-container')}>
        <div className={style('back-btn')} onClick={backToTransactions}>
          <ArrowBackIosRounded />
          <p>BACK</p>
        </div>
        <h2>Statistik</h2>
        <div />
      </div>

      <div className="root-with-filter">
        <div className='table-content width-80'>
          <div className='filter-group mb-50'>
            <div className='width-30'>
              <div className='text-align-left'>
                <p className='mb-10'><b>Tanggal Awal</b></p>
                <DatePicker
                  format="DD/MM/YYYY"
                  className="datepicker-search-form"
                  value={startDate}
                  maxDate={endDate}
                  onChange={value => setStartDate(value as dayjs.Dayjs)}
                />
              </div>
            </div>
            <div className='width-30'>
              <div className='text-align-left'>
                <p className='mb-10'><b>Tanggal Akhir</b></p>
                <DatePicker
                  format="DD/MM/YYYY"
                  className="datepicker-search-form"
                  value={endDate}
                  minDate={startDate}
                  onChange={value => setEndDate(value as dayjs.Dayjs)}
                />
              </div>
            </div>
            <div className='width-30'>
              <div className='text-align-left'>
                <p className='mb-10'><b>Interval</b></p>
                <div className="flex-between">
                  <Select
                    className='text-align-left width-100 mr-20'
                    value={series}
                    variant="outlined"
                    size='small'
                    onChange={(e) => setSeries(e.target.value as InsightSeriesType)}
                    fullWidth
                  >
                    <MenuItem value={'once'}>Once</MenuItem>
                    <MenuItem value={'daily'}>Daily</MenuItem>
                    <MenuItem value={'weekly'}>Weekly</MenuItem>
                    <MenuItem value={'monthly'}>Monthly</MenuItem>
                  </Select>
                  <div className={style(['btn-container'])}>
                    <Button
                      variant="contained"
                      className={style(['global-btn'])}
                      onClick={calculateInsight}
                      disabled={isSaveDisabled}
                    >
                      Hitung
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
          {renderData()}
        </div>
      </div>
    </div>
  )
}

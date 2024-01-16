import { Transaction } from "@/store/reducer/TransactionReducer";
import pdfMake from 'pdfmake/build/pdfmake'
import parseCurrency from "./parseCurrency";

const parseDate = (d: Date) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const day = days[d.getDay()]
  const date = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day}, ${date} ${month} ${year}`
}

const generateTable = (t: Transaction) => {
  const data: Record<string, any> = {
    margin: [0, 10],
    table: {
      widths: [225, 75, 100, 100],
      body: [
        [
          { text: 'Nama Barang / Jasa', style: 'tableHeader' },
          { text: 'Jumlah', style: 'tableHeader' },
          { text: 'Harga', style: 'tableHeader' },
          { text: 'Total', style: 'tableHeader' }
        ],
      ]
    }
  }

  t.additional_services.forEach(s => {
    data.table.body.push([
      { text: s.name, style: ['tableData', 'left'] },
      { text: '1', style: ['tableData', 'center'] },
      { text: parseCurrency(s.price), style: ['tableData', 'right'] },
      { text: parseCurrency(s.price), style: ['tableData', 'right'] },
    ])
  })


  t.transaction_items.forEach(ti => {
    data.table.body.push([
      { text: `${ti.item.unique_id} - ${ti.item.name}`, style: ['tableData', 'left'] },
      { text: `${ti.amount} ${ti.item.unit}`, style: ['tableData', 'center'] },
      { text: parseCurrency(ti.item.selling_price), style: ['tableData', 'right'] },
      { text: parseCurrency(ti.amount * ti.item.selling_price), style: ['tableData', 'right'] },
    ])
  })

  data.table.body.push([
    { text: '', border: [false, false, false, false] },
    { text: '', border: [false, false, false, false] },
    { text: 'Total', style: ['totalPrice', 'right'], border: [false, false, false, false] },
    { text: parseCurrency(t.total_price), style: ['totalPrice', 'right'], border: [false, false, false, false] },
  ])


  return data

}

const parseString = (s: string) => s || '-'

export default async (t: Transaction, base64Img: string): Promise<pdfMake.TDocumentDefinitions> => {
  const content: Record<string, any> = [
    {
      layout: 'noBorders',
      table: {
        widths: [38, 250, 212],
        body: [
          [
            {
              image: `data:image/jpeg;base64,${base64Img}`,
              height: 38,
              width: 38,
              rowSpan: 3
            },
            {
              text: process.env.NEXT_PUBLIC_COMPANY_TITLE,
              style: 'header'
            },
            {
              text: parseDate(new Date(t.created_at)),
              style: 'date',
              rowSpan: 3
            },
          ],
          [
            {
              text: ''
            },
            {
              text: process.env.NEXT_PUBLIC_COMPANY_ADDRESS,
              style: 'subHeader'
            },
          ],
          [
            {
              text: ''
            },
            {
              text: process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER,
              style: 'subHeader'
            },
          ],
        ]
      }
    },
    {
      text: 'KWITANSI',
      style: 'invoice',
      margin: [0, 10, 0, 0]
    },
    {
      text: `No. ${t.invoice}`,
      style: 'invoiceNum',
      margin: [0, 2]
    },
    {
      columns: [
        {
          width: 70,
          text: 'Nama Customer',
          style: 'detail'
        },
        {
          width: 8,
          text: ':',
          style: 'detail'
        },
        {
          width: '*',
          text: parseString(t.customer_name),
          style: 'detail'
        },
      ]
    },
    {
      columns: [
        {
          width: 70,
          text: 'Nomor HP',
          style: 'detail'
        },
        {
          width: 8,
          text: ':',
          style: 'detail'
        },
        {
          width: '*',
          text: parseString(t.customer_phone),
          style: 'detail'
        },
      ]
    },
    {
      columns: [
        {
          width: 70,
          text: 'Kendaraan',
          style: 'detail'
        },
        {
          width: 8,
          text: ':',
          style: 'detail'
        },
        {
          width: '*',
          text: parseString(t.vehicle_type || ''),
          style: 'detail'
        },
      ]
    },
    {
      columns: [
        {
          width: 70,
          text: 'Nomor Kendaraan',
          style: 'detail'
        },
        {
          width: 8,
          text: ':',
          style: 'detail'
        },
        {
          width: '*',
          text: parseString(t.plate_number || ''),
          style: 'detail'
        },
      ]
    },
    {
      columns: [
        {
          width: 70,
          text: 'Mekanik',
          style: 'detail'
        },
        {
          width: 8,
          text: ':',
          style: 'detail'
        },
        {
          width: '*',
          text: parseString(t.mechanics.map(m => m.name).join(', ')),
          style: 'detail'
        },
      ]
    },
  ]

  content.push(generateTable(t))

  content.push(
    {
      layout: 'noBorders',
      table: {
        widths: [325, 100, 75],
        body: [
          [
            {
              text: '•  Suyono - 1420005976302 (mandiri)\n•  Suyono - 2160472629 (BCA)',
              style: ['detail'],
              margin: [15, 0, 0, 0]
            },
            {
              text: ''
            },
            {
              text: '',
              style: 'detail'
            },
          ],
          [
            {
              text: ''
            },
            {
              text: 'Penerima,',
              style: ['detail', 'center'],
            },
            {
              text: 'Hormat kami,',
              style: ['detail', 'center'],
            },
          ],
          [
            {
              text: ''
            },
            {
              text: '(.............................)',
              style: ['detail', 'center', 'recipientFooter'],
            },
            {
              text: 'kasir',
              style: ['detail', 'center', 'recipientFooter'],
            },
          ],
        ]
      }
    }
  )

  const metadata: pdfMake.TDocumentDefinitions = {
    pageOrientation: 'landscape',
    pageSize: 'A5',
    content,
    styles: {
      header: {
        fontSize: 10,
        bold: true
      },
      date: {
        fontSize: 8,
        alignment: 'right'
      },
      recipientFooter: {
        margin: [0, 40, 0, 0],
      },
      subHeader: {
        fontSize: 6
      },
      invoice: {
        fontSize: 12,
        bold: true,
        alignment: 'center'
      },
      invoiceNum: {
        fontSize: 8,
        bold: true,
        alignment: 'center'
      },
      detail: {
        fontSize: 8
      },
      tableHeader: {
        fontSize: 8,
        bold: true,
        alignment: 'center'
      },
      tableData: {
        fontSize: 8
      },
      center: {
        alignment: 'center'
      },
      right: {
        alignment: 'right'
      },
      left: {
        alignment: 'left'
      },
      totalPrice: {
        bold: true,
        fontSize: 9
      }
    }
  }

  return metadata
}
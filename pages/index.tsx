import { useEffect, useState } from 'react'
import Layout from '@/components/layout'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Navbar from '@/components/navbar'
import { FETCH_FEATURES, FETCH_USER } from '@/store/actions/AuthAction'
import { CatalogPage, CategoryPage, CreateSupplyPage, CreateTransactionInPage, CreateTransactionOutPage, EmployeePage, InsightPage, ItemPage, RBACPage, RackPage, SubCategoryPage, SupplierPage, SupplyPage, TransactionPage, UserPage } from '@/components/pages'
import { GetStaticProps } from 'next'
import { readFileSync } from 'fs'
import path from 'path'

export const getStaticProps = (async (context) => {
  const base64Logo = readFileSync(path.join(process.cwd() + '/public/company-logo.png'), 'base64')
  return { props: { base64Logo } }
}) satisfies GetStaticProps<{ base64Logo: string }>

export default function RootPage(props: any) {
  const reduxRouteName = useSelector((state: RootStateType) => state.GlobalContextReducer.routeName)
  const dispatch = useAppDispatch()
  const route = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      route.push('/auth')
    }
    else {
      dispatch(FETCH_USER(route))
      dispatch(FETCH_FEATURES())
    }
    setIsReady(true)
  }, [])

  const renderPage = () => {
    switch (reduxRouteName) {
      case "roles":
        return <RBACPage />
      case "user":
        return <UserPage />
      case "employees":
        return <EmployeePage />
      case "catalogs":
        return <CatalogPage />
      case "categories":
        return <CategoryPage />
      case "sub_categories":
        return <SubCategoryPage />
      case "racks":
        return <RackPage />
      case "suppliers":
        return <SupplierPage />
      case "supplies":
        return <SupplyPage />
      case "items":
        return <ItemPage />
      case "create-supply":
        return <CreateSupplyPage />
      case "transactions":
        return <TransactionPage base64Logo={props.base64Logo} />
      case "create-transaction-in":
        return <CreateTransactionInPage />
      case "create-transaction-out":
        return <CreateTransactionOutPage />
      case "insight":
        return <InsightPage />
      default:
        return (<div><h1>{reduxRouteName}</h1></div>)
    }
  }

  if (!isReady) return <></>
  return (
    <Layout>
      <div className="flex-start" style={{ height: "100vh", width: "100%" }}>
        <Navbar />
        <div className='pl-25 pr-25 root-page'>
          {renderPage()}
        </div>
      </div>
    </Layout>
  )
}

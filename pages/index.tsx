import { useEffect, useState } from 'react'
import Layout from '@/components/layout'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Navbar from '@/components/navbar'
import { FETCH_FEATURES, FETCH_USER } from '@/store/actions/AuthAction'
import { CatalogPage, CategoryPage, CreateSupplyPage, EmployeePage, RBACPage, RackPage, SubCategoryPage, SupplierPage, SupplyPage, UserPage } from '@/components/pages'

export default function RootPage() {
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
      case "create-supply":
        return <CreateSupplyPage />
      default:
        return (<div style={{ display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center", height: "100%" }}>
          <h1>UNDER CONSTRUCTION</h1>
        </div>)
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

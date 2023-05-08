import navStyles from 'styles/Generator.module.scss'
import Image from 'next/image'
import { useState } from 'react'
import { Env, Schema, RBAC, Function } from '@/components/'
import axios from 'axios'

export default function Generator() {
  const [tab, setTab] = useState('schema')

  const moveTab = (state: string) => setTab(state)

  const selectTab = () => {
    switch (tab) {
      case 'schema':
        return (<Schema />)
        break;
      case 'env':
        return (<Env />)
        break;
      case 'function':
        return (<Function />)
        break;
      default:
        return (<RBAC />)
        break;
    }
  }

  const downloadServer = async () => {
    const { data } = await axios({
      url: `${window.location.origin}/api/generate`,
      method: "POST",
      headers: {
        "Content-Type": 'application/json',
      },
      responseType: "arraybuffer",
      data: {
        env: JSON.parse(localStorage.getItem('ENV_VAR') || "[]"),
        schema: JSON.parse(localStorage.getItem('SCHEMA') || '{"tables": []}')
      }
    })
    
    
    const fileUrl = window.URL.createObjectURL(new Blob([data]))
    const anchor = document.createElement("a")
    anchor.href = fileUrl
    anchor.setAttribute("download", "mandoor-generated-app.zip")
    anchor.click()
    anchor.remove()
  }

  return (
    <div style={{ display: "flex" }}>
      <div className={navStyles.sidebar}>
        <div className={navStyles['project-detail']}>
          <Image
            className={navStyles.logo}
            src="/mandoor-logo.png"
            alt="Mandoor Logo"
            width={45}
            height={37}
            priority
          />
          <h3>Server Generator</h3>
        </div>

        <div className={navStyles.menu}>
          <div className={navStyles.generator}>
            <div className={`${navStyles['menu-container']} ${tab === 'schema' ? navStyles.active : ''}`} onClick={() => moveTab("schema")}>
              <h4>SCHEMA</h4>
            </div>
            <div className={`${navStyles['menu-container']} ${tab === 'env' ? navStyles.active : ''}`} onClick={() => moveTab("env")}>
              <h4>ENV</h4>
            </div>
            <div className={`${navStyles['menu-container']} ${tab === 'rbac' ? navStyles.active : ''}`} onClick={() => moveTab("rbac")}>
              <h4>RBAC</h4>
            </div>
            <div className={`${navStyles['menu-container']} ${tab === 'function' ? navStyles.active : ''}`} onClick={() => moveTab("function")}>
              <h4>FUNCTION</h4>
            </div>
          </div>
          <div className={navStyles.exporter}>
            <div className={navStyles['menu-container']}>
              <h4>IMPORT</h4>
            </div>
            <div className={navStyles['menu-container']}>
              <h4>EXPORT</h4>
            </div>
            <div className={navStyles['menu-container']} onClick={downloadServer}>
              <h4>DOWNLOAD</h4>
            </div>
            <Image
              className={navStyles.logo}
              src="/mandoor-text.png"
              alt="Mandoor Text"
              width={100}
              height={15}
              priority
            />
            <p className={navStyles.copyright}>© Hubbusysyuhada</p>
          </div>
        </div>
      </div>
      <div className={navStyles['menu-content']}>
        {selectTab()}
      </div>
    </div>
  )
}

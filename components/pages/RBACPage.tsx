import { useEffect, useState } from 'react'
import style from 'styles/RBAC.module.scss'
import { RootStateType, useAppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { CREATE_ROLE, DELETE_ROLES, FETCH_ROLES_AND_PERMISSIONS, UPDATE_ROLES_AND_PERMISSIONS } from '@/store/actions/RBACAction'
import { Button, Checkbox, IconButton, TextField } from '@mui/material'
import { Delete, ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material'
import Swal from 'sweetalert2'
import { Permission, Role } from '@/store/reducer/RBACReducer'
import SwalModal from '@/helper/SwalModal'

const customTextInput = {
  style: { fontSize: "16px" },
  disableUnderline: true
}

export default function RBAC() {
  const reduxRoles = useSelector((state: RootStateType) => state.RBACReducer.allRoles)
  const [roles, setRoles] = useState<Role[]>([])
  const reduxPermissions = useSelector((state: RootStateType) => state.RBACReducer.allPermissions)
  const [openAccordion, setOpenAccordion] = useState<string>('') 
  const dispatch = useAppDispatch()
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    dispatch(FETCH_ROLES_AND_PERMISSIONS())
  }, [])

  useEffect(() => {
    setRoles(reduxRoles.filter(r => r.name !== 'owner'))
  }, [reduxRoles])

  const renderPermissions = (roleIndex: number) => {
    const allowed = roles[roleIndex].permissions.map(p => p.id)

     return reduxPermissions.map((p, i) => (
      <div className={style['permission-detail']}>
        <p>{p.name.replaceAll('_', ' ')}</p>
        <Checkbox checked={ allowed.includes(p.id) } color="success" onChange={e => handlePermissionChange(roleIndex, p)}/>
      </div>
    ))
  }

  const handleOpenAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? '' : id)
  }

  const createRole = () => {
    if (roles.map(r => r.name).includes(newRole)) {
      SwalModal({
        icon: 'error',
        text: `${newRole} already existed.`,
        hideDenyButton: true
      })
    }
    else {
      dispatch(CREATE_ROLE(newRole))
      setNewRole('')
    }
  }

  const handleNameChange = (index: number, value: string) => {
    const copy = JSON.parse(JSON.stringify(roles))
    copy[index].name = value
    setRoles([...copy])
  }

  const handlePermissionChange = (roleIndex: number, permission: Permission) => {
    const copy: Role[] = JSON.parse(JSON.stringify(roles))
    const permissions = copy[roleIndex].permissions

    const existingPermissions = permissions.map(p => p.id)
    if (existingPermissions.includes(permission.id)) permissions.splice(permissions.map(p => p.id).indexOf(permission.id), 1)
    else permissions.push(permission)
    setRoles([...copy])
    dispatch(UPDATE_ROLES_AND_PERMISSIONS({
      name: copy[roleIndex].name,
      roleId: copy[roleIndex].id,
      permissionsId: permissions.map(p => p.id)
    }))
  }

  const updateRole = (index: number) => {
    const { name, id } = roles[index]
    if (roles.filter(r => r.name === name).length > 1) {
      SwalModal({
        icon: 'error',
        text: `${name} already existed.`,
        hideDenyButton: true
      })
      setRoles(reduxRoles.filter(r => r.name !== 'owner'))
    }
    else if (name === 'owner') {
      SwalModal({
        icon: 'error',
        text: `${name} is prohibited.`,
        hideDenyButton: true
      })
      setRoles(reduxRoles.filter(r => r.name !== 'owner'))
    }
    else {
      dispatch(UPDATE_ROLES_AND_PERMISSIONS({
        name,
        roleId: id,
        permissionsId: []
      }))
    }
  }

  const deleteRole = async (index: number) => {
    SwalModal({
      icon: 'question',
      text: `DELETE ROLE ${roles[index].name}?`,
      action: () => dispatch(DELETE_ROLES(roles[index].id))
    })
  }

  return (
    <div className={style.root}>
      <div className={style['role-container']}>
        {roles.map((role, index) => (
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div className={style['role']}>
              <div className={style['role-title']} onClick={() => handleOpenAccordion(role.id)}>
                <TextField placeholder='KEY' disabled={false} value={role.name} variant="standard" InputProps={{ ...customTextInput, style: { fontSize: '20px' } }} onChange={e => handleNameChange(index, e.target.value)} onBlur={() => updateRole(index)}/>
                { openAccordion === role.id ? <ExpandMoreOutlined/> : <ExpandLessOutlined/> }

              </div>
              <div className={`${style['permissions']} ${openAccordion === role.id ? style['show'] : style['hide']}`}>
                {renderPermissions(index)}
              </div>
            </div>
            <IconButton
              size='small'
              onClick={() => deleteRole(index)}
              edge="end"
            >
              <Delete style={{ height: "14px", width: "14px" }} />
            </IconButton>
          </div>
        ))}


        <div className={style['create-div']}>
          <TextField className={style['new-role-name']} value={newRole} onChange={e => setNewRole(e.target.value)} placeholder='NAME' variant="standard" InputProps={{
            ...customTextInput,
          }} />
          <Button size='small' variant="outlined" disabled={!newRole} onClick={createRole} style={{
            height: "25px",
            color: "#08011b",
            borderColor: "#08011b"
          }}>Add Role</Button>
        </div>
      </div>
    </div>
  )
}

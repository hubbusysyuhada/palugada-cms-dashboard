export default function RBAC() {
  const rbac = {
    "tables": {
      "user": {
        "public": {
          "read": {
            "allowed": true,
            "columns": ["id", "external_id", "created_at", "activation_code", "is_active", "is_private"],
            "useAuthentication": true,
            "condition": ""
          }
        }
      }
    }
  }
  return (
    <h1>Under Construction</h1>
  )
}
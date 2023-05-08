import Editor from '@monaco-editor/react'
import { useState } from 'react'

export default function Function() {
  const [code, setCode] = useState('// write your function here')
  return (
    <Editor
        height="85vh"
        width={`100%`}
        language={"typescript"}
        value={code}
        theme={"vs-dark"}
        defaultValue="// some comment"
        onChange={(v) => setCode(v || "")}
        options={{
          fontSize: 16
        }}
      />
  )
}
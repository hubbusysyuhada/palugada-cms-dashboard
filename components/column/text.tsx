import { ColumnState } from ".";
import { useEffect } from "react";

export default function TextConstructor(props: ColumnState) {
  useEffect(() => {
    props.column.default[1](null)
    props.columnRule(true)
  }, [])

  // tiny, medium, and longtext return empty component as it only has name property
  // the default, index, unique, and not null must be false
  return <></>
}

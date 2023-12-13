import Image from "next/image";

export default function NoData() {
  const divStyle: Record<string, string> = {
    width: "100%",
    height: "calc(100vh * (75 / 100))",
    position: "relative"
  }
  return <div style={divStyle}>
    <Image
      src="/no-data.png"
      alt="no-data"
      fill
      priority
      objectFit="contain"
    />
  </div>
}
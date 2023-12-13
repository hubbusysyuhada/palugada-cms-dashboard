import Image from "next/image";
import style from 'styles/Global.module.scss'
import { ReactNode, useEffect } from "react";
import { SET_LOADING } from "@/store/actions/GlobalContextAction";
import { RootStateType, useAppDispatch } from "@/store";
import { useSelector } from "react-redux";

export default function Layout(props: { children: ReactNode }) {
  const isLoadingStore = useSelector((state: RootStateType) => state.GlobalContextReducer.isLoading)

  return (
    <>
      <div className={`${style.loading} ${isLoadingStore ? '' : style.hide}`}>
        <Image
          className={style.illustration}
          src="/loading-spinner.svg"
          alt="illustration"
          width={75}
          height={75}
          priority
        />
      </div>
      {props.children}
    </>
  )
}
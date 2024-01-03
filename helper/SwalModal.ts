import Swal, { SweetAlertOptions } from "sweetalert2"

type SwalModalPayloadType = {
  action?: () => void;
  title?: string;
  text?: string;
  html?: string;
  icon?: "warning" | "error" | "success" | "question" | "info",
  hideDenyButton?: boolean
}

export default async (payload: SwalModalPayloadType) => {
  const { action, text, title, icon, hideDenyButton, html } = payload
  const options: SweetAlertOptions = {
    icon,
    text,
    title,
    html,
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  }

  if (!hideDenyButton) {
    options.showDenyButton = true
    options.confirmButtonText = 'YES'
    options.denyButtonText = 'NO'
  }

  const { isConfirmed } = await Swal.fire(options)
  if (isConfirmed && action) {
    action()
  }
}
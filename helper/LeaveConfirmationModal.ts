import Swal from "sweetalert2"

export default async (cb: () => void) => {
  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    text: `Ingin meninggalkan halaman buat supply baru? Semua perubahan tidak akan tersimpan`,
    showDenyButton: true,
    confirmButtonText: `YES`,
    denyButtonText: `NO`,
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  })
  if (isConfirmed) cb()
}
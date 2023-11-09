import { Modal } from '@mui/material'
type DualModalProps = {
  open: boolean
}
export const DualModal = ({ open }: DualModalProps) => {
  return (
    <Modal
      open={open}
      // ={_modalState}
      onClose={() => {
        // setDropdownStatus((prev) => (prev === "up" ? "down" : "up"));
        // setModalState(false)
      }}
    >
      <>1</>
    </Modal>
  )
}

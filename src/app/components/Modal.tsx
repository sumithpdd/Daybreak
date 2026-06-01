import ReactModal from "react-modal";

interface ModalProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onRequestClose: () => void;
}

ReactModal.setAppElement("*");

export function Modal({ children, isOpen, onRequestClose }: ModalProps) {
  const modalStyle = {
    overlay: {
      zIndex: "900000",
      backgroundColor: "rgba(0,0,0,0.45)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      padding: "0px",
      borderRadius: ".75rem",
      width: "auto",
      backgroundColor: "#0d1626",
      border: "1px solid #1d2c44",
    },
  };

  return (
    <ReactModal
      onRequestClose={onRequestClose}
      isOpen={isOpen}
      style={modalStyle}
    >
      {children}
    </ReactModal>
  );
}

interface ModalBody {
  children: React.ReactNode;
}

export function ModalBody({ children }: ModalBody) {
  return <form className="dark-scope w-[24rem] md:w-[44rem] lg:w-[56rem] rounded-xl p-8">{children}</form>;
}

import {createPortal} from "react-dom";
import * as React from "react";
import type {ReactNode} from "react";
import "./Modal.css";
import type {Key} from "react";

type Props = { isOpen: boolean; onClose: () => void; children: ReactNode; key?: Key | null };

function Modal(
    {isOpen, onClose, children, key}: Props
): null | React.ReactPortal {
    if (!isOpen) return null;

    return createPortal(
        <div
            id="shared_modal"
        >
            <button
                id="close_modal-btn"
                onClick={onClose}
            >
                x
            </button>
            {children}
        </div>,
        document.body,
        key
    );
}

export default Modal;

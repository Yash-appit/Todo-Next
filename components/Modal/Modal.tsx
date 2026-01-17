import React, { ReactNode } from 'react';
import { Modal } from 'react-bootstrap';

interface CustomModalProps {
    children: ReactNode;
    show: boolean;
    onHide: () => void;
    size?: "sm" | "lg" | "xl";
    title: string;
    custom?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({ children, show, onHide, size, title, custom }) => {
    return (
        <Modal show={show} onHide={onHide} size={size} centered backdrop="static" className={`adminCustomPop ${custom}`}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
        </Modal>
    );
};

export default CustomModal;

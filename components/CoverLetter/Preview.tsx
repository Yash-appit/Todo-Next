import React, { useState, useEffect } from 'react';
import Loader from '@/Layout/Loader';
import Dropdown from 'react-bootstrap/Dropdown';
import ToastMessage from '@/Layout/ToastMessage';
import pdf from "@/assets/Images/resume-builder/pdf.svg";
import { MdKeyboardArrowDown } from "react-icons/md";
import PackagePop from '@/components/PackagePop';
import CustomModal from '@/components/Modal/Modal';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PreviewProps {
  data?: unknown;          // or the actual shape you expect
  Generated: string | null; // HTML string returned from the API
}



const setToSessionStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, value);
  }
};


const getFromsessionStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(key);
  }
  return null;
};


const Preview: React.FC<PreviewProps> = ({ data, Generated }) => {

  const [isDownloading, setIsDownloading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isForgetOpen, setForgetOpen] = useState(false);
  const openForget = () => setForgetOpen(true);
  const closeForget = () => setForgetOpen(false);

  const downloadCoverLetterPDF = async () => {
    try {
      setIsDownloading(true);

      const element = document.querySelector('.prev-temp') as HTMLElement;
      if (!element) {
        throw new Error('Cover letter preview not found');
      }

      // Generate canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('CoverLetter.pdf');

      ToastMessage({
        type: "success",
        message: "Cover letter downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading cover letter:', error);
      ToastMessage({
        type: "error",
        message: "Failed to download cover letter. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (<>
    <div className="preview-container">
      <Dropdown>
        <Dropdown.Toggle
          id="dropdown-basic"
          className="prim-but"
          disabled={isDownloading}
          style={{
            fontSize: isIOS ? '16px' : 'inherit'
          }}
        >
          {isDownloading ? "...Downloading" : <>Download<MdKeyboardArrowDown /></>}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            className='m-0 py-0'
            onClick={downloadCoverLetterPDF}
          >
            <Image src={pdf} alt="pdf" className="me-2" />Download PDF
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {Generated ? (
        <div className="prev-temp" dangerouslySetInnerHTML={{ __html: Generated }} />
      ) : (
        <Loader />
      )}


    </div>



    <CustomModal show={isForgetOpen} onHide={() => setForgetOpen(false)} custom='package pack2' title='' size='lg'>
      <PackagePop close={() => setForgetOpen(false)} />
    </CustomModal>
  </>);
};

export default Preview;
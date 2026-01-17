import React, { useState, useEffect } from 'react';
// import { CVTemplateList, UpdateCV } from '../../services/CVTemplate';
import Loader from '@/Layout/Loader';
import { DownloadCoverLetter } from '@/services/CVTemplate';
import Dropdown from 'react-bootstrap/Dropdown';
import ToastMessage from '@/Layout/ToastMessage';
import pdf from "@/assets/Images/resume-builder/pdf.svg";
import { MdKeyboardArrowDown } from "react-icons/md";
import PackagePop from '@/components/PackagePop';
import CustomModal from '@/components/Modal/Modal';
import Image from 'next/image';
// import { debounce } from 'lodash';

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

  const downloadCL = async (type: string) => {
    try {
      setIsDownloading(true);
      const CLID = Number(getFromsessionStorage("coverLetterId"));
      const templateID = getFromsessionStorage("CLtemplateId");

      const response = await DownloadCoverLetter({
        cover_letter_id: CLID,
        template_id: templateID,
        type: type,
      });

      ToastMessage({
        type: "success",
        message: "Cover letter downloaded successfully!",
      });
    } catch (error) {
      

      ToastMessage({
        type: "error",
        message: error,
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
            onClick={() => downloadCL('pdf')}
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
      <PackagePop close={() => setForgetOpen(false)}/>
    </CustomModal>
  </>);
};

export default Preview;
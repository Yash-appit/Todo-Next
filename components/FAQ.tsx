"use client"

import React, {useState} from 'react';
import faq from "@/assets/Images/faq.svg";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
// import { FiPlus } from "react-icons/fi";
// import { FaPlus, FaMinus } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa6";
import ToastMessage from '@/Layout/ToastMessage';
import { fetchAllFaq } from '@/services/faqs';
import Link from 'next/link';
import "@/styles/Other.css";
import Image from 'next/image';

// import AddIcon from '@mui/icons-material/Add';
// import RemoveIcon from '@mui/icons-material/Remove';

const FAQ = () => {
  const [expanded, setExpanded] = useState<string | false>('panel0');
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAllFaqs, setShowAllFaqs] = useState<boolean>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const response = await fetchAllFaq();
      setData(response?.data?.data);
      // console.log(response.data.data);
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      ToastMessage({
        type: "error",
        message: (error as Error).message,
      });
    }
  };

  const displayedFaqs = showAllFaqs ? data : data.slice(0, 4);
  const handleShowAllFaqs = () => {
    setShowAllFaqs(true);
  };



  return (<>
    <section className='faq-section pt-5'>
      <div className="container-fluid pt-5">
        <div className="row mt-4 m-0">
          <div className="col-lg-5 m-auto">
            <h1>Clear answers to help you build better resumes faster.</h1>
            <p className='my-4'>TodoResume is an AI-powered platform that helps users quickly create professional, ATS-friendly resumes using smart tools and templates.</p>
          </div>
          <div className="col-lg-7">
            <Image src={faq} alt="" className='w-100'/>
          </div>
        </div>
      </div>
    </section>


    <section className='faq-list pt-4'>
      <div className="row m-0 justify-content-between">
        <div className="col-lg-4">
          <h2>Any questions?</h2>
          <h2>We got you.</h2>
          <p className='pt-4 pb-4'>Yet bed any for assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>

          {!showAllFaqs && (
            <Link href="#" onClick={handleShowAllFaqs} className='m-0'>More FAQs <FaArrowRight /></Link>
          )}
        </div>
        <div className="col-lg-6 pt-0 pb-3">
      
      {displayedFaqs.map((faq:any, index:number) => (
        <Accordion 
          key={index} 
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{ 
            boxShadow: 'none',
            border: 'none',
            marginBottom: '10px',
            '&:before': {
              display: 'none'
            }
          }}
        >
          <AccordionSummary
            expandIcon={expanded === `panel${index}` ? <FaMinus /> : <FaPlus />}
            aria-controls={`panel${index}bh-content`}
            id={`panel${index}bh-header`}
            style={{
              padding: '16px 0'
            }}
          >
            <Typography style={{ fontWeight: 'bold' }}>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails style={{ padding: '16px 0 24px 0' }}>
            <Typography>
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
        </div>
      </div>
    </section>
  </>)
}

export default FAQ

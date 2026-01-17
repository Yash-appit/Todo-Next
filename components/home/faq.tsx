import React, { useState, useEffect } from 'react';
import { fetchFaqPageData } from '@/services/faqs/index';
import ToastMessage from '@/Layout/ToastMessage';
import faq from "@/assets/Images/Home/faq/faq2.svg";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box
} from '@mui/material';
import { FiPlus } from "react-icons/fi";
import ScrollFloat from '@/components/Animation/ScrollFloat';
import { trackEvent } from '@/config/AnalyticsTracker';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';

const Faq: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const type = params?.type as string;

  const [expanded, setExpanded] = React.useState<string | false>('panel0');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      const response = await fetchFaqPageData(type ? type : "Home");
      setData(response.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      ToastMessage({
        type: "error",
        message: (error as Error).message,
      });
    }
  };

  return (
    <div className='package-faq mb-4'>
      <div className="container">
        <div className="row text-center pb-5 justify-content-center m-0">
          <div className="col-lg-8 d-flex justify-content-center">
            <h2 className='my-4'>
              <ScrollFloat
                animationDuration={1}
                ease='back.inOut(2)'
                scrollStart='center bottom+=50%'
                scrollEnd='bottom bottom-=40%'
                stagger={0.03}
              >
                Frequently Asked Questions
              </ScrollFloat>
            </h2>
          </div>

          {isLoading ? (
            <div className="col-12 text-center">
              <p>Loading...</p>
            </div>
          ) : (
            <>
              <div className="col-lg-6">
                <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
                  {data?.data[0]?.faqData?.map((faqItem: any, index: number) => (
                    <Accordion
                      key={index}
                      expanded={expanded === `panel${index}`}
                      onChange={handleChange(`panel${index}`)}
                      sx={{
                        '&:not(:last-child)': { mb: 1 },
                        '&:before': { display: 'none' },
                        boxShadow: 'none',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <FiPlus style={{
                            transform: expanded === `panel${index}` ? 'rotate(135deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                          }} />
                        }
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            margin: '12px 0',
                          },
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        {/* Removed the Box inside Typography */}
                        <Typography sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FiPlus />
                          {faqItem.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography color="text.secondary">
                          {faqItem.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </div>

              <div className="col-lg-6 text-center m-auto ques">
                <Image src={faq} alt="FAQ illustration" loading="lazy" />

                <div className='mt-5 pt-4'>
                  <p className='any'>Any Question?</p>
                </div>
                <div className='mb-3'>
                  <p>Feel free to ask any questions or share feedback</p>
                </div>

                <div className='my-1'>
                  <Link 
                    href="/contact" 
                    onClick={() => {
                      trackEvent({
                        category: 'Contact',
                        action: 'Open Contact Page',
                        label: 'Contact Page'
                      });
                    }} 
                    className='prim-but'
                  >
                    Share Now
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Faq;
import React from 'react'
// import Accordion from 'react-bootstrap/Accordion';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box
  } from '@mui/material';
  import { FiPlus } from "react-icons/fi";
  import faq from "@/assets/Images/Home/faq/faq2.svg";
import ScrollFloat from '@/components/Animation/ScrollFloat';
import "@/styles/Home.css";
import Link from 'next/link';
import Image from 'next/image';

const PackageFaq: React.FC = () => {

  const [expanded, setExpanded] = React.useState<string | false>('panel1');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
  };

    return (<>
      
<div className='package-faq mb-4'>
      <div className="container">
        <div className="row text-center pb-5 justify-content-center m-0">
          {/* <h2 className='py-3'>Frequently Asked Questions</h2>   */}

          <div className="col-lg-8 d-flex justify-content-center">

            <h2 className='my-5 pt-2'><ScrollFloat
                animationDuration={1}
                ease='back.inOut(2)'
                scrollStart='center bottom+=50%'
                scrollEnd='bottom bottom-=40%'
                stagger={0.03}
              >Frequently Asked Questions </ScrollFloat></h2>
            {/* <p>Crafting Success, One Resume at a Time</p> */}

          </div>

         
            <div className="col-lg-6" >
              
              <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
               
                  <Accordion
          
                    expanded={expanded === `panel1`}
                    onChange={handleChange(`panel1`)}
                    sx={{
                      '&:not(:last-child)': { mb: 1 },
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
              
                  >
                    <AccordionSummary
                      expandIcon={<FiPlus 
                        style={{
                          transform: expanded === `panel1` ? 'rotate(135deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease'
                        }} 
                      />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          margin: '12px 0',
                        },
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <Typography sx={{ fontWeight: 500 }}>
                        <FiPlus />The Importance of a Compelling Resume in Today's Competitive Job Market
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography color="text.secondary">
                      In today's highly competitive job market, a compelling resume can make all the difference in securing your dream role. Your resume serves as the first impression you make on potential employers, and it needs to be polished, professional, and showcasing your unique qualifications.

                                <p>
                                    A well-crafted resume demonstrates your relevant skills, experience, and achievements in a clear and concise manner. It should be tailored to the specific job you are applying for, highlighting the key criteria the employer is seeking. By taking the time to optimize your resume, you position yourself as a standout candidate among the sea of applicants.
                                </p>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>




                  <Accordion
          
          expanded={expanded === `panel2`}
          onChange={handleChange(`panel2`)}
          sx={{
            '&:not(:last-child)': { mb: 1 },
            '&:before': { display: 'none' },
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
          }}
         
        >
          <AccordionSummary
            expandIcon={<FiPlus style={{
              transform: expanded === `panel2` ? 'rotate(135deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} />}
            sx={{
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>
              <FiPlus />Why Investing in a Professional Resume Review is a Smart Career-Boosting Move?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
            Investing in a professional resume review is a strategic career move that can pay dividends for job seekers. A seasoned resume expert can transform your CV into a polished, achievement-driven document that commands attention and elevates your candidacy.

                                <p>
                                    Don't underestimate the power of resume optimization. In today's competitive job market, your resume is often the first impression you make on prospective employers. A resume review by a skilled professional can uncover hidden strengths, quantify your accomplishments, and align your skills with targeted job requirements.
                                </p>
                                <p>
                                    Leveraging resume writing expertise is a smart investment in your future. A resume specialist can provide an unbiased, expert assessment of your document, identifying areas for refinement and crafting persuasive, keyword-rich content that gets results. This personalized attention can mean the difference between your resume landing in the "yes" pile or getting lost in the shuffle.
                                </p>
                                <p>
                                    Take your career to new heights by partnering with a professional resume review service. This strategic career-boosting move can help you stand out, secure interviews, and achieve your job search goals.
                                </p>
            </Typography>
          </AccordionDetails>
        </Accordion>




        <Accordion
          
          expanded={expanded === `panel3`}
          onChange={handleChange(`panel3`)}
          sx={{
            '&:not(:last-child)': { mb: 1 },
            '&:before': { display: 'none' },
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
          }}
         
        >
          <AccordionSummary
            expandIcon={<FiPlus style={{
              transform: expanded === `panel3` ? 'rotate(135deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} />}
            sx={{
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>
              <FiPlus />The Importance of a Compelling Resume in Today's Competitive Job Market
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">
            In today's highly competitive job market, a compelling resume can make all the difference in securing your dream role. Your resume serves as the first impression you make on potential employers, and it needs to be polished, professional, and showcasing your unique qualifications.

                      <p>
                          A well-crafted resume demonstrates your relevant skills, experience, and achievements in a clear and concise manner. It should be tailored to the specific job you are applying for, highlighting the key criteria the employer is seeking. By taking the time to optimize your resume, you position yourself as a standout candidate among the sea of applicants.
                      </p>
            </Typography>
          </AccordionDetails>
        </Accordion>





        <Accordion
          
          expanded={expanded === `panel4`}
          onChange={handleChange(`panel4`)}
          sx={{
            '&:not(:last-child)': { mb: 1 },
            '&:before': { display: 'none' },
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
          }}
           
        >
          <AccordionSummary
            expandIcon={<FiPlus style={{
              transform: expanded === `panel4` ? 'rotate(135deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} />}
            sx={{
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>
              <FiPlus />Why Investing in a Professional Resume Review is a Smart Career-Boosting Move?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
            Investing in a professional resume review is a strategic career move that can pay dividends for job seekers. A seasoned resume expert can transform your CV into a polished, achievement-driven document that commands attention and elevates your candidacy.

                                <p>
                                    Don't underestimate the power of resume optimization. In today's competitive job market, your resume is often the first impression you make on prospective employers. A resume review by a skilled professional can uncover hidden strengths, quantify your accomplishments, and align your skills with targeted job requirements.
                                </p>
                                <p>
                                    Leveraging resume writing expertise is a smart investment in your future. A resume specialist can provide an unbiased, expert assessment of your document, identifying areas for refinement and crafting persuasive, keyword-rich content that gets results. This personalized attention can mean the difference between your resume landing in the "yes" pile or getting lost in the shuffle.
                                </p>
                                <p>
                                    Take your career to new heights by partnering with a professional resume review service. This strategic career-boosting move can help you stand out, secure interviews, and achieve your job search goals.
                                </p>
            </Typography>
          </AccordionDetails>
        </Accordion>

             
              </Box>
            </div>




            <div className="col-lg-6 text-center m-auto ques my-element" data-aos="fade-up" data-aos-delay="200">
              <Image src={faq} alt="" loading="lazy"/>
              <h4 className='mt-5'>Any Question?</h4>
              <p>Feel free to ask any questions or share feedback</p>

              <div className='my-1'>
            <Link href="/contact" type="button" className='prim-but'>Share Now</Link>
          </div>
            </div>
    

        </div>
      </div>
    </div>
    </>)
}

export default PackageFaq

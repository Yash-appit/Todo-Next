import React from 'react'
import { BsFillLightningChargeFill } from "react-icons/bs";
import { BsStars } from "react-icons/bs";
import { FaUpload } from "react-icons/fa6";
import { IoIosHeart } from "react-icons/io";
import SpotlightCard from '@/components/Animation/SpotLightCard';
import ScrollFloat from '@/components/Animation/ScrollFloat';

// import how1 from '../../../assets/Images/how1.svg'
// import how2 from '../../../assets/Images/how2.svg'
// import how3 from '../../../assets/Images/how3.svg'
// import how4 from '../../../assets/Images/how4.svg'

const HowWorks: React.FC = () => {
    return (
        <section className="sec-bg how-work">
            <div className='container-fluid py-5 pb-3 text-center'>
                {/* <h2 className="pt-3 my-element" data-aos="fade-right" data-aos-delay="200">How it works</h2> */}

                <div className='pb-2 pt-3'><ScrollFloat
    animationDuration={1}
    ease='back.inOut(2)'
    scrollStart='center bottom+=50%'
    scrollEnd='bottom bottom-=40%'
    stagger={0.03}
>Elevate Your Career</ScrollFloat></div>
                <h2 className='mb-3'><ScrollFloat
                    animationDuration={1}
                    ease='back.inOut(2)'
                    scrollStart='center bottom+=50%'
                    scrollEnd='bottom bottom-=40%'
                    stagger={0.03}
                >Powerful Resume Features Await </ScrollFloat></h2>


                <div className="row text-center justify-content-around m-0 px-5">

                    <SpotlightCard className="custom-spotlight-card col-lg-6 my-element" data-aos="fade-down" data-aos-delay="100" spotlightColor="rgba(40, 255, 32, 0.35)">
                        <div><BsFillLightningChargeFill /></div>

                        <div>
                            <h3>
                                Custom Templates
                            </h3>

                            <p>Choose from a variety of professionally designed resume templates tailored to your industry.</p>

                            <a>Explore Templates</a>
                        </div>
                    </SpotlightCard>




                    <SpotlightCard className="col-lg-6 my-element custom-spotlight-card" data-aos="fade-down" data-aos-delay="300" spotlightColor="rgba(40, 255, 32, 0.35)">
                        <div><BsStars /></div>
                        <div>
                            <h3>
                                Real-Time Editing
                            </h3>

                            <p>Edit your resume seamlessly and see changes instantly, ensuring a smooth writing experience.</p>

                            <a>Edit Now</a>
                        </div>
                    </SpotlightCard>



                    <SpotlightCard className="col-lg-6 my-element custom-spotlight-card" data-aos="fade-down" data-aos-delay="400" spotlightColor="rgba(40, 255, 32, 0.35)">
                        <div><FaUpload /></div>


                        <div>
                            <h3>
                                Export Options
                            </h3>

                            <p>Download your resume in multiple formats such as PDF, Word, and more for easy sharing.</p>

                            <a>Download Formats</a>
                        </div>
                    </SpotlightCard>



                    <SpotlightCard className="col-lg-6 my-element custom-spotlight-card" data-aos="fade-down" data-aos-delay="600" spotlightColor="rgba(40, 255, 32, 0.35)">
                        <div><IoIosHeart /></div>


                        <div>
                            <h3>
                                Expert Tips
                            </h3>

                            <p>Access professional tips and advice to enhance your resume and improve your job applications.</p>

                            <a>Get Tips</a>
                        </div>
                    </SpotlightCard>

                </div>

            </div>


        </section>
    )
}

export default HowWorks

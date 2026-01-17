import React from 'react';
import rs1 from "@/assets/Images/AITools/rs1.webp";
import rs2 from "@/assets/Images/AITools/rs2.webp";
import rs3 from "@/assets/Images/AITools/rs3.webp";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Image from 'next/image';

const Resumes = () => {

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        arrows: false,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1000,
        centerMode: true,
        centerPadding: '40px',
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    centerMode: true,
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    centerMode: true,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                }
            },
            {
                breakpoint: 450,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                }
            }
        ]
    };


    return (
        <div className="resume-slider mb-4">
            <div className='row m-0 me-2 text-center py-4'>
                <h4>Make your move with a stand-out resume template</h4>
                <Slider {...settings} className='mt-4'>
                    <Image src={rs1} alt="" />
                    <Image src={rs2} alt="" />
                    <Image src={rs3} alt="" />
                </Slider>
            </div>
        </div>
    )
}

export default Resumes

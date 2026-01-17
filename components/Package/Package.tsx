import { useState, useEffect, useCallback, useRef } from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { TiTickOutline } from "react-icons/ti";
// import { Link, useNavigate } from 'react-router-dom';
import ToastMessage from '@/Layout/ToastMessage';
import { packageList, packageBuy } from '@/services/package/Index';
import { MdCurrencyRupee } from "react-icons/md";
import tick from "@/assets/Images/tick.png";
import tick2 from "@/assets/Images/tick2.png";
import CustomModal from '@/components/Modal/Modal';
import Login from '@/components/Login';
import pack from "@/assets/Images/pack.webp";
import { LuDot } from "react-icons/lu";
import { RAZORPAY_KEY } from "@/config/index";
import Success from "@/components/Success";
import { useTimeZone } from "@/context/TimeZoneContext";
import ScrollReveal from '@/components/Animation/ScrollReveal2';
import TiltedCard from '@/components/Animation/TiltedCard';
import SafeAds from '@/common/SafeAds';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Key = RAZORPAY_KEY;
// console.log(Key, "Key");

// import { useTimeZone } from './';

interface PackageProps {
    close: () => void;
}

const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };

  const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  };
  const getFromSessionStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  };
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const Package: React.FC<PackageProps> = ({ close }) => {
    const [Package, setPackage] = useState<any[] | null>(null);
    const { timeZone, setTimeZone } = useTimeZone();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    // const navigate = useNavigate();
    // const Currency = localStorage.getItem('currency');
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const openLoginModal = () => setLoginModalOpen(true);
    const [token, setToken] = useState(getFromLocalStorage('token'));
    const [name, setName] = useState(getFromLocalStorage('name'));
    const [email, setEmail] = useState(getFromLocalStorage('email'));
    const [currency, setCurrency] = useState<string | null>(null);
    const [isThankOpen, setThankOpen] = useState(false);
    const openThankModal = () => setThankOpen(true);
    const packageRef = useRef<HTMLDivElement>(null);
     const packageData = getFromLocalStorage("package");
     const shouldShowAds = packageData !== "true";
    const scrollToPackage = () => {
        if (packageRef.current) {
          packageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      };
    // console.log(timeZone);


    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, []);


    useEffect(() => {
        setToken(getFromLocalStorage('token'));
    }, [token]);

    useEffect(() => {
        if (!isLoading && Package) {
            setTimeout(() => {
                setEqualCardHeights();
            }, 100); // Slight delay ensures DOM is fully rendered
        }
    }, [isLoading, Package]);


    const fetchData = async () => {
        try {
            const response = await packageList();
            setPackage(response?.data?.membershipList);
            // setCurrency(response?.data?.countryCode);
            // console.log(response.data);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            let errorMessage = (error as Error).message;
            ToastMessage({
                type: "error",
                message: errorMessage,
            });
        }
    };

const setEqualCardHeights = () => {
    const cards = document.querySelectorAll('.equal-height-cards .card');
    let maxHeight = 0;

    // Reset height and find the max height
    cards.forEach(card => {
        (card as HTMLElement).style.height = 'auto'; // Reset height
        const height = (card as HTMLElement).offsetHeight;
        if (height > maxHeight) {
            maxHeight = height;
        }
    });

    // Set all card-body heights to maxHeight
    cards.forEach(card => {
        (card as HTMLElement).style.minHeight = `${maxHeight}px`; // Apply max height
    });
};


    const Shimmer = () => (
        <div className="shimmer-wrapper row">
            <div className="col-lg-4 my-4">
                <div className='shimmer-head'></div>
                <div className="shimmer-line"></div>
                <div className='shimmer-head'></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
            </div>
            <div className="col-lg-4 my-4">
                <div className='shimmer-head'></div>
                <div className="shimmer-line"></div>
                <div className='shimmer-head'></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
            </div>
            <div className="col-lg-4 my-4">
                <div className='shimmer-head'></div>
                <div className="shimmer-line"></div>
                <div className='shimmer-head'></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line"></div>
            </div>
        </div>
    );



    const validateAndBuyPackage = useCallback(async (selectedPackage: any) => {
        try {
            setIsLoading(true);

            const response = await packageBuy({
                amount: timeZone === "Asia/Calcutta" ? selectedPackage?.prices[0]?.inr_price : selectedPackage?.prices[0]?.usd_price,
                currency: timeZone === 'Asia/Calcutta' ? 'INR' : 'USD',
                package_id: selectedPackage?.prices[0]?.membership_plan_id,
                type: selectedPackage?.type,
                gst_in_percentage: timeZone === 'Asia/Calcutta' ? '18%' : null,
            });



            // console.log(response?.data?.data?.gatewayOrderId, "Order_id");

            const paymentAmount = timeZone === "Asia/Calcutta" ? selectedPackage?.prices[0]?.inr_price : selectedPackage?.prices[0]?.usd_price;



            const options = {
                key: Key,
                amount: paymentAmount * 100,
                currency: timeZone === 'Asia/Calcutta' ? 'INR' : 'USD',
                name: 'TodoResume',
                description: 'Purchase Package',
                order_id: response?.data?.data?.gatewayOrderId, // Add the order_id from API response
                handler: function (response: any) {
                    if (response.razorpay_payment_id) {
                        openThankModal();
                    }
                },
                prefill: {
                    name: name,
                    email: email,
                    // contact: "992864849",
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            // console.error('Payment error:', error);
            ToastMessage({
                type: "error",
                message: error.message || error || 'Payment failed',
            });
        }
    }, [currency, name, email]);

    return (<>

        <section className='sec-bg2'>
            <div className="container-fluid pt-4">
                <div className="row pt-5">
                    <div className="col-lg-6 mt-5 p-0" data-aos="fade-up" data-aos-delay="200">
                        <div className="cont p-5">
                            <h1>Pricing <span className='sec-col prim'>Designed</span > <br />

                                <span>For Your Resume</span></h1>
                            <p className='py-4 my-3'>Craft a standout resume with ease. Build, customize, and showcase your professional story in minutes. Choose from 18+ templates.</p>

                            <div className="d-flex align-items-center">
                                {/* <Link to="/create-resume" type='button' className='prim-but mt-3'>Our Service</Link> */}
                                <Link href="/contact" type='button' className='sec-but mt-3'>Contact US</Link>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 pt-5 cont-img my-element" data-aos="fade-up" data-aos-delay="200">
                        <div className="bg-white p-3 text-center">
                            {/* <img src={pack} alt="" loading="lazy" /> */}

                            <TiltedCard
                            imageSrc={pack}
                            // altText="Kendrick Lamar - GNX Album Cover"
                            // captionText="Kendrick Lamar - GNX"
                            containerHeight="100%"
                            containerWidth="100%"
                            imageHeight="100%"
                            imageWidth="100%"
                            rotateAmplitude={12}
                            scaleOnHover={1.02}
                            showMobileWarning={false}
                            showTooltip={false}
                            displayOverlayContent={true}

                        />
                        </div>
                    </div>
                </div>
            </div>
        </section>

       
        <section className='sec-bg' ref={packageRef}>
            <div className='container package'>
                <div className="row text-center justify-content-center mt-5 pb-4">
                    {/* <span className='head'><LuDot /> Pricing</span> */}
                    <h1><span className='sec-col'>Simple</span> Pricing, <br />
                        Powerful <span className='sec-col'>Solutions</span></h1>
                    {/* <h4>Transform Your Resume with our expert crafted resume team</h4> */}

                    
                    {isLoading ? (
                        <Shimmer />
                    ) : (
                        Package && Package.map((pack, index) => (
                            <div className={`col-lg-5 my-4 ${pack.isPurchased === true ? "purch" : ""} equal-height-cards`} key={pack.id}>
                                <div className="card rounded-4">
                                    <div className="card-body p-4">
                                        {pack.isPurchased === true ? <p>{pack.id % 2 === 0 ? (
                                            <Image src={tick} alt="" loading="lazy" className='w-70' />
                                        ) : (
                                            <Image src={tick2} alt="" loading="lazy" className='w-70' />
                                        )} Activated</p> : <p className="card-title">{pack.name}</p>}

                                        {/* <p className="card-text">{pack.title}</p> */}
                                        <div className='d-flex align-items-center justify-content-center pack-head'>

                                            {pack.prices.map((price: any) => (<>
                                                <h3><s>{timeZone === "Asia/Calcutta" ? "₹" : "$"}
                                                       {timeZone === "Asia/Calcutta" ? price.mock_price_inr : price.mock_price_usd}</s></h3>
                                                <h1>
                                                    {timeZone === "Asia/Calcutta" ? <MdCurrencyRupee className='mb-1' /> : <BsCurrencyDollar className='mb-1' />}
                                                    {timeZone === "Asia/Calcutta" ? price.inr_price : price.usd_price}
                                                </h1>
                                                </>))}
                                            {/* <h2>{pack.prices[0].currency === "INR" ? <MdCurrencyRupee className='mb-1'/> : <BsCurrencyDollar className='mb-1'/>}{pack.prices[0].currency === "INR" ? pack.prices[0].inr_price : pack.prices[0].usd_price}</h2> */}
                                            <span>{pack.type}</span>
                                        </div>
                                        {pack.isPurchased === false &&
                                            <>
                                                {token &&
                                                    <button
                                                        className="prim-but"
                                                        onClick={() => validateAndBuyPackage(pack)}
                                                    >
                                                        Get Started
                                                    </button>
                                                }
                                                {!token &&
                                                    <button
                                                        className="prim-but"
                                                        onClick={() => router.push('/login')}
                                                    >
                                                        Get Started
                                                    </button>
                                                }
                                            </>}
                                        <ul className='mb-4'>
                                            <p className='my-3'>Professionally crafted resume by a Certified Resume Writers to highlight your skills.</p>
                                            {pack?.details.map((det: any, index: number) => (<>
                                                <li key={index} className='mb-2'> {pack.id % 2 === 0 ? (
                                                    <Image src={tick} alt="" loading="lazy" className='tick' />
                                                ) : (
                                                    <Image src={tick2} alt="" loading="lazy" className='tick' />
                                                )} {det}</li>
                                                </>))}
                                                <li>{pack.id % 2 === 0 ? (
                                                    <Image src={tick} alt="" loading="lazy" className='tick' />
                                                ) : (
                                                    <Image src={tick2} alt="" loading="lazy" className='tick' />
                                                )} Ads Free</li>
                                        </ul>


                                    </div>
                                </div>
                            </div>
                            
                        ))
                        
                        )}

                </div>
            </div>
        </section>
     


        <section className="pack-details my-3">
            <div className="container">
                <div className="row m-0 p-0">
                    <div className="col-lg-10 m-auto px-4">
                        <div className="row bg-white rounded-5 w-100 m-0">
                            <div className="col-lg-5 p-0">
                                <h2>Plan</h2>
                                <h2 className="sec-col">Details</h2>

                                <div className="pt-2">
                                    {/* <p>Resume Generation</p> */}
                                    <p>Pdf Downloads</p>
                                    <p>Professional Resume Templates</p>
                                    <p>Professional Tips</p>
                                    <p>AI Writer</p>
                                </div>
                            </div>


                            <div className="col-lg-5 sec p-0">
                                <button className="prim-but" onClick={scrollToPackage}>Get Started</button>
                                <div>
                                    {/* <p>Unlimited Generation </p> */}
                                    <p>Unlimited Downloads</p>
                                    <p>ATS Approved Resume Templates</p>
                                    <p>Get Professional Tips For Sections</p>
                                    <p>Enhance Your Resume Sections with AI</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {shouldShowAds &&
            <SafeAds />
        }
        <CustomModal show={isThankOpen} onHide={() => setThankOpen(false)} custom='thank' title="">
            <Success Hide={() => setThankOpen(false)} Close={close} />
        </CustomModal>

    </>)
}

export default Package;

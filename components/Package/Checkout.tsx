import { useState, useEffect, useCallback } from "react";
// import { useNavigate } from 'react-router-dom';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

import { FaRegCircleDot } from "react-icons/fa6";
// import { MdOutlineMailOutline } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import "@/styles/Checkout.css";
import razor from "@/assets/Images/razor.png";
// import TextInput from "../Layout/TextInput";
import { packageList, packageBuy } from '../../services/package/Index';
import { RAZORPAY_KEY } from "@/config/index";
// import { IoLockClosed } from "react-icons/io5";
import CustomModal from "@/components/Modal/Modal";
import Success from "@/components/Success";
import Loader from "@/Layout/Loader";
import { MdCurrencyRupee } from "react-icons/md";
import { BsCurrencyDollar } from "react-icons/bs";
import Image from "next/image";
import { useRouter } from "next/navigation";


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

const Checkout: React.FC = () => {
   
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isloading, setIsLoading] = useState<boolean>(false);
    // const navigate = useNavigate();
     const router = useRouter();
    const [currency, setCurrency] = useState(getFromLocalStorage('currency'));
    
    const Key = RAZORPAY_KEY;
    const [isThankOpen, setThankOpen] = useState(false);
    const openThankModal = () => setThankOpen(true);
   


    const validateAndBuyPackage = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // First call the packageBuy API
            const response = await packageBuy({
                amount: selectedPackage?.prices[0]?.currency === "INR" ? selectedPackage?.prices[0]?.inr_price : selectedPackage?.prices[0]?.usd_price,
                currency: selectedPackage?.prices[0]?.currency,
                package_id: selectedPackage?.prices[0]?.membership_plan_id,
                type: selectedPackage?.type
            });

            const paymentAmount = selectedPackage?.prices[0]?.currency === "INR" ? selectedPackage?.prices[0]?.inr_price : selectedPackage?.prices[0]?.usd_price;
            // console.log(paymentAmount);
            
            // console.log(response?.data?.data?.gatewayOrderId)
            
            
            const options = {
                key: Key,
                amount: paymentAmount * 100,
                currency: currency === 'INR' ? 'INR' : 'USD',
                name: 'TodoResume',
                description: 'Purchase Package',
                order_id: response?.data?.data?.gatewayOrderId, // Add the order_id from API response
                handler: function (response: any) {
                    if (response.razorpay_payment_id) {
                        openThankModal();
                    }
                },
                prefill: {
                    name: "yash",
                    email: "yashsh2018@gmail.com",
                    // contact: "992864849",
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            console.error('Payment error:', error);
        }
    }, [selectedPackage, currency]);


    useEffect(() => {
        const token = getFromLocalStorage('token');
        if (!token) {
            router.push('/');
        }else{
        fetchPackageData();
        setCurrency(getFromLocalStorage('currency'));
    }
    }, [router]);

    // useEffect(() => {
    //     fetchPackageData();
    // }, []);

    const fetchPackageData = async () => {
        try {
            setIsLoading(true);
            const response = await packageList(); // Adjust the URL to your API endpoint
            setSelectedPackage(response?.data);

            const pack = getFromSessionStorage('Pack');
            // console.log(pack);

            setIsLoading(false);
            if (!pack) {
                router.push('/');
            } else {
                const packageId = parseInt(pack, 10);
                const foundPackage = response?.data?.membershipList.find((pkg: any) => pkg.id === packageId);

                if (foundPackage) {
                    setSelectedPackage(foundPackage);
                } else {
                    router.push('/');
                }
            }
        } catch (error) {
            console.error('Error fetching package data:', error);
           router.push('/');
        } finally {
            setLoading(false);
        }
    };

    

    if (isloading) {
        return <div><Loader /></div>; // Or a loading spinner
    }

    // if (!selectedPackage) {
    //     return null; // Or a fallback UI
    // }






    return (<>
        <section className='sec-bg checkout pt-5 pb-5'>
            <div className='container pt-5'>
                <div className="row pt-3">
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                        <Breadcrumb.Item href="/packages">Package</Breadcrumb.Item>
                        <Breadcrumb.Item active>Checkout</Breadcrumb.Item>
                    </Breadcrumb>
                    <div className="col-lg-8">

                        <div className="row">
                            

                            <div className='mt-3 razor'>
                                <div className='d-flex align-items-center'>
                                    <Image src={razor} alt="" /> <span className='pl-2'>Pay with Razorpay</span>
                                </div>
                                <p className='mt-3'><FaRegCircleDot className='ml-2' />Pay securely by Debit or Credit Card or internet banking through Razorpay</p>
                            </div>
                        </div>
                       
                        <button onClick={validateAndBuyPackage}
                            className='prim-but mt-4'>

                            Buy Package

                        </button>
                    </div>

                    <div className="col-lg-4">
                        {/* {selectedPackage.map((pack: any) => ( */}
                        <div className='order-sum'>
                            <h4 className='mb-3'>
                                Order Summary
                            </h4>

                            <div className='d-flex align-items-center justify-content-between mb-3'>
                                <h5>{selectedPackage?.name}</h5>
                                {/* <h5>{selectedPackage?.prices[0]?.price}</h5> */}
                                {selectedPackage?.prices.map((price: any) => (
                                       <h5>
                                        {price.currency === "INR" ? <MdCurrencyRupee className='mb-1'/> : <BsCurrencyDollar className='mb-1'/>}
                                        {price.currency === "INR" ? price.inr_price : price.usd_price}
                                       </h5>
                                             ))}
                            </div>

                            <ul className='p-0 mt-3'>

                                {selectedPackage?.details.map((det: any, id: number) => (
                                    <li key={id}><TiTick /> {det}</li>
                                ))}


                            </ul>

                            <div className='d-flex align-items-center py-2 align-items-center justify-content-between'>
                                <h4>Total</h4>
                                {/* <h4>{selectedPackage?.prices[0]?.inr_price}</h4> */}
                                {selectedPackage?.prices.map((price: any) => (
                                       <h4>
                                        {price.currency === "INR" ? <MdCurrencyRupee className='mb-1'/> : <BsCurrencyDollar className='mb-1'/>}
                                        {price.currency === "INR" ? price.inr_price : price.usd_price}
                                       </h4>
                                             ))}
                            </div>
                        </div>
                        {/* ))} */}
                    </div>
                </div>
            </div>
        </section>

        <CustomModal show={isThankOpen} onHide={() => setThankOpen(false)} custom='thank' title="">
<Success Hide={() => setThankOpen(false)}/>
</CustomModal>
    </>);
}

export default Checkout;

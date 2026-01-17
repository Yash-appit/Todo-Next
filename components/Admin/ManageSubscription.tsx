"use client"

import React, { useState, useEffect } from 'react';
import crown from "@/assets/Images/Admin/Subscription/crown.svg";
import ToastMessage from '@/Layout/ToastMessage';
import { PaymentDetails } from '@/services/Admin';
import empty from "@/assets/Images/Admin/Subscription/empty.svg";
import CustomModal from '@/components/Modal/Modal';
// import Success from '../Success';
import PackagePop from '@/components/PackagePop';
import Loader from '@/Layout/Loader';
import ScrollReveal from '@/components/Animation/ScrollReveal2';
// import { ResumeProvider, useResume } from '../../context/ResumeContext';
import SafeAds from '@/common/SafeAds';
import Image from 'next/image';
import Link from 'next/link';
import { TimeZoneProvider } from '@/context/TimeZoneContext';

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

  
const ManageSubscription = () => {
    const [Paydet, setPaydet] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const token = getFromLocalStorage("token");
    const [isThankOpen, setThankOpen] = useState(false);
    const [purchase, setPurchase] = useState(false);
    const packageData = getFromLocalStorage("package");
    // const { dashboard } = useResume() as any;
    const shouldShowAds = packageData !== "true";
    useEffect(() => {
        if (token) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const fetchData = async () => {
        try {
            const response = await PaymentDetails();
            setPaydet(response?.data);
            // console.log(response);

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

    if (isLoading) {
        return <Loader />; // Show loader while data is being fetched
    }

    return (<>
 
        <div className='container manage-subs p-4 px-5'>

            {shouldShowAds &&
            // <ResumeProvider>
        <SafeAds />
            // </ResumeProvider>
            }
            {/* <p>{Paydet.package_status}</p> */}
            {Paydet && Paydet?.package_status === "active" ? (
                <>
                    <ScrollReveal>
                        <section className='bg-white rounded-3 mt-4 p-3 table-responsive'>
                       
                            <h5>Manage <span className='sec-col'>Subscription</span></h5>
                            <div className="row">
                                <div className="col-lg-6">
                                    <table className='mt-4 w-100'>
                                        <tbody>
                                            {Paydet?.name &&
                                                <tr>
                                                    <td>Plan Name</td>
                                                    <td>:</td>
                                                    <td>{Paydet.name}</td>
                                                </tr>
                                            }
                                            {Paydet?.type &&
                                                <tr>
                                                    <td>Plan Type</td>
                                                    <td>:</td>
                                                    <td>{Paydet.type}</td>
                                                </tr>
                                            }
                                            {Paydet?.package_status &&
                                                <tr>
                                                    <td>Status</td>
                                                    <td>:</td>
                                                    <td className='text-capitalize'>{Paydet.package_status}</td>
                                                </tr>
                                            }
                                            {Paydet?.start_date &&
                                                <tr>
                                                    <td>Subscription since</td>
                                                    <td>:</td>
                                                    <td>{new Date(Paydet?.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                </tr>
                                            }
                                            {Paydet?.end_date &&
                                                <tr>
                                                    <td>Expires</td>
                                                    <td>:</td>
                                                    <td>{new Date(Paydet?.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                </tr>
                                            }
                                            {Paydet?.amount &&
                                                <tr>
                                                    <td>Price</td>
                                                    <td>:</td>
                                                    <td>{Paydet?.currency === "INR" ? "₹" : "$"}{Paydet?.amount}</td>
                                                </tr>
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-lg-6">
                                    <table className='mt-4 w-100 table-responsive'>
                                        <tbody>
                                            {Paydet?.created_at &&
                                                <tr>
                                                    <td>Purchased In</td>
                                                    <td>:</td>
                                                    <td>{new Date(Paydet.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                </tr>
                                            }
                                            {Paydet?.created_at &&
                                                <tr>
                                                    <td>Order Date</td>
                                                    <td>:</td>
                                                    <td>{new Date(Paydet.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                </tr>
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                         
                        </section>
                        </ScrollReveal>

                        

                        {Paydet?.paymentDetails?.length > 0 &&
                        <ScrollReveal delay={200}>
                            <section className='bg-white rounded-3 mt-4 pay-his table-responsive'>
                                
                                <h5 className='p-3'>Payment <span className='sec-col'>History</span></h5>
                                <table className='w-100 mt-4'>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Payment method</th>
                                            <th>Invoice</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Paydet.paymentDetails.map((pay: any, index: any) => (
                                            <tr key={index}>
                                                {pay.created_at &&
                                                    <td>{new Date(pay.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                }
                                                {pay?.transaction_id &&
                                                    <td>{pay?.transaction_id}</td>
                                                }
                                                {pay?.gateway_name &&
                                                    <td>{pay?.gateway_name}</td>
                                                }
                                                <td>{pay?.invoice_number || "N/A"}</td>
                                                {pay?.amount &&
                                                    <td>{pay?.currency === "INR" ? "₹" : "$"}{pay?.amount}</td>
                                                }
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             
                            </section>
                            </ScrollReveal>
                        }
                        
                   
                </>
            ) : (<>

                <ScrollReveal>
                    <section className='bg-white rounded-3 mt-4 p-3 table-responsive free'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <div className='d-flex'>
                                <Image src={crown} alt="" className='crown pe-3' />
                                <div>
                                    <h6 className='mb-1'>Free Account</h6>
                                    <p className='mb-0'>You are on the free plan. You can save your data and search for jobs. Upgrade<br /> For PDF downloads & premium features.</p>
                                </div>
                            </div>
                            <Link href="" onClick={() => setPurchase(true)} className='sec-col'>Upgrade</Link>
                        </div>
                    </section>
                </ScrollReveal>


                <ScrollReveal>
                <section className='bg-white rounded-3 mt-4 p-3 table-responsive'>
                    <h5>Manage <span className='sec-col'>Subscription</span></h5>
                    <div className="row text-center justify-content-center mt-4">
                        <Image src={empty} alt="No Subscription" className='no-subscription-image' />
                        <div>
                        <button onClick={() => setPurchase(true)} className='prim-but w-auto mt-3 px-5'>Upgrade</button>
                        </div>
                    </div>
                </section>
                </ScrollReveal>
            </>)}
        </div>

        <CustomModal show={purchase} onHide={() => setPurchase(false)} custom='packageModal' title="" size='lg'>
            <TimeZoneProvider>
            <PackagePop fetchPay={fetchData} close={() => setPurchase(false)} />
            </TimeZoneProvider>
        </CustomModal>
    </>)
}

export default ManageSubscription

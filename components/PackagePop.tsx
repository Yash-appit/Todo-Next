import React, { useState, useEffect, useCallback } from 'react';
import { packageList, packageBuy } from '@/services/package/Index';
import ToastMessage from '@/Layout/ToastMessage';
import Loader from '@/Layout/Loader';
import tick from "@/assets/Images/tick3.png";
import person from "@/assets/Images/Person.webp";
import { RAZORPAY_KEY } from "@/config/index";
import CustomModal from '@/components/Modal/Modal';
import Success from './Success';
import { useTimeZone } from '@/context/TimeZoneContext';
// import { useLocation } from 'react-router-dom';
import "@/styles/Package.css";
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { RefreshProvider } from '@/context/RefreshContext';

interface Price {
    membership_plan_id: number;
    name: string;
    currency: string;
    inr_price: number;
    duration: number;
    usd_price: number;
}

interface Membership {
    id: number;
    name: string;
    slug: string;
    details: string[];
    type: string;
    prices: Price[];
    isPurchased: boolean;
}

interface PackagePopProps {
    fetchPay?: () => void;
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

const PackagePop = ({ fetchPay, close }: PackagePopProps) => {
    const [packages, setPackages] = useState<Membership[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('');
    const [isThankOpen, setThankOpen] = useState(false);
    const Key = RAZORPAY_KEY;
    const name = getFromLocalStorage('name');
    const email = getFromLocalStorage('email');
    const [currency, setCurrency] = useState<string | null>(null);
    const { timeZone, setTimeZone } = useTimeZone();
    const pathname = usePathname();

    const openThankModal = () => setThankOpen(true);

    // Function to add Razorpay script
    const addRazorpayScript = () => {
        // Check if script already exists
        if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        // console.log('Razorpay script added');
    };

    // Function to remove Razorpay script
    const removeRazorpayScript = () => {
        const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (script) {
            document.body.removeChild(script);
            // console.log('Razorpay script removed');
        }
    };

    const fetchData = async () => {
        try {
            const response = await packageList();
            const membershipList = response?.data?.membershipList || [];
            setPackages(membershipList);

            if (membershipList.length > 0) {
                setActiveTab(membershipList[0].type);
            }

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            ToastMessage({
                type: "error",
                message: error,
            });
        }
    };

    useEffect(() => {
        // Add Razorpay script when component mounts
        addRazorpayScript();
        
        // Fetch data
        fetchData();

        // Cleanup function to remove script when component unmounts
        return () => {
            removeRazorpayScript();
        };
    }, []);

    const validateAndBuyPackage = useCallback(async (selectedPackage: any) => {
        try {
            // Check if Razorpay is available
            if (!(window as any).Razorpay) {
                ToastMessage({
                    type: "error",
                    message: "Payment system is loading. Please try again in a moment.",
                });
                return;
            }

            setIsLoading(true);
            const paymentAmount = timeZone === "Asia/Calcutta"
                ? selectedPackage?.prices[0]?.inr_price
                : selectedPackage?.prices[0]?.usd_price;

            const response = await packageBuy({
                amount: paymentAmount,
                currency: timeZone === 'Asia/Calcutta' ? 'INR' : 'USD',
                package_id: selectedPackage?.prices[0]?.membership_plan_id,
                type: selectedPackage?.type,
                gst_in_percentage: timeZone === 'Asia/Calcutta' ? '18%' : null,
            });

            const options = {
                key: Key,
                amount: paymentAmount * 100,
                currency: timeZone === 'Asia/Calcutta' ? 'INR' : 'USD',
                name: 'TodoResume',
                description: 'Purchase Package',
                order_id: response?.data?.data?.gatewayOrderId,
                handler: function (response: any) {
                    if (response.razorpay_payment_id) {
                       
                        if (location.pathname === '/manage-subscription') {
                            fetchPay?.();
                            close();
                        } else {
                            openThankModal();
                        }
                     
                    }
                },
                prefill: {
                    name: name,
                    email: email,
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
            setIsLoading(false);
            

        } catch (error: any) {
            setIsLoading(false);
            ToastMessage({
                type: "error",
                message: error.message || error || 'Payment failed',
            });
        }
    }, [Key, name, email, timeZone, location.pathname, fetchPay, close]);

    // Get unique types for tabs
    const packageTypes = Array.from(new Set(packages.map(pkg => pkg.type)));
    // Filter packages by active tab
    const filteredPackages = packages.filter(pkg => pkg.type === activeTab);

    if (isLoading) {
        return <Loader />;
    }

    if (packages.length === 0) {
        return <div className="text-center py-8 text-gray-500">No membership packages available</div>;
    }

    return (<>
        <div className="package-pop max-w-4xl mx-auto p-4 d-flex align-items-center justify-content-center">
            {/* Horizontal Tabs */}
            <div className="tabs d-grid bg-transparent justify-center mb-8 mx-4">
                {packageTypes.map(type => (
                    <button
                        key={type}
                        className={`tab tab-lg ${activeTab === type ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {filteredPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredPackages.map(pkg => (
                            <div key={pkg.id} className="card bg-base-100">
                                <div className="card-body p-0">
                                    <div className="d-flex align-items-end">
                                        <div className="p-5 mt-5">
                                            <div className="flex justify-between items-start">
                                                {pkg.prices.map((price, idx) => (
                                                    <div key={idx} className="mb-4 d-flex align-items-end pack-head">
                                                        <h1 className="card-title mb-0 mx-2">{timeZone === "Asia/Calcutta" ? "₹" : "$"}  {timeZone === "Asia/Calcutta" ? price.inr_price : price.usd_price}</h1>
                                                        <span>{pkg.type === "Monthly" ? "per month" : "per year"}</span>
                                                    </div>
                                                ))}
                                                <div className="my-5">
                                                    {pkg.details.map((detail, index) => (
                                                        <div key={index} className="flex items-start mb-2">
                                                            <p><Image src={tick} alt="" /> {detail}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-auto">
                                                <div className="card-actions justify-end">
                                                    <button
                                                        onClick={() => validateAndBuyPackage(pkg)}
                                                        className="prim-but-2"
                                                        disabled={pkg.isPurchased}
                                                    >
                                                        {pkg.isPurchased ? 'Active Plan' : 'Choose Plan'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5 pl-4 pb-0">
                                            <Image src={person} alt="" className='person' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">No packages found for this category</div>
                )}
            </div>
        </div>


        <CustomModal show={isThankOpen} onHide={() => setThankOpen(false)} custom='thank' title="">
        <RefreshProvider>
            <Success Hide={() => setThankOpen(false)} fetchPay={fetchPay} Close={close}/>
                </RefreshProvider>
        </CustomModal>
    </>);
};

export default PackagePop;
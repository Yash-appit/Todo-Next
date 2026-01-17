import React, {useState, useEffect} from 'react'
import Lottie from 'lottie-react';
import bg from "@/Animations/thank.json";
import "@/styles/Checkout.css";
// import { useNavigate, useLocation } from 'react-router-dom';
import { useRefresh } from '@/context/RefreshContext';
import { useRouter, usePathname } from 'next/navigation';

interface SuccessProps {
    Hide: () => void;
    Close?: () => void;
    fetchPay?: () => void;
  }

const Success: React.FC<SuccessProps> = ({ 
    Hide,
    Close,
    fetchPay
  }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [timer, setTimer] = useState(5);
    // const { setRefresh } = useRefresh();
    const { refresh } = useRefresh();

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);

        const redirectTimeout = setTimeout(() => {
            if (pathname === '/create-resume' || '/manage-subscription') {
                Hide();
                if (Close) {
                    Close();
                }
                // Check if fetchPay exists before calling it
                if (fetchPay) {
                    fetchPay();
                }
                refresh();
            } else {
               router.push('/');
            }
        }, 5000);

        return () => {
            clearInterval(countdown);
            clearTimeout(redirectTimeout);
        };
    }, [router]);

    return (
        <div className='success'>
            <Lottie
                className="lottie-bg"
                animationData={bg}
                loop={false}
                autoplay
            />

            <div className="container">
                <div className="row text-center justify-content-center">
                    <div className="col-lg-9 mx-auto text-center">
                        <h1 className="sec-col">Thank you for your purchase!</h1>
                        <p className="text-muted mt-4">Your order has been placed successfully!</p>
       
                    </div>
                    
                    <p className="mt-4 fs-5">{pathname === '/create-resume' || '/manage-subscription' ? "Closing in" : "Redirecting in"} {timer} seconds...</p> {/* Timer display */}

                    {/* <h6 className='mt-3'>Check your Mail!</h6>
                    <p>Your password has been send to your Email</p> */}
                </div>

            </div>
        </div>
    )
}

export default Success

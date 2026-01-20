"use client"

import React, { useState, useEffect } from 'react'; // Import useParams from react-router-dom
import ToastMessage from '@/Layout/ToastMessage';
import { fetchLegalPage } from '@/services/legal/index';
import Loader from '@/Layout/Loader';
import "@/styles/Other.css";
import { useRouter, useParams } from 'next/navigation';

const Legal = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const type = params?.type as string;

  // console.log(params);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page
    fetchData();
  }, [type]);

  // console.log(typeof(type));



  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchLegalPage(type!); // Pass the 'type' to the service call
      setData(response?.data);
      // console.log(response.data);

    } catch (error) {
      router.push('/404')
      // ToastMessage({
      //   type: "error",
      //   message: (error as Error).message,
      // });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className='container py-5 about-us'>
      {data?.data?.title &&
        <h3 className="pt-5 mt-5 head my-element" data-aos="fade-down" data-aos-delay="200">{data?.data?.title}</h3>
      }
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="row mt-5">
            <div className="col-lg-12 py-3">
              {/* Render the description from the API response */}
              <div
                className='det my-element'
                data-aos="fade-up"
                data-aos-delay="200"
                dangerouslySetInnerHTML={{ __html: data?.data?.description || '' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Legal;

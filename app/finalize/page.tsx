import dynamic from 'next/dynamic';
import React from 'react';

const Finalize = dynamic(() => import('./Finalize'), { ssr: false });

const Page = () => {
  return (
    <Finalize />
  )
}

export default Page

import React, { useState } from 'react'
import Package from './Package'
import PackageFaq from './PackageFaq'
import '@/styles/Package.css'
import '@/styles/Shimmer.css'
import ScrollReveal from '@/components/Animation/ScrollReveal2';

const Index: React.FC = () => {
  const [isForgetOpen, setForgetOpen] = useState(false);

  return (
    <>
    
      <Package close={() => setForgetOpen(false)} />
   
      {/* <ProfessionalResume /> */}
      <ScrollReveal delay={400}>
        <PackageFaq />
      </ScrollReveal>
    </>
  )
}

export default Index

import React, { useState } from 'react';
import ResumeGenerated from './ResumeGenerated';
import DownloadResumeModal from './DownloadResumeModal';
// import Dialog from '../../Dialog/Dialog';
import ResumeDownload from './ResumeDownload';
interface ResumeContainerProps {
  GeneratedResume: any;
  ResumeLoading?: boolean;
  isSmallScreen?: any;
}

const ResumeContainer = ({ GeneratedResume, ResumeLoading }: ResumeContainerProps) => {
  const [isDownloadOpen, setDownloadOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDialog, setShowDialog] = useState(false);


  const handleDownloadClick = () => {
    setDownloadOpen(true);
  };

  const handleDownloadStart = () => {
    setIsDownloading(true);
    setIsTransitioning(true);
  };

  const handleDownloadEnd = () => {
    setIsDownloading(false);
    setIsTransitioning(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <ResumeGenerated
        GeneratedResume={GeneratedResume}
        ResumeLoading={ResumeLoading}
        onDownloadClick={handleDownloadClick}
        isDownloading={isDownloading}
        isTransitioning={isTransitioning}
        setShowDialog={setShowDialog}
      />
      
      <DownloadResumeModal
        show={isDownloadOpen}
        onHide={() => setDownloadOpen(false)}
        onDownloadStart={handleDownloadStart}
        onDownloadEnd={handleDownloadEnd}
        GeneratedResume={GeneratedResume}
      />




    </>
  );
};

export default ResumeContainer;
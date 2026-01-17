import FileUploadWithPreview from '../FileUploadWithPreview';
// import { ResumeProvider } from '../../context/ResumeContext';
import SafeAtsAds from '@/common/SafeAtsAds';

const ATSchecker = () => {

    return (
        <>
        {/* <ResumeProvider> */}
            <FileUploadWithPreview />
            <SafeAtsAds />
            {/* </ResumeProvider> */}
        </>
    );
};

export default ATSchecker;

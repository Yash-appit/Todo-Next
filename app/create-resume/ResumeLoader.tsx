import '../CSS/ResumeLoader.css'; // Import CSS for styling
import { GoDotFill } from "react-icons/go";

interface LoaderProps {

    text: string;
  
    color?: string;  // Make color optional

    width?: string;  // Make width optional

    add?: string;  // Make class optional
  
  }
const ResumeLoader: React.FC<LoaderProps> = ({ text, color, width, add }) => {
    return (
        <div className={`loader-container ${width} ${color} ${add}`}>
            <div className="loader-dots text-center">
                <span className={`${color}`}><GoDotFill/></span>
                <span className={`${color}`}><GoDotFill/></span>
                <span className={`${color}`}><GoDotFill/></span>
                <div className={`loader-text ${color}`}>{text}</div>
            </div>
        </div>
    );
};

export default ResumeLoader;
import Spinner from 'react-bootstrap/Spinner';
import Lottie from 'lottie-react';
import loader from '../Animations/loader.json';

const Loader: React.FC = () => {
    return (
        <div className="loader">
            {/* <Spinner animation="grow"/> */}
            <Lottie
                className="lottie"
                animationData={loader}
                loop
                autoplay
            />
        </div>
    )
}

export default Loader

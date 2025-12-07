import { Link } from 'react-router-dom';
import { FaCity } from 'react-icons/fa';

const NotFound = () => {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="text-center hero-content">
                <div className="max-w-md">
                    <FaCity className="text-9xl text-gray-300 mx-auto mb-4" />
                    <h1 className="text-5xl font-bold text-primary">404</h1>
                    <p className="py-6 text-xl">Oups ! Vous semblez perdu dans la Smart City.</p>
                    <Link to="/" className="btn btn-primary">Retour au Dashboard</Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
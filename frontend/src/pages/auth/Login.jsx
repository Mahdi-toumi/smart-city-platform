import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/'); // Redirection vers le dashboard
        } catch (err) {
            setError("Identifiants incorrects. Vérifiez votre connexion.");
        }
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left ml-10">
                    <h1 className="text-5xl font-bold text-primary">Smart City</h1>
                    <p className="py-6 max-w-md">
                        Plateforme de gestion urbaine intelligente.
                        Connectez-vous pour accéder aux services de Mobilité, Citoyenneté, Énergie et Urgences.
                    </p>
                </div>
                <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <form onSubmit={handleSubmit} className="card-body">
                        <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>

                        {error && <div className="alert alert-error text-sm py-2 mb-2">{error}</div>}

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Identifiant</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: mahdi"
                                className="input input-bordered"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Mot de passe</span>
                            </label>
                            <input
                                type="password"
                                placeholder="******"
                                className="input input-bordered"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary">Se connecter</button>
                        </div>
                        <div className="divider">OU</div>
                        <div className="text-center">
                            <Link to="/register" className="link link-hover text-sm">
                                Pas encore de compte ? S'inscrire
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
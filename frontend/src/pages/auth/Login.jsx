import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. On nettoie tout ce qui traîne avant de commencer
        toast.dismiss();

        // 2. On lance le chargement et on garde son ID
        const toastId = toast.loading("Connexion en cours...");

        try {
            await login(username, password);

            // 3. SUCCÈS : On TUE le toast de chargement immédiatement
            toast.dismiss(toastId);

            // 4. On crée un NOUVEAU toast propre qui durera 5 secondes
            toast.success("Connexion réussie ! Redirection...", {
                duration: 5000,
            });

            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            console.error(err);

            // 5. ERREUR : On TUE le chargement
            toast.dismiss(toastId);

            // 6. On affiche l'erreur proprement
            toast.error("Identifiants incorrects.", {
                duration: 5000,
            });
        }
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left ml-10">
                    <h1 className="text-5xl font-bold text-primary">Smart City</h1>
                    <p className="py-6 max-w-md">
                        Plateforme de gestion urbaine intelligente.
                    </p>
                </div>
                <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <form onSubmit={handleSubmit} className="card-body">
                        <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>

                        <div className="form-control">
                            <label className="label"><span className="label-text">Identifiant</span></label>
                            <input
                                type="text" placeholder="Ex: admin" className="input input-bordered"
                                value={username} onChange={(e) => setUsername(e.target.value)} required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Mot de passe</span></label>
                            <input
                                type="password" placeholder="******" className="input input-bordered"
                                value={password} onChange={(e) => setPassword(e.target.value)} required
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary">Se connecter</button>
                        </div>

                        <div className="divider">OU</div>
                        <div className="text-center">
                            <Link to="/register" className="link link-hover text-sm">Pas encore de compte ? S'inscrire</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nomComplet: '',
        email: '',
        adresse: '',
        role: 'CITOYEN' // Par défaut
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/'); // Redirection vers le dashboard après succès
        } catch (err) {
            console.error(err);
            setError("Erreur lors de l'inscription. Vérifiez que le pseudo n'est pas déjà pris.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero min-h-screen bg-base-200 py-10">
            <div className="card w-full max-w-lg shadow-2xl bg-base-100">
                <form onSubmit={handleSubmit} className="card-body">
                    <h2 className="text-3xl font-bold text-center text-primary mb-4">Créer un compte</h2>

                    {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}

                    <div className="grid grid-cols-1 gap-4">
                        {/* Pseudo & Email */}
                        <div className="form-control">
                            <label className="label"><span className="label-text">Nom d'utilisateur *</span></label>
                            <input type="text" name="username" required className="input input-bordered" onChange={handleChange} />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text">Email</span></label>
                            <input type="email" name="email" className="input input-bordered" onChange={handleChange} />
                        </div>

                        {/* Mot de passe */}
                        <div className="form-control">
                            <label className="label"><span className="label-text">Mot de passe *</span></label>
                            <input type="password" name="password" required className="input input-bordered" onChange={handleChange} />
                        </div>

                        {/* Infos Perso */}
                        <div className="form-control">
                            <label className="label"><span className="label-text">Nom Complet</span></label>
                            <input type="text" name="nomComplet" className="input input-bordered" onChange={handleChange} />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text">Adresse</span></label>
                            <input type="text" name="adresse" className="input input-bordered" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-control mt-6">
                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : "S'inscrire"}
                        </button>
                    </div>

                    <div className="divider">OU</div>

                    <div className="text-center">
                        <Link to="/login" className="link link-hover text-sm">Déjà un compte ? Se connecter</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
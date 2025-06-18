import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Guitar as Hospital, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) toast.success('Login berhasil!');
      else toast.error('Email atau password salah');
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / 15).toFixed(2);
    const rotateY = ((x - centerX) / 15).toFixed(2);
    card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-100"
      onMouseMove={(e) => {
        const x = (e.clientX - window.innerWidth / 2) / 30;
        const y = (e.clientY - window.innerHeight / 2) / 30;
        const blob1 = document.getElementById('blob1');
        const blob2 = document.getElementById('blob2');
        if (blob1) blob1.style.transform = `translate(${x}px, ${y}px)`;
        if (blob2) blob2.style.transform = `translate(${-x}px, ${-y}px)`;
      }}
    >
      {/* Background Blobs */}
      <div
        id="blob1"
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transition-transform duration-200 ease-out pointer-events-none"
      />
      <div
        id="blob2"
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transition-transform duration-200 ease-out pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 z-10"
      >
        <div className="text-center">
          <img
            src="https://pendaftaran.rsusebeningkasih.com/assets/images/logo-laporan.png"
            alt="Logo Rumah Sakit"
            className="mx-auto mt-6 h-12 w-auto"
            draggable={false}
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Masuk ke Sistem</h2>
          <p className="mt-2 text-sm text-gray-600">Sistem Laporan Keuangan Rumah Sakit</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="bg-white p-8 rounded-xl shadow-xl transition-transform duration-200 ease-out space-y-6 backdrop-blur-sm bg-opacity-90 will-change-transform"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@hospital.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Daftar disini
                </Link>
              </p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 font-medium">Demo Login:</p>
              <p className="text-xs text-blue-700">Email: admin@hospital.com</p>
              <p className="text-xs text-blue-700">Password: password</p>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;

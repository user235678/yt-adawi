import { useState } from "react";
import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthFormProps {
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
}

interface FormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === 'signup') {
      if (!formData.firstName?.trim()) {
        newErrors.firstName = 'Le prénom est requis';
      }
      if (!formData.lastName?.trim()) {
        newErrors.lastName = 'Le nom est requis';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`${mode} attempt:`, formData);
    setIsLoading(false);
  };

  const inputVariants = {
    focused: {
      scale: 1.02,
      borderColor: '#DAA520',
      boxShadow: '0 0 0 3px rgba(218, 165, 32, 0.1)',
      transition: { duration: 0.2 }
    },
    unfocused: {
      scale: 1,
      borderColor: '#D1D5DB',
      boxShadow: '0 0 0 0px rgba(218, 165, 32, 0)',
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-md mx-auto"
    >
      {/* Mode Toggle */}
      <motion.div 
        variants={itemVariants}
        className="flex bg-gray-100 rounded-full p-1 mb-8"
      >
        <button
          onClick={() => onModeChange('login')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
            mode === 'login'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => onModeChange('signup')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
            mode === 'signup'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Inscription
        </button>
      </motion.div>

      {/* Title */}
      <motion.h1 
        variants={itemVariants}
        className="text-3xl font-bold text-black text-center mb-4 tracking-wider"
      >
        {mode === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
      </motion.h1>

      {/* Description */}
      <motion.p 
        variants={itemVariants}
        className="text-gray-600 text-center mb-8 text-sm"
      >
        {mode === 'login' 
          ? 'Veuillez entrer vos identifiants de connexion'
          : 'Créez votre compte pour commencer'
        }
      </motion.p>

      {/* Form */}
      <motion.form 
        variants={itemVariants}
        onSubmit={handleSubmit} 
        className="space-y-6"
      >
        <AnimatePresence mode="wait">
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* First Name */}
              <div>
                <motion.input
                  variants={inputVariants}
                  animate={focusedField === 'firstName' ? 'focused' : 'unfocused'}
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Prénom"
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none bg-white text-black placeholder-gray-500 transition-colors ${
                    errors.firstName ? 'border-red-400' : 'border-gray-300'
                  }`}
                  required
                />
                <AnimatePresence>
                  {errors.firstName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1 ml-4"
                    >
                      {errors.firstName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Last Name */}
              <div>
                <motion.input
                  variants={inputVariants}
                  animate={focusedField === 'lastName' ? 'focused' : 'unfocused'}
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nom"
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none bg-white text-black placeholder-gray-500 transition-colors ${
                    errors.lastName ? 'border-red-400' : 'border-gray-300'
                  }`}
                  required
                />
                <AnimatePresence>
                  {errors.lastName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1 ml-4"
                    >
                      {errors.lastName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div>
          <motion.input
            variants={inputVariants}
            animate={focusedField === 'email' ? 'focused' : 'unfocused'}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="E-mail"
            className={`w-full px-4 py-3 border rounded-full focus:outline-none bg-white text-black placeholder-gray-500 transition-colors ${
              errors.email ? 'border-red-400' : 'border-gray-300'
            }`}
            required
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-500 text-xs mt-1 ml-4"
              >
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password */}
        <div className="relative">
          <motion.input
            variants={inputVariants}
            animate={focusedField === 'password' ? 'focused' : 'unfocused'}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder="Mot de passe"
            className={`w-full px-4 py-3 border rounded-full focus:outline-none bg-white text-black placeholder-gray-500 transition-colors ${
              errors.password ? 'border-red-400' : 'border-gray-300'
            }`}
            required
          />
          {mode === 'login' && (
            <Link
              to="/forgot-password"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-adawi-gold transition-colors"
            >
              Oublié?
            </Link>
          )}
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-500 text-xs mt-1 ml-4"
              >
                {errors.password}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password */}
        <AnimatePresence>
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.input
                variants={inputVariants}
                animate={focusedField === 'confirmPassword' ? 'focused' : 'unfocused'}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword || ''}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirmer le mot de passe"
                className={`w-full px-4 py-3 border rounded-full focus:outline-none bg-white text-black placeholder-gray-500 transition-colors ${
                  errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                }`}
                required
              />
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-xs mt-1 ml-4"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white font-medium py-3 px-4 rounded-full hover:bg-gray-800 transition-colors duration-300 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              </motion.div>
            ) : (
              <motion.span
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {mode === 'login' ? 'SE CONNECTER' : 'S\'INSCRIRE'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.form>

      {/* Alternative Action */}
      <motion.p 
        variants={itemVariants}
        className="text-center mt-6 text-sm text-gray-600"
      >
        {mode === 'login' ? 'Nouveau membre? ' : 'Déjà membre? '}
        <button
          onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
          className="text-gray-800 hover:text-adawi-gold transition-colors underline font-medium"
        >
          {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
        </button>
      </motion.p>
    </motion.div>
  );
}

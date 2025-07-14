"use client";

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapPicker = dynamic(() => import('../register/MapPicker'), { ssr: false });

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [userRole, setUserRole] = useState<'EMPLOYEE' | 'VENDOR'>('EMPLOYEE');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const loggedInRole = await login(email, password);
    setLoginLoading(false);
    if (loggedInRole === 'VENDOR') router.push('/vendor/dashboard');
    else if (loggedInRole === 'EMPLOYEE') router.push('/employee/dashboard');
    else if (loggedInRole === 'ADMIN') router.push('/admin/dashboard');
    else if (loggedInRole) router.push('/');
    else setLoginError('Invalid credentials');
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError('');
    try {
      if (lat === null || lng === null) {
        setSignupError('Please select your location on the map.');
        setSignupLoading(false);
        return;
      }
      const success = await register(signupEmail, signupPassword, userRole, name, lat, lng);
      setSignupLoading(false);
      if (success) {
        if (userRole === 'VENDOR') router.push('/vendor/dashboard');
        else if (userRole === 'EMPLOYEE') router.push('/employee/dashboard');
        else router.push('/');
      } else {
        setSignupError('Registration failed. Email may already be in use.');
      }
    } catch (err: any) {
      setSignupLoading(false);
      setSignupError('Registration failed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-green-50 to-white flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full opacity-30 blur-2xl -z-10" style={{top: '-4rem', left: '-4rem'}} />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-100 rounded-full opacity-30 blur-2xl -z-10" style={{bottom: '-4rem', right: '-4rem'}} />
      <div className="w-full max-w-md bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-0 overflow-hidden animate-fade-in-up border border-blue-100">
        {/* Toggle */}
        <div className="flex justify-center items-center bg-gradient-to-r from-blue-600 to-green-500 p-6">
          <button
            className={`px-6 py-2 rounded-full font-bold text-lg transition-all ${mode === 'login' ? 'bg-white text-blue-700 shadow' : 'text-white bg-transparent'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`px-6 py-2 rounded-full font-bold text-lg transition-all ml-4 ${mode === 'signup' ? 'bg-white text-green-700 shadow' : 'text-white bg-transparent'}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>
        {/* Form */}
        <div className="p-8">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Login</h2>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {loginError && <div className="text-red-500 text-sm text-center">{loginError}</div>}
              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition"
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">Sign Up</h2>
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                required
              />
              <select
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={userRole}
                onChange={e => setUserRole(e.target.value as 'EMPLOYEE' | 'VENDOR')}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="VENDOR">Vendor</option>
              </select>
              <div>
                <h3 className="mb-2 font-semibold text-gray-700">Select your location on the map</h3>
                <MapPicker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
                {lat !== null && lng !== null && (
                  <div className="mt-2 text-sm text-gray-700">Selected: {lat.toFixed(5)}, {lng.toFixed(5)}</div>
                )}
              </div>
              {signupError && <div className="text-red-500 text-sm text-center">{signupError}</div>}
              <button
                type="submit"
                className="w-full bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-800 transition"
                disabled={signupLoading}
              >
                {signupLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 
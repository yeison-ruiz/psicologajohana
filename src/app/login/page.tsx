"use client";

import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { login, signup } from "./actions";

function LoginFormParams() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(
    () => searchParams.get("mode") !== "signup",
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const action = isLogin ? login : signup;

    const result = await action(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setError(null);
      setSuccessMessage(result.message);
      setIsLogin(true); // Switch to login view
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-100/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-1/4 -mt-20 w-72 h-72 rounded-full bg-orange-100/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-blue-100/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center items-center group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-20 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-slate-900">
          {isLogin ? "Tu espacio de bienestar" : "Crea tu cuenta"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          {isLogin
            ? "Continúa tu camino hacia el bienestar mental"
            : "Da el primer paso hoy mismo"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100"
        >
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-600 text-sm font-bold border border-green-100 italic">
              ✨ {successMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Registro: Full Name */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-slate-700"
                >
                  Nombre completo
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required={!isLogin}
                    className="block w-full pl-10 h-12 bg-slate-50 border-0 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 rounded-xl font-medium transition-all"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-700"
              >
                Correo electrónico
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 h-12 bg-slate-50 border-0 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 rounded-xl font-medium transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-700"
              >
                Contraseña
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 h-12 bg-slate-50 border-0 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 rounded-xl font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    Recuérdame
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-bold text-primary-600 hover:text-primary-500"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label
                    htmlFor="terms"
                    className="font-medium text-slate-600 cursor-pointer"
                  >
                    Acepto los{" "}
                    <a
                      href="#"
                      className="font-bold text-primary-600 hover:text-primary-500"
                    >
                      términos de servicio
                    </a>{" "}
                    y la{" "}
                    <a
                      href="#"
                      className="font-bold text-primary-600 hover:text-primary-500"
                    >
                      política de privacidad
                    </a>
                    .
                  </label>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-3 py-1.5 text-sm font-bold leading-6 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading
                  ? "Procesando..."
                  : isLogin
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500 font-medium">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full h-12 items-center justify-center gap-3 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                <span className="text-sm font-semibold leading-6">
                  Continuar con Google
                </span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm font-medium text-slate-600 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            {isLogin ? (
              <p>
                ¿Aún no tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-primary-600 hover:text-primary-500 hover:underline transition-all"
                >
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p>
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-primary-600 hover:text-primary-500 hover:underline transition-all"
                >
                  Inicia sesión
                </button>
              </p>
            )}
          </div>
        </motion.div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <LoginFormParams />
    </Suspense>
  );
}

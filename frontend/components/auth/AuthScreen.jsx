"use client";

import { BrandGlyph } from "@/components/dashboard-ui";

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function AuthField({ label, name, type, value, onChange, placeholder, autoComplete, required = true }) {
  return (
    <div className="flex flex-col gap-2 text-left mb-6">
      <label htmlFor={name} className="block text-sm font-bold text-black ml-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="block w-full rounded-md px-4 py-3 text-base border-2 border-gray-200 bg-white text-black focus:border-black focus:outline-none focus:ring-0 placeholder:text-gray-400 transition-colors"
      />
    </div>
  );
}

export function AuthScreen({
  formData,
  error,
  loading,
  onChange,
  onSubmit,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[420px]">
        
        {/* Branding Logo & Header */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black text-white mb-6">
            <BrandGlyph className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-3 text-base text-gray-500 font-medium">
            Sign in to your account to pick up your projects.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-white p-8 sm:p-10 shadow-sm border border-gray-200">
          
          {/* Alert */}
          {error && (
            <div className="mb-8 flex flex-row items-start gap-3 rounded-md border border-black bg-black p-4 text-sm text-white font-medium">
              <AlertIcon />
              <div className="flex-1 text-left">{error}</div>        
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col">       
            <AuthField
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              autoComplete="username"
              placeholder="name@example.com"
            />

            <AuthField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={onChange}
              autoComplete="current-password"
              placeholder="••••••••"
            />

            <div className="mt-2 text-right mb-6">
                <span className="text-sm font-bold text-gray-400 hover:text-black cursor-pointer transition-colors">Forgot password?</span>
            </div>

            <div className="mt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-black hover:bg-gray-800 px-4 py-3.5 text-base font-bold text-white transition-colors active:scale-[0.98]"
              >
                {loading && <LoaderIcon />}
                <span>{loading ? "Please wait..." : "Sign in to Workspace"}</span>
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">TechBrain Internal Workspace</p>
        </div>
      </div>
    </div>
  );
}
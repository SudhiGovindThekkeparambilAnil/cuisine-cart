// src/app/_app.tsx
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import '../styles/globals.css';
import React from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? <Loader /> : <Component {...pageProps} />}
    </>
  );
}

export default MyApp;
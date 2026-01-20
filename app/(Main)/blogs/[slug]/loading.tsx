"use client";
import Loader from '@/Layout/Loader';
import { useEffect } from 'react';

export default function Loading() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    return (
    <Loader />
    );
}

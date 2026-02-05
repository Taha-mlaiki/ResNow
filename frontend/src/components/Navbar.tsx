'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface NavbarProps {
    token?: string;
}

export function Navbar({ token }: NavbarProps) {
    const pathname = usePathname();
    const isLoggedIn = !!token;
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down & passed threshold -> Hide
                setIsVisible(false);
            } else {
                // Scrolling up -> Show
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    let role = '';
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            role = payload.role;
        } catch (e) {
            console.error('Failed to decode token', e);
        }
    }

    const dashboardLink = role === 'Admin' ? '/admin' : '/dashboard';
    const dashboardText = role === 'Admin' ? 'Admin Dashboard' : 'My Reservations';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 bg-background/80 backdrop-blur-md border-b ${isVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Calendar className="h-6 w-6" />
                    <span>ReservNow</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/events"
                        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/events' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                    >
                        Events
                    </Link>

                    {isLoggedIn && (
                        <Link
                            href={dashboardLink}
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === dashboardLink ? 'text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            {dashboardText}
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => logout()}
                        >
                            Log Out
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Log In</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

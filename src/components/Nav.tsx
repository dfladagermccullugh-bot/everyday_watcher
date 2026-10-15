'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'motion/react';
import clsx from 'clsx';

import { NAV } from '@/lib/nav';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href.replace(/\/$/, ''));
}

export function Nav() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] transition-[background-color,border-color] duration-300',
        scrolled ? 'border-b border-line bg-ink/80 backdrop-blur-xl backdrop-saturate-150' : 'border-b border-transparent',
      )}
    >
      <nav aria-label="Primary" className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="The Invisible Infrastructure, home">
          <Mark />
          <span className="font-serif text-[1.15rem] leading-none tracking-tight text-paper">
            The Invisible <span className="italic text-paper-2 group-hover:text-paper">Infrastructure</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'relative z-10 block rounded-full px-3 py-1.5 text-[0.8125rem] transition-colors',
                    active ? 'text-ink' : 'text-paper-2 hover:text-paper',
                  )}
                >
                  {item.label}
                </Link>
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-paper"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-sm text-paper lg:hidden" aria-label="Open menu">
            <span className="text-[0.8125rem] max-[440px]:hidden">{NAV.find((n) => isActive(pathname, n.href))?.label ?? 'Menu'}</span>
            <span className="text-[0.8125rem] min-[441px]:hidden">Menu</span>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 4h12M1 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-md data-[state=open]:animate-[rise_.3s_ease-out]" />
            <Dialog.Content className="fixed inset-x-0 top-0 z-[61] rounded-b-3xl border-b border-line-2 bg-ink-2 px-6 pb-8 pt-5 data-[state=open]:animate-[rise_.35s_var(--ease-out-quint)]">
              <div className="flex items-center justify-between">
                <Dialog.Title className="eyebrow">Navigate</Dialog.Title>
                <Dialog.Close className="grid h-10 w-10 place-items-center rounded-full border border-line-2 text-paper" aria-label="Close menu">
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">Site sections</Dialog.Description>
              <ul className="mt-6 space-y-1">
                {NAV.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                      className={clsx(
                        'flex items-baseline justify-between rounded-xl px-2 py-2.5 font-serif text-[2rem] leading-tight',
                        isActive(pathname, item.href) ? 'text-paper' : 'text-paper-2',
                      )}
                    >
                      {item.label}
                      <span className="font-mono text-xs text-paper-3">0{i + 1}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </header>
  );
}

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
      <circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" strokeOpacity=".28" />
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeOpacity=".5" />
      <circle cx="11" cy="11" r="2.2" fill="#E8A951" />
    </svg>
  );
}

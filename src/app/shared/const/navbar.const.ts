type NavItem = { path: string; label: string; exact?: boolean };

export const nav = (t: { [key: string]: string }) =>
  [
    { path: '/', label: t['header.navbar.home'], exact: true },
    { path: '/simulator', label: t['header.navbar.simulator'] },
    { path: '/calculate', label: t['header.navbar.calculate'] },
  ] satisfies NavItem[];

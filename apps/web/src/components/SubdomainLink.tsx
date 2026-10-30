import React from "react";
import { Link } from "react-router-dom";
import { getSubdomainLink } from "@/lib/hostname";

interface SubdomainLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  target: "admin" | "manager";
  to: string;
  children: React.ReactNode;
}

/**
 * Renders a link that automatically determines whether to perform standard SPA
 * client-side navigation (when on the matching subdomain) or open/navigate to
 * the target subdomain URL (when crossing subdomains).
 */
export function SubdomainLink({ target, to, children, className, ...rest }: SubdomainLinkProps) {
  const url = getSubdomainLink(target, to);
  const isExternal = url.startsWith("http://") || url.startsWith("https://");

  if (isExternal) {
    return (
      <a href={url} className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={url} className={className} {...(rest as any)}>
      {children}
    </Link>
  );
}


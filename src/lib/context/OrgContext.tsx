"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface Org {
  _id: string;
  name: string;
  slug: string;
  industry?: string;
  walletAddress?: string;
  settings: {
    currency: string;
    paySchedule: "weekly" | "biweekly" | "monthly";
  };
}

interface OrgContextType {
  activeOrg: Org | null;
  orgs: Org[];
  switchOrg: (orgId: string) => void;
  createOrg: (name: string, industry?: string) => Promise<boolean>;
  /** Re-pull orgs from the server, e.g. after writing walletAddress. */
  refreshOrgs: () => Promise<void>;
  loading: boolean;
  transitioning: boolean;
}

const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [orgs, setOrgs] = useState<Org[]>([]);
  
  // Synchronous read to eliminate UI flash on hard reload
  if (typeof window !== 'undefined') {
    localStorage.getItem("ps_active_org");
  }
  const [activeOrg, setActiveOrg] = useState<Org | null>(null);

  // Mirrors activeOrg so fetchOrgs can read the current selection without
  // taking it as a dependency and re-creating itself on every switch.
  const activeOrgIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeOrgIdRef.current = activeOrg?._id ?? null;
  }, [activeOrg]);

  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const fetchOrgs = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/orgs");
      if (res.ok) {
        const fetchedOrgs = await res.json();
        setOrgs(fetchedOrgs);

        if (fetchedOrgs.length > 0) {
          // Keep whichever org is already active across a refresh; only fall
          // back to the cached id on first load.
          const targetId = activeOrgIdRef.current ?? localStorage.getItem("ps_active_org");
          const match = fetchedOrgs.find((o: Org) => o._id === targetId);
          if (match) {
            setActiveOrg(match);
          } else {
            setActiveOrg(fetchedOrgs[0]);
            localStorage.setItem("ps_active_org", fetchedOrgs[0]._id);
          }
        } else {
          setActiveOrg(null);
        }
      }
    } catch (err) {
      console.error("Failed to load orgs", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading" || !session?.user) {
      if (status === "unauthenticated") setLoading(false);
      return;
    }
    fetchOrgs();
  }, [session, status, fetchOrgs]);

  // Refresh in place — no loading flash, keeps the current org selected
  const refreshOrgs = useCallback(async () => {
    await fetchOrgs({ showLoading: false });
  }, [fetchOrgs]);

  const switchOrg = (orgId: string) => {
    const target = orgs.find((o) => o._id === orgId);
    if (target && target._id !== activeOrg?._id) {
      setTransitioning(true);
      setTimeout(() => {
        setActiveOrg(target);
        localStorage.setItem("ps_active_org", target._id);
        setTimeout(() => setTransitioning(false), 200);
      }, 150);
    }
  };

  const createOrg = async (name: string, industry?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry }),
      });
      if (res.ok) {
        const data = await res.json();
        const newOrg = data.org;
        setOrgs((prev) => [...prev, newOrg]);
        switchOrg(newOrg._id);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <OrgContext.Provider value={{ activeOrg, orgs, switchOrg, createOrg, refreshOrgs, loading, transitioning }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}

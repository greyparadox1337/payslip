"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayslipPDF } from "./PayslipPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import TransactionSuccessCard from "./shared/TransactionSuccessCard";
import { getWalletBalance, getConnectedAddress, estimateTransferFee } from "@/lib/chain";

interface Employee {
  name: string;
  salary: string;
  walletAddress: string;
}

interface PayrollTrackerProps {
  employees: Employee[];
  executor: () => Promise<string>; // Function that handles building/signing/broadcasting and returns txHash
  onComplete: () => void;
}

const STAGES = ["Building tx", "Signing", "Broadcasting", "Confirmed"];

export function PayrollTracker({
  employees,
  executor,
  onComplete,
}: PayrollTrackerProps) {
  const [pipelineStage, setPipelineStage] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [networkConfirmed, setNetworkConfirmed] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  const [updatedBalance, setUpdatedBalance] = useState("0.00");
  const [walletAddr, setWalletAddr] = useState("");
  const [gasPerTransfer, setGasPerTransfer] = useState(0);

  useEffect(() => {
    estimateTransferFee().then(setGasPerTransfer);
  }, []);

  // Ensure timer ticks up while we are processing
  useEffect(() => {
    if (pipelineStage === 3 && confirmedCount === employees.length) return;
    const t = setInterval(() => {
      setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [pipelineStage, confirmedCount, employees.length, startTime]);

  // Execute the transaction loop
  useEffect(() => {
    let active = true;

    async function run() {
      // Step 0: Simulate building
      setPipelineStage(0);
      await new Promise((r) => setTimeout(r, 600));

      // Step 1: Wait for user to sign via MetaMask
      if (!active) return;
      setPipelineStage(1);

      try {
        const hash = await executor();
        if (!active) return;
        setTxHash(hash);
        
        // Step 2: Broadcasting state
        setPipelineStage(2);
      } catch (err: unknown) {
        console.error("Execution aborted:", err);
        if (!active) return;
        setErrorMsg(
          err instanceof Error ? err.message : "Transaction explicitly rejected by MetaMask or the RPC"
        );
      }
    }

    run();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling loop
  useEffect(() => {
    if (!txHash || networkConfirmed) return;

    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/check-tx?hash=${txHash}`);
        const data = await res.json();
        if (active && data.status === "success" && data.successful) {
          setNetworkConfirmed(true);
          setPipelineStage(3); // confirmed stage
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }

    const interval = setInterval(poll, 3000);
    poll(); // Initial check

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [txHash, networkConfirmed]);

  // Staggered list updates loop
  useEffect(() => {
    if (!networkConfirmed) return;

    if (confirmedCount < employees.length) {
      const stagger = setTimeout(() => {
        setConfirmedCount((c) => c + 1);
      }, 800);
      return () => clearTimeout(stagger);
    }
  }, [networkConfirmed, confirmedCount, employees.length]);

  // Fetch balance on completion
  useEffect(() => {
    if (networkConfirmed && confirmedCount === employees.length) {
      const fetchData = async () => {
        const addr = await getConnectedAddress();
        if (addr) {
          setWalletAddr(addr);
          const bal = await getWalletBalance(addr);
          setUpdatedBalance(bal || "0.00");
        }
      };
      fetchData();
    }
  }, [networkConfirmed, confirmedCount, employees.length]);

  const allCompleted = networkConfirmed && confirmedCount === employees.length;

  // Render variables
  const totalAmount = employees.reduce((sum, e) => sum + parseFloat(e.salary), 0);
  // One transaction per employee, so gas scales with headcount
  const networkFeeEst = gasPerTransfer * employees.length;

  if (allCompleted) {
    return (
      <TransactionSuccessCard 
        title="Payroll Complete!"
        subtitle={`Successfully paid ${employees.length} employees on the Robinhood Chain.`}
        txHash={txHash || ""}
        amount={totalAmount.toFixed(2)}
        walletAddress={walletAddr}
        walletBalance={updatedBalance}
        extraDetails={[
          { label: "Network Fee", value: `~${networkFeeEst.toFixed(6)} ETH` },
          { label: "Processing Time", value: `${timeTaken}s` },
          { label: "Status", value: "Verified on chain" }
        ]}
        onClose={onComplete}
      />
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/30 mb-6 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Execution Aborted
        </h2>
        <p className="text-muted-foreground text-[14px]">
          {errorMsg}
        </p>

        <Button className="w-full mt-8" onClick={onComplete}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const progressPercentage = (confirmedCount / employees.length) * 100;

  return (
    <div className="p-2">
      {/* ─── Pipeline Vis ─── */}
      <div className="flex items-center justify-between relative mb-8">
        <div className="absolute left-[10%] right-[10%] top-4 h-[2px] bg-border/40" />
        {STAGES.map((label, idx) => {
          const isActive = pipelineStage === idx;
          const isComplete = pipelineStage > idx || pipelineStage === 3;

          return (
            <div key={label} className="relative z-10 flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 mb-2 transition-all ${
                  isComplete
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                    : isActive
                    ? "bg-primary/20 border-primary text-primary animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : isActive && idx !== 1 ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-[11px] font-bold">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isActive || isComplete
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─── Progress Bar ─── */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[13px] font-medium text-slate-300">
            {confirmedCount} of {employees.length} payments confirmed
          </span>
          <span className="text-[12px] font-mono text-cyan-400">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* ─── Employee Status List ─── */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {employees.map((emp, index) => {
          let rowStatus = "Pending";
          if (pipelineStage < 2) rowStatus = "Waiting Details";
          else if (pipelineStage === 2) rowStatus = "Processing";
          else if (index < confirmedCount) rowStatus = "Confirmed";
          else rowStatus = "Processing";

          const isConfirmed = rowStatus === "Confirmed";
          const isProcessing = rowStatus === "Processing";

          return (
            <div
              key={emp.walletAddress}
              className={`p-3 rounded-lg border text-[13px] transition-all flex items-center justify-between ${
                isConfirmed
                  ? "bg-cyan-500/10 border-cyan-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]"
                  : isProcessing
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/30 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white font-medium text-[11px] ${
                    isConfirmed ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  {emp.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      isConfirmed ? "text-cyan-50" : "text-foreground"
                    }`}
                  >
                    {emp.name}
                  </p>
                  {isConfirmed && txHash ? (
                    <p className="text-[10px] font-mono text-cyan-400/80">
                      Tx: {txHash.slice(0, 6)}...{txHash.slice(-6)}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <p className="font-mono font-semibold text-foreground">
                    {emp.salary}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ETH
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isConfirmed ? (
                      <Check className="h-3 w-3 text-cyan-400" />
                    ) : isProcessing ? (
                      <Loader2 className="h-3 w-3 text-primary animate-spin" />
                    ) : (
                      <ShieldCheck className="h-3 w-3 text-slate-500" />
                    )}
                    <span
                      className={`text-[10.5px] font-medium uppercase tracking-wider ${
                        isConfirmed
                          ? "text-cyan-400"
                          : isProcessing
                          ? "text-primary"
                          : "text-slate-500"
                      }`}
                    >
                      {rowStatus}
                    </span>
                  </div>
                </div>
                {isConfirmed && txHash && (
                  <PDFDownloadLink
                    document={
                      <PayslipPDF
                        txHash={txHash}
                        employeeName={emp.name}
                        amount={parseFloat(emp.salary)}
                        date={new Date().toLocaleDateString()}
                      />
                    }
                    fileName={`Payslip_${emp.name.replace(/\s+/g, "_")}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/20"
                        title="Download Payslip"
                      >
                        {loading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

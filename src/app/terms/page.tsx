import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-indigo-500/30">
      <Navbar />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#6366f10a_1px,transparent_1px),linear-gradient(to_bottom,#6366f10a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <main className="relative z-10 pt-32 pb-24 px-6 gap-x-12">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
            Governance v1.0
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-lg mb-12 font-medium">Last Updated: April 4, 2024</p>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold text-indigo-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div> 
                Acceptance of Terms
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                By accessing or using the PaySlip platform, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you should not access or use the software.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-indigo-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div> 
                Description of Service
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                PaySlip provides a non-custodial interface for managing payroll on the Robinhood Chain. We facilitate the creation, signing, and broadcasting of transactions using the viem and the MetaMask browser extension. We do not provide financial, legal, or tax advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-indigo-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div> 
                Robinhood Chain Network Disclaimers
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                PaySlip operates on the Robinhood Chain. We are not responsible for network outages, ledger failures, or transaction delays. You acknowledge that blockchain transactions are irreversible and that PaySlip cannot "undo" or refund any payments successfully broadcast to the network.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-indigo-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div> 
                User Responsibilities
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                As an employer, you are solely responsible for ensuring you have sufficient ETH or USDC in your linked wallet to fund payroll. You are also responsible for complying with local tax and employment laws in the jurisdictions where your employees reside.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-red-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div> 
                Disclaimer of Warranty
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px] italic">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. PAYSLIP DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-violet-500/30">
      <Navbar />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#6366f10a_1px,transparent_1px),linear-gradient(to_bottom,#6366f10a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <main className="relative z-10 pt-32 pb-24 px-6 gap-x-12">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest mb-6">
            Legal Framework v1.0
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-lg mb-12 font-medium">Last Updated: April 4, 2024</p>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold text-violet-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div> 
                Data We Collect
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                PaySlip collects basic account information, including your full name, email address, and cryptographically hashed passwords. For employers, we also collect organisation details and Botchain public keys. We do not store private keys, seed phrases, or sensitive biometric data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-violet-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div> 
                How We Use Your Data
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                Your data is primarily used to provide, maintain, and optimize the PaySlip service. This includes processing payroll events on the Botchain, generating digitally signed PDF payslips, and notifying you of transaction statuses. We do not sell your personal information to third-party data brokers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-violet-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div> 
                Botchain Blockchain Data
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                Transactions initiated via PaySlip are recorded on the public Botchain. This includes public wallet addresses, transaction amounts, and timestamps. Please note that data on a public ledger is immutable and visible to anyone with access to the network or a block explorer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-violet-400 mb-4 tracking-tight flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div> 
                Your Rights
              </h2>
              <ul className="list-disc pl-5 text-slate-300 text-[15px] space-y-3 font-medium">
                <li>Right to access: You can request a copy of the personal data we hold about you.</li>
                <li>Right to rectification: You can update your profile information in the dashboard.</li>
                <li>Right to erasure: You can request account deletion (though blockchain data remains immutable).</li>
                <li>Right to data portability: Export your employee and payment history as CSV at any time.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

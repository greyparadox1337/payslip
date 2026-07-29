import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Bookmark, Share2, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

interface BlogPost {
  slug: string;
  title: string;
  category: "sky" | "amber" | "fuchsia";
  date: string;
  readTime: string;
  author: string;
  content: string;
}

const MOCK_POSTS: BlogPost[] = [
  {
    slug: "how-robinhood-chain-makes-payroll-cheaper",
    title: "How Robinhood Chain makes global payroll 100x cheaper",
    category: "sky",
    date: "March 15, 2025",
    readTime: "4 min",
    author: "Elena Vance",
    content: `
      In the traditional world of finance, sending money across borders is a slow, expensive, and opaque process. For businesses with global teams, payroll is a repeating nightmare of 3-5% transfer fees, unfavorable exchange rates, and 3-5 day waiting periods.
      
      Enter the Robinhood Chain. Unlike traditional banking rails, Robinhood Chain was built specifically for moving money across borders at the speed of the internet. By using Robinhood Chain as the underlying settlement layer, PaySlip is able to reduce global payroll costs by up to 98%.
      
      The secret lies in Robinhood Chain’s efficient consensus mechanism. Transactions settle in 3-5 seconds with fees that are a fraction of a cent. For a company paying 50 employees in 20 different countries, the savings are astronomical. Not only are the fees lower, but the transparency is absolute. Every payment can be tracked on-chain, eliminating the "your check is in the mail" excuses.
      
      PaySlip abstracts the complexity of the blockchain, allowing employers to fund payroll in local currencies or stablecoins, while employees receive their earnings in their preferred digital asset instantly. This isn't just an improvement; it's a paradigm shift in how we think about work and compensation in a globalized economy.
    `
  },
  {
    slug: "eth-vs-usdc-for-payroll",
    title: "ETH or USDC — which is better for paying your team?",
    category: "amber",
    date: "March 22, 2025",
    readTime: "3 min",
    author: "Mark S. Scout",
    content: `
      A common question we get at PaySlip is whether it's better to pay employees in ETH (Robinhood Chain's native asset) or USDC (the world’s leading digital dollar). Both have distinct advantages depending on your company's structure and your employees' preferences.
      
      ETH is the "gas" of the Robinhood Chain. It is inherently fast and offers the highest liquidity within the Robinhood Chain ecosystem. For employees who are crypto-native and comfortable with volatility, ETH can be an excellent choice for immediate trading or long-term holding. However, for many workers, the price fluctuations of ETH compared to their local cost of living can be a deterrent.
      
      USDC on Robinhood Chain offers the best of both worlds: the stability of the US Dollar combined with the speed and low cost of the Robinhood Chain. USDC is fully reserved and always redeemable 1:1 for US dollars. For the majority of international teams, USDC provides the stability they need to pay rent, buy groceries, and plan their futures without worrying about the daily movements of the crypto market.
      
      At PaySlip, we recommend a hybrid approach. Many of our forward-thinking clients offer their teams a "payment split," allowing them to receive a portion of their salary in USDC for stability and a portion in ETH for its utility within the network.
    `
  },
  {
    slug: "building-payslip-at-hackathon",
    title: "Building PaySlip in 48 hours at a hackathon",
    category: "fuchsia",
    date: "April 02, 2025",
    readTime: "5 min",
    author: "Parth Karan",
    content: `
      Hackathons are often described as pressure cookers for innovation. When we started building PaySlip, we had 48 hours to take a complex problem—global payroll—and solve it using the viem.
      
      The challenge wasn't just writing code; it was designing a user experience that made blockchain invisible. We spent the first 6 hours purely on architecture, ensuring our MongoDB schema could handle the many-to-many relationships between organisations, employers, and employees while maintaining cryptographic links to EVM wallets.
      
      Integration with the EIP-1193 wallet API was our first major technical hurdle. We needed a secure way for employers to sign bulk transactions without ever sharing their private keys. By leveraging Robinhood Chain's multisig capabilities and the security of MetaMask, we constructed a "Payroll Runner" that feels as simple as clicking a button but executes multi-stage on-chain logic.
      
      One of the biggest lessons learned was the importance of "empty states" and "loading boundaries." In a blockchain app, waiting for a ledger to close is inevitable. We focused heavily on the visual feedback—using pulsing orbs and shimmer effects—to ensure the user always knew their money was moving. PaySlip is a testament to what a focused team can achieve when they combine modern web frameworks like Next.js with robust blockchain protocols like Robinhood Chain.
    `
  }
];

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = MOCK_POSTS.find(p => p.slug === params.slug);
  
  if (!post) {
    notFound();
  }

  const otherPosts = MOCK_POSTS.filter(p => p.slug !== params.slug);

  const categoryColors = {
    sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-indigo-500/30">
      <Navbar />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#6366f10a_1px,transparent_1px),linear-gradient(to_bottom,#6366f10a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <main className="relative z-10 pt-32 pb-20 px-6">
        <article className="max-w-3xl mx-auto">
          {/* Back button */}
          <Link 
            href="/blog" 
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-12 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to industry news
          </Link>

          {/* Header */}
          <header className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border ${categoryColors[post.category]} mb-6`}>
              {post.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight tracking-tighter">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm border-y border-white/5 py-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="font-semibold text-white/90">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime} read
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-brand max-w-none mb-20 animate-in fade-in duration-1000 delay-300">
            {post.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-lg text-slate-300 leading-relaxed mb-6">
                {para.trim()}
              </p>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between py-10 border-t border-white/10">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all">
                <Bookmark className="h-4 w-4" /> Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          {/* More Articles */}
          <section className="mt-32">
            <h2 className="text-2xl font-bold text-white mb-10 pb-4 border-b border-white/5 tracking-tight flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              More from the desk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherPosts.map((other) => (
                <Link 
                  key={other.slug}
                  href={`/blog/${other.slug}`}
                  className="group block p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1"
                >
                  <div className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mb-4 border ${categoryColors[other.category]}`}>
                    {other.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-indigo-400 transition-colors">
                    {other.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {other.date}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

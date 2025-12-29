import { Proposal } from '@/components/proposal';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] p-4 overflow-hidden">
      <Proposal />
    </main>
  );
}

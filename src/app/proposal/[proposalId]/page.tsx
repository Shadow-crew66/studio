
'use client';

import { Suspense } from 'react';
import { Proposal } from '@/components/proposal';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface ProposalData {
  senderId: string;
  senderName: string;
  recipientName: string;
  letter: string;
  status: 'pending' | 'accepted' | 'rejected';
}

function ProposalLoader({ proposalId }: { proposalId: string }) {
  const firestore = useFirestore();

  const proposalRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, `proposals/${proposalId}`);
  }, [firestore, proposalId]);

  const { data: proposal, isLoading } = useDoc<ProposalData>(proposalRef);

  if (isLoading) {
    return <div>Loading proposal...</div>;
  }

  if (proposal) {
    return <Proposal from={proposal.senderName} to={proposal.recipientName} letter={proposal.letter} proposalId={proposalId} senderId={proposal.senderId} />;
  }

  return (
    <div className="text-center text-white">
      <h1 className="text-2xl font-headline">Proposal not found</h1>
      <p>The link may be incorrect or the proposal may have been removed.</p>
    </div>
  );
}

export default function ProposalPage({ params }: { params: { proposalId: string } }) {
  const { proposalId } = params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fee9f2] to-[#ff69b4] p-4 overflow-hidden">
      <Suspense fallback={<div>Loading proposal...</div>}>
        <ProposalLoader proposalId={proposalId} />
      </Suspense>
    </main>
  );
}

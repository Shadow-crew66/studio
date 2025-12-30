
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

  // This is a bit of a trick. We don't know the senderId,
  // but the security rules are path-based and restrictive.
  // We'll need a more robust way to fetch this, likely via a dedicated proposals collection
  // For now, we can't fetch it directly without knowing the user.
  // This will be fixed in the next step.

  // For now, we will create a placeholder.
  // In the next step we will read the proposal data.
  const from = "Your love";
  const to = "My dearest";
  const letter = "Will you marry me?";

  if (from && to) {
    return <Proposal from={from} to={to} letter={letter} proposalId={proposalId} />;
  }

  return (
    <div className="text-center text-white">
      <h1 className="text-2xl font-headline">Proposal not found</h1>
      <p>The link may be incorrect or the proposal may have been removed.</p>
    </div>
  );
}

export default function ProposalPage({ params }: { params: { proposalId: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fee9f2] to-[#ff69b4] p-4 overflow-hidden">
      <Suspense fallback={<div>Loading proposal...</div>}>
        <ProposalLoader proposalId={params.proposalId} />
      </Suspense>
    </main>
  );
}



'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

function PersonalizeForm() {
  const { user } = useUser();
  const [toName, setToName] = useState('');
  const [letter, setLetter] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const firestore = useFirestore();

  const generateUrl = async () => {
    if (user && toName && firestore) {
      try {
        // Create a document in the public proposals collection first to get an ID
        const publicProposalsRef = collection(firestore, `proposals`);
        const publicDocRef = await addDoc(publicProposalsRef, {
            senderId: user.uid,
            senderName: user.displayName || user.email,
            recipientName: toName,
            letter: letter,
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
        const proposalId = publicDocRef.id;

        const newProposal = {
            id: proposalId,
            senderId: user.uid,
            senderName: user.displayName || user.email,
            recipientName: toName,
            letter: letter,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        // Now create a copy in the user's private collection
        const userProposalRef = doc(firestore, `users/${user.uid}/proposals/${proposalId}`);
        await setDoc(userProposalRef, newProposal);
        
        const url = new URL(`${window.location.origin}/proposal/${proposalId}`);
        setGeneratedUrl(url.toString());
        setIsCopied(false);

      } catch (error) {
        console.error("Error creating proposal:", error);
        // Optionally, show an error toast to the user
      }
    }
  };

  const copyUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setIsCopied(true);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Your Proposal</CardTitle>
        <CardDescription>Enter your partner's name to create a special link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="toName">Your Partner's Name</Label>
          <Input id="toName" placeholder="Enter your partner's name" value={toName} onChange={(e) => setToName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="letter">Personal Letter (Optional)</Label>
          <Textarea id="letter" placeholder="Write your heartfelt message here..." value={letter} onChange={(e) => setLetter(e.target.value)} />
        </div>
        <Button onClick={generateUrl} className="w-full" disabled={!toName}>
          Generate Link
        </Button>
        {generatedUrl && (
          <div className="space-y-2 pt-4">
            <Label>Your special link:</Label>
            <div className="flex gap-2">
              <Input type="text" readOnly value={generatedUrl} className="bg-muted" />
              <Button onClick={copyUrl} variant="secondary" disabled={isCopied}>
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Send this link to your partner!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HomePageContent() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // or a loading spinner
  }

  return <PersonalizeForm />;
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fee9f2] to-[#ff69b4] p-4 overflow-hidden">
      <Suspense>
        <HomePageContent />
      </Suspense>
    </main>
  );
}

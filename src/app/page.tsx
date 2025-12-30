
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, setDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface Proposal {
  id: string;
  recipientName: string;
  status: 'pending' | 'accepted';
  createdAt: string;
}

function PersonalizeForm() {
  const { user } = useUser();
  const [toName, setToName] = useState('');
  const [letter, setLetter] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const firestore = useFirestore();

  const generateUrl = async () => {
    if (user && toName && firestore) {
      setIsGenerating(true);
      try {
        const publicProposalsRef = collection(firestore, 'proposals');
        const publicDocRef = await addDoc(publicProposalsRef, {
          senderId: user.uid,
          senderName: user.displayName || user.email,
          recipientName: toName,
          letter: letter,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        const proposalId = publicDocRef.id;

        // Set the ID in the document itself
        await setDoc(doc(firestore, 'proposals', proposalId), { id: proposalId }, { merge: true });


        const newProposal = {
          id: proposalId,
          senderId: user.uid,
          senderName: user.displayName || user.email,
          recipientName: toName,
          letter: letter,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const userProposalRef = doc(firestore, `users/${user.uid}/proposals/${proposalId}`);
        await setDoc(userProposalRef, newProposal);

        const url = new URL(`${window.location.origin}/proposal/${proposalId}`);
        setGeneratedUrl(url.toString());
        setIsCopied(false);
        setToName('');
        setLetter('');
      } catch (error) {
        console.error("Error creating proposal:", error);
      } finally {
        setIsGenerating(false);
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
        <Button onClick={generateUrl} className="w-full" disabled={!toName || isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Link'}
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

function ProposalList() {
  const { user } = useUser();
  const firestore = useFirestore();

  const proposalsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/proposals`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: proposals, isLoading } = useCollection<Proposal>(proposalsQuery);

  const handleDelete = async (proposalId: string) => {
    if (!user || !firestore) return;
    try {
      // Delete from user's private collection
      await deleteDoc(doc(firestore, `users/${user.uid}/proposals`, proposalId));
      // Delete from public collection
      await deleteDoc(doc(firestore, 'proposals', proposalId));
    } catch (error) {
      console.error("Error deleting proposal: ", error);
    }
  };

  if (isLoading) {
    return <p>Loading proposals...</p>;
  }
  
  if (!proposals || proposals.length === 0) {
    return null; // Don't show anything if there are no proposals yet
  }

  return (
    <Card className="w-full max-w-md mt-8">
      <CardHeader>
        <CardTitle>Your Sent Proposals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
            <div className="flex-grow">
              <p className="font-semibold">{proposal.recipientName}</p>
              <p className="text-sm text-muted-foreground">
                Sent on {format(new Date(proposal.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'} className={proposal.status === 'accepted' ? 'bg-green-500 text-white' : ''}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the proposal
                      and the special link will no longer work.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(proposal.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
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
    return null;
  }

  return (
    <>
      <PersonalizeForm />
      <ProposalList />
    </>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fee9f2] to-[#ff69b4] p-4 overflow-auto">
       <div className="py-8">
        <Suspense>
          <HomePageContent />
        </Suspense>
      </div>
    </main>
  );
}

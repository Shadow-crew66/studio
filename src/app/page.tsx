
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Trash2, Sparkles } from 'lucide-react';
import type { User } from 'firebase/auth';
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
} from "@/components/ui/alert-dialog";
import { generateLetter } from '@/ai/flows/adaptive-persuasion';


interface PrivateProposal {
  id: string;
  recipientName: string;
  createdAt: string;
}

interface PublicProposal {
  status: 'pending' | 'accepted';
}

function PersonalizeForm({ user }: { user: User | null }) {
  const [toName, setToName] = useState('');
  const [letter, setLetter] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const firestore = useFirestore();

  const handleGenerateLetter = async () => {
    if (!toName || !keywords) {
      return;
    }
    setIsGeneratingLetter(true);
    try {
      const result = await generateLetter({ recipientName: toName, keywords });
      if (result.letter) {
        setLetter(result.letter);
      }
    } catch (error) {
      console.error("Error generating letter:", error);
    } finally {
      setIsGeneratingLetter(false);
    }
  };
  
  const generateUrl = async () => {
    if (!user || !toName || !firestore) return;

    setIsGenerating(true);
    try {
      const batch = writeBatch(firestore);
      const publicProposalRef = doc(collection(firestore, 'proposals'));
      const proposalId = publicProposalRef.id;
      
      const publicProposalData = {
        id: proposalId,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        recipientName: toName,
        letter: letter,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      batch.set(publicProposalRef, publicProposalData);
      
      const userProposalData = {
        id: proposalId,
        senderId: user.uid,
        recipientName: toName,
        createdAt: new Date().toISOString(),
      };
      const userProposalRef = doc(firestore, `users/${user.uid}/proposals/${proposalId}`);
      batch.set(userProposalRef, userProposalData);

      await batch.commit();

      const url = new URL(`${window.location.origin}/proposal/${proposalId}`);
      setGeneratedUrl(url.toString());
      setIsCopied(false);
      setToName('');
      setLetter('');
      setKeywords('');
    } catch (error) {
      console.error("Error creating proposal:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setIsCopied(true);
  };
  
  const isFormDisabled = isGenerating || !user;
  const isAiButtonDisabled = !toName || !keywords || isGeneratingLetter || isGenerating || !user;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Your Proposal</CardTitle>
        <CardDescription>
          Enter your partner's name and some keywords to create a special proposal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
          <fieldset disabled={isFormDisabled} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="toName">Your Partner's Name</Label>
              <Input id="toName" placeholder="Enter your partner's name" value={toName} onChange={(e) => setToName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords for AI</Label>
              <Input id="keywords" placeholder="e.g., our first date, your smile, adventures" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </div>
          </fieldset>
          
          <div className="space-y-2">
            <Label htmlFor="letter">Personal Letter</Label>
            <div className="flex gap-2">
              <Button onClick={handleGenerateLetter} className="w-full" variant="outline" size="sm" disabled={isAiButtonDisabled}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isGeneratingLetter ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>
            <Textarea id="letter" placeholder="Your AI-generated letter will appear here..." value={letter} onChange={(e) => setLetter(e.target.value)} rows={6} disabled={isFormDisabled}/>
          </div>
          
          <fieldset disabled={isFormDisabled} className="space-y-4">
            <Button onClick={generateUrl} className="w-full" disabled={!toName || isGenerating}>
              {isGenerating ? 'Generating Link...' : 'Generate Link'}
            </Button>
          </fieldset>

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


function ProposalListItem({ proposal }: { proposal: PrivateProposal }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const publicProposalRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, `proposals/${proposal.id}`);
  }, [firestore, proposal.id]);

  const { data: publicProposal, isLoading: isStatusLoading } = useDoc<PublicProposal>(publicProposalRef);

  const handleDelete = async (proposalId: string) => {
    if (!user || !firestore) return;
    try {
      const privateDocRef = doc(firestore, `users/${user.uid}/proposals`, proposalId);
      await deleteDoc(privateDocRef);
      
      const publicDocRef = doc(firestore, 'proposals', proposalId);
      await deleteDoc(publicDocRef);

    } catch (error) {
      console.error("Error deleting proposal: ", error);
    }
  };

  const status = isStatusLoading ? 'pending' : (publicProposal?.status || 'pending');

  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
      <div className="flex-grow">
        <p className="font-semibold">{proposal.recipientName}</p>
        <p className="text-sm text-muted-foreground">
          Sent on {format(new Date(proposal.createdAt), 'MMM d, yyyy')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={status === 'accepted' ? 'default' : 'secondary'} className={status === 'accepted' ? 'bg-green-500 text-white' : ''}>
          {isStatusLoading ? '...' : status.charAt(0).toUpperCase() + status.slice(1)}
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
  );
}

function ProposalList() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const privateProposalsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/proposals`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: proposals, isLoading } = useCollection<PrivateProposal>(privateProposalsQuery);

  if (isUserLoading || isLoading) {
    return (
        <Card className="w-full max-w-md mt-8">
            <CardHeader>
                <CardTitle>Your Sent Proposals</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Loading proposals...</p>
            </CardContent>
        </Card>
    );
  }
  
  if (!proposals || proposals.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mt-8">
      <CardHeader>
        <CardTitle>Your Sent Proposals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposals.map((proposal) => (
          <ProposalListItem key={proposal.id} proposal={proposal} />
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
    return (
      <div className="py-8 text-center">
        <p>Loading user...</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <Suspense>
        <PersonalizeForm user={user} />
        <ProposalList />
      </Suspense>
    </div>
  );
}


export default function Home() {
  const { user, isUserLoading } = useUser();
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fee9f2] to-[#ff69b4] p-4 overflow-auto">
       {isUserLoading && !user ? (
         <div className="py-8 text-center">
           <p>Loading...</p>
         </div>
       ) : (
        <HomePageContent />
       )}
    </main>
  );
}

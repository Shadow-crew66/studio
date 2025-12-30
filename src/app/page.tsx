
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Proposal } from '@/components/proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function PersonalizeForm() {
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [letter, setLetter] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const generateUrl = () => {
    if (fromName && toName) {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('from', fromName);
      url.searchParams.set('to', toName);
      if (letter.trim()) {
        url.searchParams.set('letter', letter);
      }
      
      const urlString = url.toString();
      setGeneratedUrl(urlString);
      setIsCopied(false);
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
        <CardTitle>Personalize Your Proposal</CardTitle>
        <CardDescription>Enter your names to create a special link to send to your partner.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fromName">Your Name</Label>
          <Input id="fromName" placeholder="Enter your name" value={fromName} onChange={(e) => setFromName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="toName">Your Partner's Name</Label>
          <Input id="toName" placeholder="Enter your partner's name" value={toName} onChange={(e) => setToName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="letter">Personal Letter (Optional)</Label>
          <Textarea id="letter" placeholder="Write your heartfelt message here..." value={letter} onChange={(e) => setLetter(e.target.value)} />
        </div>
        <Button onClick={generateUrl} className="w-full" disabled={!fromName || !toName}>
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

function ProposalLoader() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const letter = searchParams.get('letter');

  if (from && to) {
    return <Proposal from={from} to={to} letter={letter || undefined} />;
  }

  return <PersonalizeForm />;
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fee9f2] to-[#ff69b4] p-4 overflow-hidden">
      <Suspense>
        <ProposalLoader />
      </Suspense>
    </main>
  );
}

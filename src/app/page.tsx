
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Proposal } from '@/components/proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function PersonalizeForm() {
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const generateUrl = () => {
    if (fromName && toName) {
      const url = `${window.location.origin}${window.location.pathname}?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}`;
      setGeneratedUrl(url);
    }
  };

  const copyUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    alert('Link copied to clipboard!');
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
        <Button onClick={generateUrl} className="w-full" disabled={!fromName || !toName}>
          Generate Link
        </Button>
        {generatedUrl && (
          <div className="space-y-2 pt-4">
            <Label>Your special link:</Label>
            <div className="flex gap-2">
              <Input type="text" readOnly value={generatedUrl} className="bg-muted" />
              <Button onClick={copyUrl} variant="secondary">Copy</Button>
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

  if (from && to) {
    return <Proposal from={from} to={to} />;
  }

  return <PersonalizeForm />;
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] p-4 overflow-hidden">
      <Suspense>
        <ProposalLoader />
      </Suspense>
    </main>
  );
}

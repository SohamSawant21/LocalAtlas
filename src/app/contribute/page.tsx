import { ContributionForm } from '@/components/contribute/ContributionForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contribute a Location - LocalAtlas',
  description: 'Help others discover the hidden gems of Konkan by sharing a location.',
};

export default function ContributePage() {
  return (
    <div className="container py-10">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Share a Hidden Gem</h1>
        <p className="text-muted-foreground text-lg">
          Know a secret waterfall or a pristine beach? Help fellow explorers discover the unseen beauty of Konkan.
        </p>
      </div>
      <ContributionForm />
    </div>
  );
}

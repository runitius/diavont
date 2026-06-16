import Navigation from '@/components/Navigation';
import RingCreator from '@/components/RingCreator';
import CustomCursor from '@/components/CustomCursor';

export const metadata = {
  title: 'Create Your Ring — DIAVONT',
  description: 'Design your bespoke diamond ring. Choose your diamond shape, carat weight, and metal to create a ring that is uniquely yours.',
};

export default function CreatePage() {
  return (
    <>
      <CustomCursor />
      <Navigation />
      <RingCreator />
    </>
  );
}

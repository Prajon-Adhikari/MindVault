import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TopicDetailClient from "./TopicDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function TopicDetailWrapper({ params }: PageProps) {
  const { id } = await params;
  return <TopicDetailClient topicId={id} />;
}

export default function TopicDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      }
    >
      <TopicDetailWrapper params={params} />
    </Suspense>
  );
}

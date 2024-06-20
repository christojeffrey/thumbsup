import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col h-full gap-6">
      <Link href="/join-room">
        <Button size="lg" className="text-xl p-8">
          Join Room
        </Button>
      </Link>
      <Link href="create-room">
        <Button variant="outline" size="sm">
          Create Room
        </Button>
      </Link>
    </div>
  );
}

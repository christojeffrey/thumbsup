"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRandomString } from "@/lib/utils";
import { firebaseDBAtom } from "@/store";
import { ref, set } from "firebase/database";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [voteTitle, setVoteTitle] = useState("");
  const firebaseDB = useAtomValue(firebaseDBAtom);
  const router = useRouter();
  function handleCreateRoomClick() {
    console.log("Create Room");
    toast("Room created");
    // validate
    if (!roomName) {
      toast("Room name is required");
      return;
    }
    if (!peopleCount) {
      toast("People count is required");
      return;
    }
    if (!voteTitle) {
      toast("Vote title is required");
      return;
    }
    const roomID = generateRandomString(5);
    // create room
    firebaseDB;
    set(ref(firebaseDB, "/rooms/" + roomID), {
      roomName,
      peopleCount,
      voteTitle,
      votingState: "waiting",
      voters: [],
    });
    router.push("/room/" + roomID);
  }
  return (
    <>
      <div>
        <Label>Room Name</Label>
        <Input placeholder="Class Captain A3" onChange={(e) => setRoomName(e.target.value)}></Input>
        <div className="text-sm text-slate-500">
          This will be displayed in <span className="font-semibold">room list</span>
        </div>
      </div>
      <div className="mt-12">
        <Label>Number of People</Label>
        <Input placeholder="3" min="2" max="10" className="w-24" type="number" onChange={(e) => setPeopleCount(e.target.value)}></Input>
        <div className="text-sm text-slate-500">
          <div>It has to be exact!</div>
          <div>You can{`'`}t change this in the middle of the voting</div>
        </div>
      </div>
      <div className="mt-24">
        <Label>Vote Title</Label>
        <Input placeholder="Yay or Nay for James?" onChange={(e) => setVoteTitle(e.target.value)}></Input>
        <div className="text-sm text-slate-500">
          This will be displayed in <span className="font-semibold">voting room</span>
        </div>
      </div>
      <Button className="w-full mt-24" onClick={handleCreateRoomClick}>
        Create Room
      </Button>
    </>
  );
}

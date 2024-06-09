"use client";
import { Button } from "@/components/ui/button";
import { firebaseDBAtom } from "@/store";
import { onValue, ref, set } from "firebase/database";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Room({ params }: { params: { roomID: string } }) {
  const [currentRoom, setCurrentRoom] = useState<any>();

  const firebaseDB = useAtomValue(firebaseDBAtom);
  const router = useRouter();
  // subscribe to current room
  useEffect(() => {
    const roomsRef = ref(firebaseDB, "rooms/" + params.roomID);
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log("data", data);
        setCurrentRoom(data);
      }
    });
  }, [firebaseDB]);

  function changeVotingState(votingState: string) {
    set(ref(firebaseDB, "rooms/" + params.roomID + "/votingState"), votingState);
  }
  if (currentRoom?.votingState === "waiting") {
    return (
      <>
        <div>Waiting for the people to join</div>
        {currentRoom.voters?.length} people joined
        {currentRoom.voters?.length == currentRoom.peopleCount && (
          <>
            <Button onClick={() => changeVotingState("voting")}>Start Voting</Button>
          </>
        )}
      </>
    );
  }
  if (currentRoom?.votingState === "voting") {
    const currentVoters = currentRoom.voters?.reduce((acc: number, voter: any) => {
      return acc + (voter.voted ? 1 : 0);
    }, 0);
    return (
      <>
        <div>Voting</div>
        {/* end when everyone has vote */}
        {currentVoters}
        people voted
        {currentVoters == currentRoom?.peopleCount && <Button onClick={() => changeVotingState("calculating")}>calculate result</Button>}
      </>
    );
  }
  if (currentRoom?.votingState === "calculating") {
    return (
      <>
        <Button
          onClick={() => {
            set(ref(firebaseDB, "rooms/" + params.roomID), null);
            router.push("/");
          }}
        >
          Delete Room
        </Button>
      </>
    );
  }
  return <></>;
}

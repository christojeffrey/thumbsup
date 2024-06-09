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

  // waiting view
  if (currentRoom?.votingState === "waiting") {
    const currentVoters = currentRoom.voters?.length || 0;
    return (
      <div className="flex flex-col justify-center items-center">
        <div className="text-3xl mt-24">{currentRoom.voteTitle}</div>
        <div className="font-bold mt-24">
          <span className="text-5xl">{currentVoters}</span>
          <span>/{currentRoom?.peopleCount}</span>
        </div>
        {currentRoom.voters?.length == currentRoom.peopleCount ? (
          <div className="mt-24">
            <Button onClick={() => changeVotingState("voting")}>Start Voting</Button>
          </div>
        ) : (
          <div className="mt-24">wait for people to join</div>
        )}
      </div>
    );
  }

  // voting view
  if (currentRoom?.votingState === "voting") {
    const currentVoters = currentRoom.voters?.reduce((acc: number, voter: any) => {
      return acc + (voter.voted ? 1 : 0);
    }, 0);
    return (
      <>
        <div className="flex flex-col justify-center items-center">
          <div className="text-3xl mt-24">{currentRoom.voteTitle}</div>
          <div className="font-bold mt-24">
            <span className="text-5xl">{currentVoters}</span>
            <span>/{currentRoom?.peopleCount}</span>
          </div>
          {currentVoters == currentRoom.peopleCount ? (
            <div className="mt-24">
              <Button onClick={() => changeVotingState("calculating")}>Calculate!</Button>
            </div>
          ) : (
            <div className="mt-24">wait for people to vote</div>
          )}
        </div>
      </>
    );
  }

  // calculating view
  if (currentRoom?.votingState === "calculating") {
    return (
      <div className="mt-12 mx-auto w-fit">
        <Button
          onClick={() => {
            set(ref(firebaseDB, "rooms/" + params.roomID), null);
            router.push("/");
          }}
          variant="destructive"
        >
          Delete Room
        </Button>
      </div>
    );
  }
  return <></>;
}

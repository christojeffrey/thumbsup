"use client";
import { Button } from "@/components/ui/button";
import { firebaseDBAtom } from "@/store";
import { onValue, ref, set } from "firebase/database";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function JoinRoom() {
  const firebaseDB = useAtomValue(firebaseDBAtom);
  const [rooms, setRooms] = useState<any[]>([]);
  const router = useRouter();
  // subscribe to rooms
  useEffect(() => {
    const roomsRef = ref(firebaseDB, "rooms");
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rooms = Object.keys(data).map((key) => {
          return {
            ...data[key],
            id: key,
          };
        });
        console.log(rooms);
        setRooms(rooms);
      }
    });
  }, [firebaseDB]);

  function handleJoinRoom(roomID: string) {
    // assign current voter ID based on number of voters
    // get current voter number
    const voterRef = ref(firebaseDB, `rooms/${roomID}/voters`);
    let voterNumber = 0;

    onValue(voterRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        voterNumber = Object.keys(data).length;
      }
    });

    console.log(voterNumber);

    const maxPeople = rooms.find((room) => room.id === roomID)?.peopleCount;
    if (voterNumber > maxPeople) {
      alert("Room is full");
      return;
    }
    // add new voter
    set(ref(firebaseDB, `rooms/${roomID}/voters/${voterNumber}`), {
      voterName: "Voter " + voterNumber,
    });

    router.push("/vote/" + roomID + "?voterID=" + (voterNumber - 1));
  }

  return (
    <>
      <div className="font-bold">Rooms</div>
      <div className="flex flex-col gap-4">
        {rooms.map((room) => (
          <Button variant="ghost" key={room.id} className="w-fit" onClick={() => handleJoinRoom(room.id)}>
            <div className="text-2xl py-8">{room.roomName}</div>
          </Button>
        ))}
      </div>
    </>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { firebaseDBAtom } from "@/store";
import { onValue, ref, set } from "firebase/database";
import { useAtomValue } from "jotai";
import { useSearchParams } from "next/navigation";
import { parse } from "path";
import { useEffect, useState } from "react";

export default function Room({ params }: { params: { roomID: string } }) {
  const [votingState, setVotingState] = useState<string>(); // waiting, voting, result

  const [currentRoom, setCurrentRoom] = useState<any>();
  const [voteValue, setVoteValue] = useState<boolean>(false);

  const [secrets, setSecrets] = useState<any[]>([]);
  const [result, setResult] = useState<number | null>(null); // number of yes
  const [step, setStep] = useState<number>(0);
  // 1 - spliting
  // 2 - sum
  // 3 - combine
  // 4 - done! show result

  const firebaseDB = useAtomValue(firebaseDBAtom);

  // subscribe to current room
  useEffect(() => {
    const roomsRef = ref(firebaseDB, "rooms/" + params.roomID);
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentRoom(data);
      }
    });
  }, [firebaseDB]);

  const searchParams = useSearchParams();
  const voterID = searchParams.get("voterID") ? parseInt(searchParams.get("voterID")!) : -1;

  useEffect(() => {
    // check if everyone is done calculating
    // which is when all secret has value
    if (currentRoom) {
      if (step == 0) {
        const secretCalculationDone = currentRoom.voters.reduce((acc: number, voter: any) => {
          return acc + (voter.secret?.length > 0 ? 1 : 0);
        }, 0);
        console.log("step 0 secretCalculationDone, data.peopleCount");
        console.log(secretCalculationDone, parseInt(currentRoom.peopleCount));
        const isEveryoneIsDone = secretCalculationDone == parseInt(currentRoom.peopleCount);
        if (isEveryoneIsDone) {
          setStep(1); // do sum
          console.log("do sum!");
        }
      } else if (step == 1) {
        // check if everyone has sum
        const sumCalculationDone = currentRoom.voters.reduce((acc: number, voter: any) => {
          return acc + (voter.sum ? 1 : 0);
        }, 0);

        console.log("step 1 sumCalculationDone, data.peopleCount");
        console.log(sumCalculationDone, parseInt(currentRoom.peopleCount));
        const isSumReady = sumCalculationDone == parseInt(currentRoom.peopleCount);
        console.log("isSumReady", isSumReady);
        if (isSumReady) {
          setStep(2);
        }
      }
    }
  }, [currentRoom]);
  useEffect(() => {
    if (step == 1) {
      console.log("calculating sum");
      // get the secret of my own index from everyone
      const secretsFromEveryone = currentRoom?.voters.map((voter: any) => {
        return voter.secret[voterID];
      });
      // fill in my own secret
      secretsFromEveryone[voterID] = secrets[voterID];

      console.log(secretsFromEveryone);

      // sum them up
      let sum = secretsFromEveryone.reduce((acc: number, secret: any) => {
        return acc + secret.value;
      }, 0);

      console.log(sum);
      sum = sum % secretsFromEveryone[voterID].modulus;
      console.log(sum);

      set(ref(firebaseDB, `rooms/${params.roomID}/voters/${voterID}/sum`), sum);
    } else if (step == 2) {
      console.log("sum is ready");
      // get the sum of my own index from everyone
      const sumsFromEveryone = currentRoom?.voters.map((voter: any) => {
        return voter.sum;
      });
      console.log(sumsFromEveryone);
      combineShares(sumsFromEveryone);
    }
  }, [step]);

  useEffect(() => {
    // get room data
    const roomRef = ref(firebaseDB, `rooms/${params.roomID}`);

    // read data
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log(data);
        setVotingState(data.votingState);
      }
    });
  }, []);

  async function combineShares(secrets: number[]) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/combine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secrets,
      }),
    });
    const data = await response.json();
    console.log(data);
    console.log(data.result);

    // minus all voterID, and divide by 10. will give you the number of 'yes'
    let tempResult = data.result;
    for (let i = 0; i < parseInt(currentRoom.peopleCount); i++) {
      tempResult = tempResult - i;
    }
    tempResult = tempResult / 10;
    setResult(tempResult);
    setStep(4);
  }

  async function turnToShares() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/split`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: voteValue ? 10 + voterID : voterID,
        quantity: parseInt(currentRoom.peopleCount),
      }),
    });
    const data = await response.json();
    const shares = data.secrets;
    setSecrets(shares);
    console.log(shares);
    // modify my own secret value
    const editedSecret = shares.map((share: any, index: number) => {
      if (index === voterID) {
        return "hidden";
      } else {
        return share;
      }
    });
    console.log(editedSecret);
    // update database
    set(ref(firebaseDB, `rooms/${params.roomID}/voters/${voterID}/secret`), editedSecret);
  }
  // trigger based on voting state
  useEffect(() => {
    if (votingState == "calculating") {
      turnToShares();
    }
  }, [votingState]);

  // do vote!
  if (votingState === "waiting") {
    return <div>waiting...</div>;
  }

  if (votingState === "voting") {
    const hasVoted = currentRoom.voters[voterID]?.voted;

    if (hasVoted) {
      return <div>you have voted</div>;
    }
    return (
      <div>
        <div>Start</div>
        <div className="text-6xl">{currentRoom.voteTitle}</div>
        <Button
          onClick={() => {
            setVoteValue(true);
            set(ref(firebaseDB, `rooms/${params.roomID}/voters/${voterID}/voted`), true);
          }}
        >
          yes!
        </Button>
        <Button
          onClick={() => {
            setVoteValue(false);
            set(ref(firebaseDB, `rooms/${params.roomID}/voters/${voterID}/voted`), true);
          }}
        >
          no!
        </Button>
      </div>
    );
  }

  if (votingState === "calculating") {
    // split then share everyone else's key

    if (result !== null) {
      return (
        <>
          <div>Result</div>
          <div className="text-6xl">{`${result} out of ${currentRoom.peopleCount} said yes`}</div>
        </>
      );
    }
    return <>calculating</>;
  }

  return <></>;
}

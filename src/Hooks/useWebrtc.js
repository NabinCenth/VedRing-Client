import { cameraPreview } from "./useMedia";
import { useState, useEffect, useContext } from "react";
import useSocket from "./useSocket";
import { ContextData } from "../Component/Context/Context";
import { SocketContext } from "../Component/Context/SocketContext";
export const useWebrtc = (stream) => {
  const { setRemoteStream, RoomId } = useContext(ContextData);
  const { isOfferer,socket,setRemotename } = useContext(SocketContext);

  useEffect(() => {
    const handleOffer = async ({ offer }) => {
  console.log("OFFER RECEIVED on joiner");

  console.log("Offer received");

await pc.setRemoteDescription(new RTCSessionDescription(offer));
console.log("Remote description set");

const answer = await pc.createAnswer();
console.log("Answer created");

await pc.setLocalDescription(answer);
console.log("Local description set");

console.log("Emitting answer", RoomId);
socket.emit("answer", { answer, RoomId });
};
    if (!stream) {
      return;
    }
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
       const localStream = stream;
       console.log('roomId', RoomId);
    const setup = async () => {
      const getStream = async () => {
     
        localStream
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStream));
      };
      getStream();
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, RoomId });
          console.log("ICE candidate sent:", event.candidate);
        }
      };
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        console.log("Remote stream received:", event.streams[0]);
        console.log("received event", event);
      };
      //Offerer side
      if (isOfferer) {
          let pendingOffer = null;
  let peerIsReady = false;
        socket.on('user-joined', async ({socketId,Name}) => {
        console.log("User joined:", socketId,Name);
        setRemotename(Name);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (!peerIsReady) {
          pendingOffer = offer;
        }
        if (peerIsReady ) {
           // await new Promise((resolve) => setTimeout(resolve, 3000));// for teswting 
        socket.emit("offer", { offer, RoomId });
        console.log("Offer sent:", offer,socketId);
        pendingOffer = null;
        }

 
      });
      socket.on('peer-ready', async ({ socketId }) => {
        if (pendingOffer) {
    socket.emit("offer", { offer: pendingOffer, RoomId });
          pendingOffer = null;
        }
          else{
peerIsReady = true;
          }
        }
       );
        socket.on("answer", async ({answer}) => {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });
       
      }
      console.log("isOfferer", isOfferer);
      //Receiver side
      if (!isOfferer) {
            socket.on("offer",handleOffer); 
            console.log("Registering offer listener now");
              socket.emit("peer-ready", { RoomId });
              
      }
      socket.on("ice-candidate", async ({ candidate }) => {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("hangup", () => {
  pc.close();
  setRemoteStream(null);
  console.log("Peer has hung up. Connection closed.");
});
    };
    setup();
    return () => {
      pc.close();
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("offer",handleOffer);
      socket.off("user-joined")
    };
  }, [stream,socket, RoomId, isOfferer]);
};

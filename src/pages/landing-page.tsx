import { Avatar, Box, Container, Flex, HStack, keyframes, Image, IconButton, Text, VStack, useToast, Spinner, Center } from "@chakra-ui/react";
import { ChatIcon, CloseIcon, NotAllowedIcon, PhoneIcon } from "@chakra-ui/icons";
import { assetWhoWhoLogo, assetChoonsik } from "../assets";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { sleep, assert, toBase64, playAudio } from "../utils";
import { pipe, tap } from "@fxts/core";
import { detectWatermarkedAudio, getWatermarkedAudio } from "../apis";

const pulseRing = keyframes`
	0% {
    transform: scale(0.33);
  }

  40%,
  50% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
`;

export default function LandingPage() {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const gumStream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const base64data = useRef<ArrayBuffer | null>(null);

  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleSuccess = (stream: MediaStream) => {
      gumStream.current = stream;
      recorder.current = new MediaRecorder(stream);
      recorder.current.ondataavailable = function (e) {
        const reader = new FileReader();
        reader.readAsDataURL(e.data);
        reader.onloadend = function () {
          base64data.current = reader.result as ArrayBuffer;
        };
      };
    };

    navigator.mediaDevices.getUserMedia({ audio: true }).then(handleSuccess);
  }, []);

  const onClickCallButton = async () => {
    assert(recorder.current !== null, "recorder가 없음");

    if (!isRecording) {
      try {
        recorder.current.start();
      } catch (error) {
        // FIXME: 임시조치
        window.location.reload();
      }
      setIsRecording(true);
      return;
    }

    assert(gumStream.current !== null, "gumStream이 없음");

    recorder.current.stop();
    gumStream.current.getAudioTracks()[0].stop();
    setIsRecording(false);
    setIsLoading(true);
    await sleep(2000);

    assert(base64data.current !== null, "base64 데이터가 없음");

    await pipe(
      base64data.current.toString(),
      getWatermarkedAudio,
      tap(() => setIsLoading(false)),
      (path) =>
        Promise.all([
          playAudio(path),
          pipe(
            path,
            fetch,
            (res) => res.blob(),
            (blob) => new File([blob], "audio.wav", { type: "audio/wav" }),
            toBase64,
            (base64) => base64.toString(),
            detectWatermarkedAudio,
            (result) =>
              toast({
                title: "음성 검증 결과",
                description: result ? "유효한 음성입니다" : "유효하지 않은 음성입니다.",
                status: result ? "success" : "error",
                position: "top-right",
              })
          ),
        ])
    );
  };

  const onClickChatButton = () => {
    assert(fileInput.current !== null, "파일 input이 dom에 없음");
    fileInput.current.click();
  };

  const onFileChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (!files?.length) {
      return;
    }

    await pipe(files[0], (file) =>
      Promise.all([
        pipe(URL.createObjectURL(file), playAudio),
        pipe(
          file,
          toBase64,
          (base64) => base64.toString(),
          detectWatermarkedAudio,
          (result) =>
            toast({
              title: "음성 검증 결과",
              description: result ? "유효한 음성입니다" : "유효하지 않은 음성입니다.",
              status: result ? "success" : "error",
              position: "top-right",
            })
        ),
      ])
    );
  };

  return (
    <>
      <Box bgColor={"#eaeaea"}>
        <Container bgColor={"white"} minW={"330px"} px={0}>
          <VStack justifyContent={"space-between"} h={"100vh"} alignItems={"stretch"} spacing={0}>
            <HStack py={4} px={4} justifyContent={"center"}>
              <Image src={assetWhoWhoLogo} w={"150px"} />
            </HStack>
            <Flex justifyContent="center" alignItems="center" h="250px" w="full" overflow="hidden" bgColor={"#eaeaea"} flexGrow={1}>
              <Box
                as="div"
                position="relative"
                w={"96px"}
                h={"96px"}
                _before={{
                  content: "''",
                  position: "relative",
                  display: "block",
                  width: "300%",
                  height: "300%",
                  boxSizing: "border-box",
                  marginLeft: "-100%",
                  marginTop: "-100%",
                  borderRadius: "50%",
                  bgColor: "teal",
                  animation: `2.25s ${pulseRing} cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
                }}
              >
                <Avatar src={assetChoonsik} size="full" position="absolute" top={0} />
              </Box>
            </Flex>
            <VStack py={4} borderBottomWidth={"1px"} borderBottomColor={"gray.200"} borderBottomStyle={"solid"}>
              <Text fontWeight={"bold"} fontSize={"18px"}>
                저장되지 않은 번호
              </Text>
              <Text fontSize={"14px"} color={"gray"}>
                010-1234-5678
              </Text>
            </VStack>
            <VStack py={4} minH={"100px"} spacing={8}>
              <HStack justifyContent={"center"} spacing={15}>
                <IconButton icon={isRecording ? <NotAllowedIcon /> : <PhoneIcon />} aria-label="call" variant={"ghost"} onClick={onClickCallButton} />
                <IconButton icon={<ChatIcon />} aria-label="chat" variant={"ghost"} onClick={onClickChatButton} />
                <input type="file" accept="audio/*" hidden ref={fileInput} onChange={onFileChange} />
                <IconButton icon={<CloseIcon />} aria-label="close" variant={"ghost"} colorScheme="red" />
              </HStack>
              <Text color={"#666"} fontSize={"small"} fontWeight={"semi-bold"}>
                @Copyright 2024년도 1학기 ICT경영 1조
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
      {isLoading && (
        <Center pos={"fixed"} top={0} left={0} right={0} bottom={0} backgroundColor={"gray"} opacity={"0.5"}>
          <Spinner thickness="5px" speed="0.65s" emptyColor="gray.200" color="teal" size="xl" opacity={1} />
        </Center>
      )}
    </>
  );
}

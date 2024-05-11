import { Avatar, Box, Container, Flex, HStack, keyframes, Image, IconButton, Text, VStack, useToast } from "@chakra-ui/react";
import { ChatIcon, CloseIcon, NotAllowedIcon, PhoneIcon } from "@chakra-ui/icons";
import whoWhoLogo from "../assets/whowho-logo.png";
import choonsikImg from "../assets/choonsik.jpg";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { sleep } from "../utils/sleep";
import { assert } from "../utils/assert";
import { toBase64 } from "../utils/to-base64";
import { playAudio } from "../utils/play-audio";

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

const BASE_URL = "https://axiomatic-robot-423003-b8.du.r.appspot.com";

export default function LandingPage() {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);

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

    await sleep(2000);

    assert(base64data.current !== null, "base64 데이터가 없음");
    const formData = new FormData();
    formData.append("audio", base64data.current.toString());

    const {
      path,
    }: {
      message: string;
      path: string;
    } = await fetch(`${BASE_URL}/audio/watermark`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());

    await playAudio(path);

    // detect
    const response = await fetch(path);
    const blob = await response.blob();
    const file = new File([blob], "audio.wav", { type: "audio/wav" });

    const base64 = await toBase64(file);
    const detectingFormData = new FormData();
    detectingFormData.append("audio", base64.toString());

    const {
      result,
    }: {
      message: string;
      result: boolean;
    } = await fetch(`${BASE_URL}/audio/watermark/detect`, {
      method: "POST",
      body: detectingFormData,
    }).then((res) => res.json());

    if (!result) {
      toast({
        title: "음성 검증 결과",
        description: "유효하지 않은 음성입니다.",
        status: "error",
        position: "top-right",
      });
    } else {
      toast({
        title: "음성 검증 결과",
        description: "유효한 음성입니다",
        status: "success",
        position: "top-right",
      });
    }
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

    await playAudio(URL.createObjectURL(files[0]));

    const base64 = await toBase64(files[0]);
    const formData = new FormData();
    formData.append("audio", base64.toString());

    const res: {
      message: string;
      result: boolean;
    } = await fetch(`${BASE_URL}/audio/watermark/detect`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());

    if (!res.result) {
      toast({
        title: "음성 검증 결과",
        description: "유효하지 않은 음성입니다.",
        status: "error",
        position: "top-right",
      });
    } else {
      toast({
        title: "음성 검증 결과",
        description: "유효한 음성입니다",
        status: "success",
        position: "top-right",
      });
    }
  };

  return (
    <Box bgColor={"#eaeaea"}>
      <Container bgColor={"white"} minW={"330px"} px={0}>
        <VStack justifyContent={"space-between"} h={"100vh"} alignItems={"stretch"} spacing={0}>
          <HStack py={4} px={4} justifyContent={"center"}>
            <Image src={whoWhoLogo} w={"150px"} />
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
              <Avatar src={choonsikImg} size="full" position="absolute" top={0} />
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
  );
}

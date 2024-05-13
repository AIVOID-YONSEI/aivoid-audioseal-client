import { Center, Spinner } from "@chakra-ui/react";

export function SpinnerOverlay() {
  return (
    <Center pos={"fixed"} top={0} left={0} right={0} bottom={0} backgroundColor={"gray"} opacity={"0.5"}>
      <Spinner thickness="5px" speed="0.65s" emptyColor="gray.200" color="teal" size="xl" opacity={1} />
    </Center>
  );
}

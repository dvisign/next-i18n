"use client";
import {useEffect, useState} from "react";
import {initMock} from "@/mock";

const ClientLayout = ({children}) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const rs = await initMock();
      setReady(rs);
    })();
  }, []);
  return ready ? <>{children}</> : null;
};

export default ClientLayout;

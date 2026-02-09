/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { objAction } from "../common/action";
import { emitData } from "../common/functions";

interface IValues {
  socketClient?: Socket;
  handleEmitData: (type: keyof typeof objAction, data: any) => void;
}

const serviceWorkerContext = createContext<IValues>({
  handleEmitData: () => {},
});

const LayoutServiceWorker: FC<PropsWithChildren> = ({ children }) => {
  const [socketClient, setSocketClient] = useState<Socket>();

  useEffect(() => {
    const socket = io("http://103.199.18.107:5000", {
      addTrailingSlash: true,
      autoConnect: true,
    });

    socket.on("sync_data", async (result) => {
      try {
        const { type, data } = result;
        const newType = type as keyof typeof objAction;
        const action = objAction?.[newType];
        await action?.(data);
        // eslint-disable-next-line no-empty
      } catch {}
    });

    setSocketClient(socket);
    return () => {
      socket.off("sync_data");
      socket.disconnect();
    };
  }, []);

  const handleEmitData = useCallback(
    (type: keyof typeof objAction, data: any) => {
      if (!socketClient) return;
      return emitData(socketClient, type, data);
    },
    [socketClient]
  );

  const values = useMemo(() => {
    return {
      socketClient,
      handleEmitData,
    };
  }, [socketClient, handleEmitData]);
  
  return (
    <serviceWorkerContext.Provider value={values}>
      {children}
    </serviceWorkerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLayoutServiceWorker = () => useContext(serviceWorkerContext);

export default LayoutServiceWorker;

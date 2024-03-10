// Components/Editor.jsx
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const Editor = () => {
  const [value, setValue] = useState("");
  const [socket, setSocket] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const socketServer = io("http://localhost:5000");
    setSocket(socketServer);

    return () => {
      socketServer && socketServer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket === null) return;

    socket &&
      socket.once("load-content", (document) => {
        setValue(document);
      });
    socket && socket.emit("get-document", id);
  }, [socket, id]);

  useEffect(() => {
    if (socket === null) return;
    const interval = setInterval(() => {
      socket && socket.emit("save-document", value);
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [socket, value]);

  useEffect(() => {
    if (socket === null) return;

    const handleReceiveChanges = (data) => {
      setValue(data);
    };

    socket.on("receive-changes", handleReceiveChanges);

    return () => {
      socket.off("receive-changes", handleReceiveChanges);
    };
  }, [socket, value]);

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(content) => setValue(content)}
        className="textArea"
      />
    </div>
  );
};

export default Editor;

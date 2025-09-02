import { PropsWithChildren } from "react";
import "./app.scss";
import TaskLayout from "./Layout/TaskLayout";

function App({ children }: PropsWithChildren) {
  return <TaskLayout>{children}</TaskLayout>;
}

export default App;

import { useParams } from "react-router-dom";
import TextEditor from "../components/TextEditor";

export default function EditorPage() {
  const { id } = useParams();   // extracts :id from the URL

  return <TextEditor docId={id} />;
}